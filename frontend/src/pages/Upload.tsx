import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Spinner } from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import type { ContractRecord } from '../types/api';
import { cn } from '@/lib/utils';
import { Upload as UploadIcon, FileText, X, AlertCircle, Shield, Clock, Zap } from 'lucide-react';

function formatFileSize(bytes?: number) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
}

export function Upload() {
    const { apiFetchJson } = useAuth();
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!file) { setError('Please select a PDF file to scan.'); return; }
        setError(null);
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const contract = await apiFetchJson<ContractRecord>('/api/v1/contracts/upload', {
                method: 'POST',
                body: formData,
            });
            navigate(`/app/contracts/${contract.id}`);
        } catch (err: any) {
            setError(err?.message || 'Upload and audit failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type === 'application/pdf') {
            setFile(dropped);
            setError(null);
        } else {
            setError('Only PDF files are accepted.');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto w-full max-w-6xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">New Audit</p>
                        <h1 className="text-3xl font-semibold">Upload Agreement</h1>
                        <p className="text-sm text-muted-foreground">
                            Start an automated compliance scan by uploading a contract PDF.
                        </p>
                    </div>
                </header>

                <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                    <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                        <label
                            className={cn(
                                "flex flex-col items-center justify-center border-2 border-dashed border-border bg-card p-12 text-center transition-colors hover:bg-muted cursor-pointer",
                                dragOver && "border-solid border-primary bg-muted"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                className="hidden"
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setFile(f);
                                    if (f) setError(null);
                                }}
                            />
                            <div className="flex h-12 w-12 items-center justify-center border border-border bg-background text-muted-foreground mb-4">
                                <UploadIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold">
                                {dragOver ? 'Drop your PDF here' : 'Drag & drop or click to browse'}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                PDF files only — up to 25 MB
                            </p>
                            
                            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5" /> End-to-end encrypted
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" /> Results in ~30s
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5" /> AI-powered analysis
                                </span>
                            </div>
                        </label>

                        {file && (
                            <div className="flex items-center justify-between border border-border bg-card px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted text-muted-foreground">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Remove file"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full rounded-none h-12"
                        >
                            {loading ? (
                                <>
                                    <Spinner size={16} className="mr-2" />
                                    Running Compliance Scan…
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Run Compliance Scan
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="border border-border bg-card p-6 h-fit">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                                How it works
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="space-y-6">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-0.5 text-xs font-bold text-muted-foreground">01</div>
                                <h4 className="text-sm font-semibold mb-1">Document Ingestion</h4>
                                <p className="text-xs text-muted-foreground">
                                    Spring Boot gateway saves file metadata and queues the document via Kafka.
                                </p>
                            </div>
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-0.5 text-xs font-bold text-muted-foreground">02</div>
                                <h4 className="text-sm font-semibold mb-1">Clause Extraction</h4>
                                <p className="text-xs text-muted-foreground">
                                    Each clause is parsed to markdown, embedded, and checked against ChromaDB policy vectors.
                                </p>
                            </div>
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-0.5 text-xs font-bold text-muted-foreground">03</div>
                                <h4 className="text-sm font-semibold mb-1">Compliance Scan</h4>
                                <p className="text-xs text-muted-foreground">
                                    Multi-stage AI reasoning evaluates conflicts, assigns severity rankings, and translates legalese.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
