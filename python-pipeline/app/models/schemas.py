from pydantic import BaseModel, Field
from typing import List, Optional

class Violation(BaseModel):
    chunk_index: int = Field(... , description="Sequence number of the paragraph")
    chunk_text: str = Field(..., description="Actual suspicious text from the contract")
    matched_policy: str = Field(..., description="Specific policy for this violation")
    confidence: float = Field(..., description="Similarity score (0 - 100)")
    source_file: Optional[str]=  Field(None, description="The source file of the policy document")

class AuditResponse(BaseModel):
    filename: str = Field(..., description="name of the contract analyzed")
    total_violations: int = Field(..., description="Total number of violations found")
    violations: List[Violation] = Field(default_factory=list, description="List of violations")
