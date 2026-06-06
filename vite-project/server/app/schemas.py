from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
   # description: Optional[str] = Field(..., max_length=10)
    status: Optional[str] = Field("pending", example="pending")
    tag: Optional[str] = Field(None, max_length=20)
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
   # description: Optional[str] = Field(None, max_length=10)
    status: Optional[str] = Field(None, example="pending")
    tag: Optional[str] = Field(None, max_length=20)
class TaskResponse(BaseModel):
    id: int
    title: str
    #description: Optional[str]
    status: Optional[str]
    #dead_line: Optional[datetime]
    created_at: datetime
    tag: Optional[str]
    class Config:
      from_attributes = True
                                                                                                                                                                                                                                                