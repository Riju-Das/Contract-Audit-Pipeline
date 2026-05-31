import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

export function Signup() {
    const { signup, login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        password: "",
        fullname: "",
        email: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signup(form);
            await login(form.username, form.password);
            navigate("/app/contracts", { replace: true });
        } catch (err: any) {
            setError(err?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b border-border">
                <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
                    <Link to="/" className="flex items-center gap-3">
                        <span className="text-sm font-bold tracking-tight text-foreground">Contract Audit</span>
                    </Link>
                    <Button asChild variant="ghost" className="rounded-none text-muted-foreground hover:bg-muted">
                        <Link to="/login">Sign in</Link>
                    </Button>
                </div>
            </header>
            <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-4xl items-center px-4 py-16 sm:px-6">
                <div className="w-full max-w-md border border-border bg-card p-6 sm:p-8">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Create workspace</p>
                        <h1 className="text-3xl font-semibold">Create account</h1>
                        <p className="text-sm text-muted-foreground">
                            Start auditing contracts with a secure workspace.
                        </p>
                    </div>
                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <label className="block text-sm text-muted-foreground">
                            Full name
                            <input
                                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                                value={form.fullname}
                                onChange={handleChange("fullname")}
                                required
                            />
                        </label>
                        <label className="block text-sm text-muted-foreground">
                            Email
                            <input
                                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                                type="email"
                                value={form.email}
                                onChange={handleChange("email")}
                                required
                            />
                        </label>
                        <label className="block text-sm text-muted-foreground">
                            Username
                            <input
                                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                                value={form.username}
                                onChange={handleChange("username")}
                                required
                            />
                        </label>
                        <label className="block text-sm text-muted-foreground">
                            Password
                            <input
                                className="mt-2 w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                                type="password"
                                value={form.password}
                                onChange={handleChange("password")}
                                required
                            />
                        </label>
                        {error ? <p className="text-sm text-destructive">{error}</p> : null}
                        <Button type="submit" className="w-full rounded-none" disabled={loading}>
                            {loading ? <Spinner size={16} /> : "Create account"}
                        </Button>
                    </form>
                    <p className="mt-6 text-sm text-muted-foreground">
                        Already have access? <Link className="text-foreground underline" to="/login">Sign in</Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
