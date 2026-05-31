import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
const stats = [
	{ label: "Audit time", value: "4.6 min" },
	{ label: "Coverage", value: "97%" },
	{ label: "Policies", value: "128" },
];

const aboutHighlights = [
	{
		title: "Policy-first review",
		description:
			"Map obligations to your internal policies and surface deviations with plain-language summaries.",
	},
	{
		title: "Fast intake",
		description:
			"Upload contracts, ingest PDFs, and normalize versions without manual prep work.",
	},
	{
		title: "Action-ready outputs",
		description:
			"Export findings, assign owners, and track remediation in one place.",
	},
];

const container = "mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8";

export function Landing() {
	return (
		<div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
			<LandingHeader />
			<main className="relative">
				{/* Hero Section */}
				<section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden py-24 md:py-32 bg-gradient-to-b from-background via-background to-secondary/30">
					<div aria-hidden="true" className="pointer-events-none absolute inset-0">
						<div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
					</div>
					<div className={container}>
						<div className="mx-auto flex max-w-4xl flex-col items-center text-center relative z-10">

							<h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl text-foreground">
								Audit contracts with total clarity.
							</h1>
							<p className="mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
								A focused workflow for intake, review, and risk scoring. Turn complex legal obligations into clear, actionable data in minutes instead of days.
							</p>
							<div className="mt-10 flex flex-wrap justify-center gap-4">
								<Button asChild size="lg" className="rounded-full px-8 text-base h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105">
									<Link to="/signup">Get started for free</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									size="lg"
									className="rounded-full border-border bg-background px-8 text-base h-12 text-foreground hover:bg-muted transition-all"
								>
									<Link to="/app/contracts">Open dashboard</Link>
								</Button>
							</div>
							<div className="mt-16 grid w-full gap-6 text-left sm:grid-cols-3">
								{stats.map((stat) => (
									<div
										key={stat.label}
										className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all hover:border-primary/50 hover:bg-card hover:shadow-md"
									>
										<div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
										<p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
											{stat.label}
										</p>
										<p className="mt-3 text-3xl font-bold text-foreground">
											{stat.value}
										</p>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="relative border-t border-border py-24 bg-background">
					<div className={container}>
						<div className="mx-auto max-w-2xl text-center">
							<div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground mb-4">
								Enterprise Grade
							</div>
							<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
								Built for precise contract reviews.
							</h2>
							<p className="mt-4 text-lg text-muted-foreground">
								Everything you need to analyze obligations, surface risk, and move faster with absolute confidence.
							</p>
						</div>
						<div className="mt-16 grid gap-8 sm:grid-cols-3">
							{aboutHighlights.map((item) => (
								<div key={item.title} className="flex flex-col rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
									<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									</div>
									<h3 className="text-xl font-semibold text-foreground">
										{item.title}
									</h3>
									<p className="mt-3 text-base text-muted-foreground leading-relaxed">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>
			<LandingFooter />
		</div>
	);
}

function LandingHeader() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
			<div className={container}>
				<nav className="flex h-16 items-center justify-between">
					<Link to="/" className="flex items-center gap-2 group">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<polyline points="14 2 14 8 20 8" />
								<line x1="16" y1="13" x2="8" y2="13" />
								<line x1="16" y1="17" x2="8" y2="17" />
								<polyline points="10 9 9 9 8 9" />
							</svg>
						</div>
						<span className="text-base font-bold tracking-tight text-foreground">
							Contract Audit
						</span>
					</Link>
					<div className="flex items-center gap-2">
                        <ThemeToggle />
						<Button
							asChild
							variant="ghost"
							className="hidden rounded-full text-muted-foreground hover:bg-muted sm:inline-flex"
						>
							<Link to="/login">Sign in</Link>
						</Button>
						<Button asChild className="rounded-full px-4">
							<Link to="/signup">Get started</Link>
						</Button>
					</div>
				</nav>
			</div>
		</header>
	);
}

function LandingFooter() {
	return (
		<footer className="border-t border-border py-10">
			<div className={container}>
				<div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
									<polyline points="14 2 14 8 20 8" />
								</svg>
							</div>
							<span className="text-sm font-bold tracking-tight text-foreground">
								Contract Audit
							</span>
						</div>
						<p className="text-sm text-muted-foreground">
							AI-powered contract review for modern legal teams.
						</p>
					</div>
					<div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
						<Link className="transition hover:text-foreground" to="/login">
							Sign in
						</Link>
						<Link className="transition hover:text-foreground" to="/signup">
							Get started
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
