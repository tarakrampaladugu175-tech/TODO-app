from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

# ── GET all tasks ─────────────────────────────────
@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    search: Optional[str] = Query(None),
    tag:    Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort:   Optional[str] = Query("newest"),
    db:     Session        = Depends(get_db)
):
    return crud.get_all_tasks(db, search, tag, status, sort)

# ── POST create task ──────────────────────────────
@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(
    task: schemas.TaskCreate,
    db:   Session = Depends(get_db)
):
    return crud.create_task(db, task)

# ── PATCH update task ─────────────────────────────
@router.patch("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task:    schemas.TaskUpdate,
    db:      Session = Depends(get_db)
):
    updated = crud.update_task(db, task_id, task)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated

# ── DELETE task ───────────────────────────────────
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db:      Session = Depends(get_db)
):
    deleted = crud.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}