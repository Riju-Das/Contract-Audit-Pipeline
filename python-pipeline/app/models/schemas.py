from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class Severity(str,Enum):
    RED="RED"
    YELLOW="YELLOW"
    GREEN="GREEN"


class Violation(BaseModel):
    chunk_index: int = Field(... , description="Sequence number of the paragraph")
    chunk_text: str = Field(..., description="Actual suspicious text from the contract")
    severity: Severity = Field(..., description="Classification: RED (Illegal), YELLOW (Risky), or GREEN (Acceptable)")
    legal_principle: str = Field(..., description="The underlying legal principle (e.g., Reasonableness, Consent)")
    matched_policy: str = Field(..., description="Specific policy for this violation")
    confidence: int = Field(..., description="Similarity score (0 - 100)")
    reasoning: str = Field(..., description="Reason for this violation")
    plain_summary: str = Field(default="", description="Plain English for non-lawyers")
    source_file: Optional[str]=  Field(None, description="The source file of the policy document")

class RiskScore(BaseModel):
    overall: int = Field(..., description="Overall risk score")
    grade:        str = Field(...,       description="LOW_RISK / MEDIUM_RISK / HIGH_RISK / CRITICAL_RISK")
    compensation: int = Field(default=0, description="Wage, overtime, deduction risk")
    termination:  int = Field(default=0, description="Termination, notice period risk")
    non_compete:  int = Field(default=0, description="Non-compete clause risk")
    ip_rights:    int = Field(default=0, description="IP ownership risk")
    data_privacy: int = Field(default=0, description="Data collection and monitoring risk")


class AuditResponse(BaseModel):
    filename: str = Field(..., description="name of the contract analyzed")
    total_violations: int = Field(..., description="Total number of violations found")
    risk_score:       Optional[RiskScore] = Field(None, description="Contract risk score")
    violations: List[Violation] = Field(default_factory=list, description="List of violations")



class ViolationVerdict(BaseModel):
    index : int
    severity: Literal["RED" , "YELLOW" , "GREEN"]
    legal_principle: str  = Field(default="")
    confidence: int = Field(..., ge=0 , le=100)
    explanation : str
    applicable_laws : List[str] = Field(default_factory=list)
    needs_requery: bool = Field(default= False)
    suggested_query : str = Field(default="")

class BatchVerdictResponse(BaseModel):
    verdicts: List[ViolationVerdict]


class PlainSummaryItem(BaseModel):
    index:        int
    plain_summary: str


class PlainSummaryResponse(BaseModel):
    summaries: List[PlainSummaryItem]