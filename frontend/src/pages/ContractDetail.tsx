import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';
import type { ContractRecord, Violation } from '../types/api';
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, RefreshCw, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const severityMeta: Record<string, { label: string; tone: string; text: string }> = {
    RED: { label: 'Critical', tone: 'border-destructive text-destructive', text: 'text-destructive' },
    YELLOW: { label: 'Warning', tone: 'border-yellow-500 text-yellow-500', text: 'text-yellow-500' },
    GREEN: { label: 'Low', tone: 'border-emerald-500 text-emerald-500', text: 'text-emerald-500' },
};

function SeverityBadge({ severity }: { severity: string }) {
    const meta = severityMeta[severity] ?? { label: severity, tone: 'border-border text-muted-foreground', text: 'text-muted-foreground' };
    return (
        <span className={cn('inline-flex items-center border px-2 py-0.5 text-xs', meta.tone)}>
            {meta.label}
        </span>
    );
}

function RiskRow({ label, value }: { label: string; value: number }) {
    const isHigh = value > 70;
    const isMedium = value > 40;
    const barClass = isHigh ? 'bg-destructive' : isMedium ? 'bg-yellow-500' : 'bg-emerald-500';
    const textClass = isHigh ? 'text-destructive' : isMedium ? 'text-yellow-500' : 'text-emerald-500';

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span>{label}</span>
                <span className={cn('font-semibold', textClass)}>{value}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted">
                <div className={cn('h-full', barClass)} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function FindingItem({ violation }: { violation: Violation }) {
    const meta = severityMeta[violation.severity] ?? {
        label: violation.severity,
        tone: 'border-border text-muted-foreground',
        text: 'text-muted-foreground',
    };

    return (
        <details className="border border-border bg-card">
            <summary className="cursor-pointer px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <SeverityBadge severity={violation.severity} />
                            <span className={cn('text-xs font-semibold uppercase tracking-[0.2em]', meta.text)}>
                                Clause {violation.chunkIndex + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Confidence {Math.round(violation.confidence > 1 ? violation.confidence : violation.confidence * 100)}%
                            </span>
                        </div>
                        <div className="text-sm font-semibold text-foreground">
                            {violation.plainSummary || violation.legalPrinciple || 'Flagged Clause'}
                        </div>
                    </div>
                    <span className="text-xs text-muted-foreground">View details</span>
                </div>
            </summary>
            <div className="border-t border-border px-5 py-4">
                <div className="grid gap-6 md:grid-cols-2">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Reasoning</p>
                        <p className="mt-2 text-sm text-foreground">{violation.reasoning}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Policy match</p>
                        <p className="mt-2 text-sm text-foreground">{violation.matchedPolicy}</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Source clause</p>
                    <div className="mt-2 border border-border bg-background px-4 py-3 text-xs text-foreground/80">
                        {violation.chunkText}
                    </div>
                </div>
            </div>
        </details>
    );
}

function ProcessingState() {
    return (
        <div className="border border-border bg-card relative overflow-hidden flex flex-col items-center justify-center px-6 py-16 min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center space-y-8">
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" />
                    <div className="absolute inset-2 border-r-2 border-primary/50 rounded-full animate-[spin_2s_reverse_infinite]" />
                    <div className="absolute inset-4 border-b-2 border-primary/20 rounded-full animate-[spin_3s_infinite]" />
                    <FileText className="h-8 w-8 text-primary animate-pulse" />
                </div>

                <div className="text-center space-y-3">
                    <h3 className="text-xl font-semibold text-foreground animate-pulse">Analyzing contract...</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                        Our AI is currently scanning the document for clauses, risks, and compliance violations. This usually takes around 30 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}

export function ContractDetail() {
    const { apiFetchJson } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [contract, setContract] = useState<ContractRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm("Are you sure you want to delete this contract? This action cannot be undone.")) return;
        setDeleting(true);
        try {
            await apiFetchJson(`/api/v1/contracts/${id}`, { method: 'DELETE' });
            navigate('/app/contracts');
        } catch (err: any) {
            alert(err?.message || 'Failed to delete contract');
            setDeleting(false);
        }
    };

    const loadContract = useCallback(async (showLoading = false) => {
        if (!id) return;
        if (showLoading) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }
        try {
            const r = await apiFetchJson<ContractRecord>(`/api/v1/contracts/${id}`);
            setContract(r);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load contract');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [apiFetchJson, id]);

    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const stopPolling = useCallback(() => {
        if (pollRef.current !== null) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    useEffect(() => { loadContract(true); }, [loadContract]);

    useEffect(() => {
        if (contract && contract.totalViolations >= 0 && contract.riskScore) {
            stopPolling();
            return;
        }
        if (pollRef.current !== null) return;
        pollRef.current = setInterval(async () => {
            if (!id) return;
            try {
                const r = await apiFetchJson<ContractRecord>(`/api/v1/contracts/${id}`);
                setContract(r);
                setError(null);
                if (r.totalViolations >= 0 && r.riskScore) {
                    stopPolling();
                }
            } catch (err: any) {
                console.warn('Poll failed:', err?.message);
            }
        }, 3000);
        return stopPolling;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contract?.totalViolations, contract?.riskScore, id]);

    const violations = useMemo(() => {
        const priority = { RED: 3, YELLOW: 2, GREEN: 1 };
        return [...(contract?.violations || [])].sort((a, b) =>
            (priority[b.severity as keyof typeof priority] || 0) -
            (priority[a.severity as keyof typeof priority] || 0)
        );
    }, [contract?.violations]);

    const severityCounts = useMemo(() => {
        return violations.reduce(
            (acc, violation) => {
                if (violation.severity === 'RED') acc.red += 1;
                if (violation.severity === 'YELLOW') acc.yellow += 1;
                if (violation.severity === 'GREEN') acc.green += 1;
                return acc;
            },
            { red: 0, yellow: 0, green: 0 },
        );
    }, [violations]);

    if (loading) {
        return (
            <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 py-10 text-muted-foreground">
                <Spinner size={32} />
                <span className="text-sm">Loading contract data...</span>
            </div>
        );
    }

    if (error || !contract) {
        return (
            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
                <Link to="/app/contracts">
                    <Button variant="ghost" size="sm" className="rounded-none">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to contracts
                    </Button>
                </Link>
                <div className="border border-border bg-card p-8 text-center">
                    <XCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
                    <h2 className="text-lg font-semibold">Audit not found</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {error || 'The requested contract audit could not be retrieved.'}
                    </p>
                </div>
            </div>
        );
    }

    const isProcessing = contract.totalViolations < 0 || !contract.riskScore;

    const riskScore = contract.riskScore;
    const scoreValue = riskScore?.overall ?? 0;
    const scoreGrade = riskScore?.grade ?? '—';
    const scoreColor = scoreValue > 70 ? 'text-destructive' : scoreValue > 40 ? 'text-yellow-500' : 'text-emerald-500';

    return (
        <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                    <Link to="/app/contracts">
                        <Button variant="ghost" size="sm" className="rounded-none">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to contracts
                        </Button>
                    </Link>
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contract audit</p>
                        <h1 className="text-3xl font-semibold">{contract.filename}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span>Audit ID {contract.id}</span>
                            <span>Uploaded {formatDate(contract.uploadedAt)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        className="rounded-none text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? <Spinner size={16} className="mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                        Delete
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-none"
                        onClick={() => loadContract(false)}
                        disabled={refreshing || deleting}
                    >
                        <RefreshCw className={cn('mr-2 h-4 w-4', refreshing && 'animate-spin')} />
                        Refresh
                    </Button>
                </div>
            </header>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        {isProcessing ? (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Spinner size={20} />
                                Processing audit pipeline
                            </div>
                        ) : contract.totalViolations === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" /> Clear
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertTriangle className="h-4 w-4" /> Attention required
                            </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                            {contract.totalViolations < 0 ? '—' : `${contract.totalViolations} total violations`}
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="border border-border bg-background px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Critical</p>
                            <p className="mt-2 text-lg font-semibold text-destructive">{severityCounts.red}</p>
                        </div>
                        <div className="border border-border bg-background px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Warning</p>
                            <p className="mt-2 text-lg font-semibold text-yellow-500">{severityCounts.yellow}</p>
                        </div>
                        <div className="border border-border bg-background px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Low</p>
                            <p className="mt-2 text-lg font-semibold text-emerald-500">{severityCounts.green}</p>
                        </div>
                    </div>
                </div>

                <div className="border border-border bg-card p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Risk score</p>
                    {isProcessing ? (
                        <div className="mt-6 flex flex-col items-center justify-center py-10 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                            <Spinner size={28} className="text-primary mb-4 relative z-10" />
                            <p className="text-sm font-semibold text-foreground relative z-10">Calculating Risk Matrix</p>
                            <p className="text-xs text-muted-foreground mt-2 relative z-10 max-w-[200px] mx-auto leading-relaxed">
                                Correlating policy violations with legal precedents...
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-baseline justify-between">
                                <div className={cn('text-4xl font-semibold tabular-nums', scoreColor)}>
                                    {scoreValue}%
                                </div>
                                <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                                    Grade {scoreGrade}
                                </div>
                            </div>
                            {riskScore && (
                                <div className="space-y-3">
                                    <RiskRow label="Compensation" value={riskScore.compensation} />
                                    <RiskRow label="Termination" value={riskScore.termination} />
                                    <RiskRow label="Non-compete" value={riskScore.nonCompete} />
                                    <RiskRow label="IP rights" value={riskScore.ipRights} />
                                    <RiskRow label="Data privacy" value={riskScore.dataPrivacy} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Findings</h2>
                    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ordered by severity</span>
                </div>
                {isProcessing ? (
                    <ProcessingState />
                ) : violations.length === 0 ? (
                    <div className="border border-border bg-card px-6 py-10 text-center">
                        <CheckCircle2 className="mx-auto mb-3 h-6 w-6 text-emerald-500" />
                        <p className="text-sm font-semibold">Audit clean</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                            No compliance violations were detected in this contract.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {violations.map((violation) => (
                            <FindingItem key={violation.chunkIndex} violation={violation} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
