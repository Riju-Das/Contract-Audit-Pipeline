import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/format';
import type { ContractRecord, Page } from '../types/api';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, FileText, ArrowRight, RefreshCw, Upload } from 'lucide-react';

function RiskBar({ score }: { score: number }) {
    const isHigh = score > 70;
    const isMedium = score > 40;

    const colorClass = isHigh ? 'bg-destructive' : isMedium ? 'bg-yellow-500' : 'bg-emerald-500';
    const textClass = isHigh ? 'text-destructive' : isMedium ? 'text-yellow-500' : 'text-emerald-500';

    return (
        <div className="flex items-center gap-3 w-full max-w-[140px]">
            <span className={cn("text-xs font-semibold tabular-nums min-w-[40px]", textClass)}>
                {score}%
            </span>
            <div className="flex-1 h-1.5 bg-muted overflow-hidden">
                <div className={cn("h-full transition-all duration-500", colorClass)} style={{ width: `${score}%` }} />
            </div>
        </div>
    );
}

export function Contracts() {
    const { apiFetchJson } = useAuth();
    const [data, setData] = useState<Page<ContractRecord> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const size = 15;

    const loadContracts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiFetchJson<Page<ContractRecord>>(
                `/api/v1/contracts?page=${page}&size=${size}`
            );
            setData(result);
        } catch (err: any) {
            setError(err?.message || 'Failed to load contracts');
        } finally {
            setLoading(false);
        }
    }, [apiFetchJson, page]);

    useEffect(() => { loadContracts(); }, [loadContracts]);

    const contracts = data?.content ?? [];
    const totalAudits = data?.totalElements ?? 0;
    const processingCount = contracts.filter(c => c.totalViolations < 0 || !c.riskScore).length;
    const flaggedCount = contracts.filter(c => c.totalViolations > 0).length;
    const clearCount = contracts.filter(c => c.totalViolations === 0 && c.riskScore).length;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Dashboard</p>
                        <h1 className="text-3xl font-semibold">Contracts</h1>
                        <p className="text-sm text-muted-foreground">
                            Review audits, compliance flags, and risk scores in one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            className="rounded-none"
                            onClick={loadContracts}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            Refresh
                        </Button>
                        <Button asChild className="rounded-none">
                            <Link to="/app/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                New audit
                            </Link>
                        </Button>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="border border-border bg-card p-5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Total audits</span>
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="mt-3 text-2xl font-semibold">
                            <AnimatedCounter value={totalAudits} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">All processed documents</p>
                    </div>
                    <div className="border border-border bg-card p-5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Processing</span>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-yellow-500">
                            <AnimatedCounter value={processingCount} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">In queue</p>
                    </div>
                    <div className="border border-border bg-card p-5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Flagged</span>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-destructive">
                            <AnimatedCounter value={flaggedCount} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Requires attention</p>
                    </div>
                    <div className="border border-border bg-card p-5">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Clear</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-3 text-2xl font-semibold text-emerald-500">
                            <AnimatedCounter value={clearCount} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">No violations</p>
                    </div>
                </section>

                <section className="border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div>
                            <h2 className="text-sm font-semibold">Document log</h2>
                            <p className="text-xs text-muted-foreground">{totalAudits} total audits</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-muted-foreground">
                            <Spinner />
                            <span className="text-sm">Loading agreements...</span>
                        </div>
                    ) : error ? (
                        <div className="px-6 py-16 text-center">
                            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-destructive" />
                            <p className="text-sm font-semibold text-foreground">Unable to load contracts</p>
                            <p className="mt-2 text-xs text-muted-foreground">{error}</p>
                        </div>
                    ) : contracts.length > 0 ? (
                        <div className="w-full overflow-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-border bg-muted text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                    <tr>
                                        <th className="px-4 sm:px-5 py-3 text-left font-medium">Document</th>
                                        <th className="px-4 sm:px-5 py-3 text-left font-medium">Status</th>
                                        <th className="hidden md:table-cell px-5 py-3 text-left font-medium">Violations</th>
                                        <th className="hidden lg:table-cell px-5 py-3 text-left font-medium">Risk</th>
                                        <th className="hidden sm:table-cell px-5 py-3 text-left font-medium">Uploaded</th>
                                        <th className="px-4 sm:px-5 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {contracts.map((contract) => (
                                        <tr key={contract.id} className="hover:bg-muted group">
                                            <td className="px-4 sm:px-5 py-4 font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="hidden sm:flex h-8 w-8 items-center justify-center border border-border bg-muted shrink-0">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <Link
                                                        to={`/app/contracts/${contract.id}`}
                                                        className="max-w-[120px] sm:max-w-[220px] md:max-w-[320px] truncate hover:underline block"
                                                    >
                                                        {contract.filename}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-5 py-4">
                                                {contract.totalViolations < 0 || !contract.riskScore ? (
                                                    <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs text-muted-foreground whitespace-nowrap">
                                                        Processing
                                                    </span>
                                                ) : contract.totalViolations === 0 ? (
                                                    <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs text-emerald-500 whitespace-nowrap">
                                                        Clear
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs text-destructive whitespace-nowrap">
                                                        Flagged
                                                    </span>
                                                )}
                                            </td>
                                            <td className="hidden md:table-cell px-5 py-4">
                                                {contract.totalViolations < 0
                                                    ? <span className="text-muted-foreground">—</span>
                                                    : contract.totalViolations === 0
                                                        ? <span className="text-emerald-500 font-semibold">0</span>
                                                        : <span className="text-destructive font-semibold">{contract.totalViolations}</span>
                                                }
                                            </td>
                                            <td className="hidden lg:table-cell px-5 py-4">
                                                {contract.riskScore
                                                    ? <RiskBar score={contract.riskScore.overall} />
                                                    : <span className="text-muted-foreground">—</span>
                                                }
                                            </td>
                                            <td className="hidden sm:table-cell px-5 py-4 text-muted-foreground whitespace-nowrap">
                                                {formatDate(contract.uploadedAt)}
                                            </td>
                                            <td className="px-4 sm:px-5 py-4 text-right">
                                                <Link to={`/app/contracts/${contract.id}`}>
                                                    <Button variant="ghost" size="sm" className="rounded-none px-2 sm:px-3">
                                                        <span className="hidden sm:inline">View</span> <ArrowRight className="sm:ml-2 h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border bg-muted text-muted-foreground">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No agreements yet</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Upload a contract PDF to run your first compliance audit.
                            </p>
                            <Link to="/app/upload" className="mt-6 inline-flex">
                                <Button className="rounded-none">Upload contract</Button>
                            </Link>
                        </div>
                    )}

                    {data && data.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-border px-4 py-4 text-xs text-muted-foreground">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none"
                                disabled={data.first}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                Previous
                            </Button>
                            <span>Page {data.number + 1} of {data.totalPages}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-none"
                                disabled={data.last}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
