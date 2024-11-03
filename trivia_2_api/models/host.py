from pydantic import BaseModel
from uuid import UUID

class Host(BaseModel):
    id: UUID
    host_name: str
    hashed_password: str

class HostRequest(BaseModel):
    host_name: str
    hashed_password: str