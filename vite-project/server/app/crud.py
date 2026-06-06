from sqlalchemy.orm import Session
from . import models, schemas

# ── READ ──────────────────────────────────────────
def get_all_tasks(
    db:     Session,
    search: str = None,
    tag:    str = None,
    status: str = None,
    sort:   str = "newest"
):
    query = db.query(models.Task)

    if search:
        query = query.filter(
            models.Task.title.ilike(f"%{search}%")
        )
    if tag:
        query = query.filter(models.Task.tag == tag)

    if status:
        query = query.filter(models.Task.status == status)

    if sort == "newest":
        query = query.order_by(models.Task.created_at.desc())
    elif sort == "oldest":
        query = query.order_by(models.Task.created_at.asc())
    elif sort == "title":
        query = query.order_by(models.Task.title.asc())

    return query.all()

# ── CREATE ────────────────────────────────────────
def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        tag=task.tag
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# ── UPDATE ────────────────────────────────────────
def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if not db_task:
        return None

    if task.title  is not None: db_task.title  = task.title
    if task.tag    is not None: db_task.tag    = task.tag
    if task.status is not None: db_task.status = task.status

    db.commit()
    db.refresh(db_task)
    return db_task

# ── DELETE ────────────────────────────────────────
def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(
        models.Task.id == task_id
    ).first()

    if db_task:
        db.delete(db_task)
        db.commit()

    return db_task