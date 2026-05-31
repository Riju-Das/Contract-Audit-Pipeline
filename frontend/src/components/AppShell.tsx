import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AppShell() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try { await logout(); } catch { }
        navigate('/login', { replace: true });
    };

    const initials = user?.username
        ? user.username.slice(0, 2).toUpperCase()
        : 'AU';

    const closeSidebar = () => setSidebarOpen(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        cn(
            'flex items-center gap-3 px-3 py-2 text-sm transition',
            isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        );

    return (
        <div className="min-h-screen bg-background text-foreground lg:flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            <aside className="hidden min-h-screen w-64 border-r border-border bg-card lg:flex lg:flex-col">
                <Link to="/app/contracts" className="flex items-center gap-3 border-b border-border px-6 py-5">
                    <span className="text-sm font-bold tracking-tight text-foreground">Contract Audit</span>
                </Link>
                <nav className="flex-1 px-4 py-6">
                    <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Workspace</div>
                    <div className="mt-3 space-y-1">
                        <NavLink to="/app/contracts" className={navLinkClass} onClick={closeSidebar}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            Contracts
                        </NavLink>
                        <NavLink to="/app/upload" className={navLinkClass} onClick={closeSidebar}>
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            New audit
                        </NavLink>
                    </div>
                    <div className="mt-8 text-xs uppercase tracking-[0.3em] text-muted-foreground">Account</div>
                    <button
                        className="mt-3 flex w-full items-center gap-3 px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        onClick={handleLogout}
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign out
                    </button>
                </nav>
                <div className="border-t border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center border border-border bg-muted text-xs font-semibold">
                                {initials}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-foreground">{user?.username ?? 'User'}</div>
                                <div className="text-xs text-muted-foreground">Analyst</div>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card px-4 py-6 transition-transform lg:hidden',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                )}
            >
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <Link to="/app/contracts" className="flex items-center gap-3" onClick={closeSidebar}>
                        <span className="text-sm font-bold tracking-tight text-foreground">Contract Audit</span>
                    </Link>
                    <button
                        className="text-sm text-muted-foreground"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        Close
                    </button>
                </div>
                <nav className="mt-6 space-y-1">
                    <NavLink to="/app/contracts" className={navLinkClass} onClick={closeSidebar}>
                        Contracts
                    </NavLink>
                    <NavLink to="/app/upload" className={navLinkClass} onClick={closeSidebar}>
                        New audit
                    </NavLink>
                </nav>
                <div className="mt-8 border-t border-border pt-4">
                    <button
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            <div className="flex min-h-screen flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
                    <button
                        className="text-sm text-muted-foreground"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        Menu
                    </button>
                    <Link to="/app/contracts" className="text-sm font-medium text-foreground truncate ml-2 mr-auto hidden sm:block">
                        Contract Audit
                    </Link>
                    <div className="flex items-center gap-2 ml-auto">
                        <ThemeToggle />
                        <div className="flex h-8 w-8 items-center justify-center border border-border bg-muted text-xs font-semibold">
                            {initials}
                        </div>
                    </div>
                </header>
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
