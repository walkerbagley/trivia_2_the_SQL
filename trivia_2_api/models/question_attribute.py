from pydantic import BaseModel
from uuid import UUID

class QuestionAttribute(BaseModel):
    question: UUID
    attribute: str