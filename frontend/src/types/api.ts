export type AuthResponse = {
    accessToken: string;
    userId: number;
    username: string;
    fullname: string;
};

export type SignupResponse = {
    userId: number;
    username: string;
};

export type RiskScore = {
    overall: number;
    grade: string;
    compensation: number;
    termination: number;
    nonCompete: number;
    ipRights: number;
    dataPrivacy: number;
};

export type Violation = {
    id?: number;
    chunkIndex: number;
    chunkText: string;
    legalPrinciple: string;
    matchedPolicy: string;
    confidence: number;
    severity: string;
    reasoning: string;
    plainSummary: string;
    sourceFile: string;
};

export type ContractRecord = {
    id: number;
    userId: number;
    filename: string;
    totalViolations: number;
    riskScore: RiskScore | null;
    violations: Violation[];
    uploadedAt: string;
};

export type Page<T> = {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
};
