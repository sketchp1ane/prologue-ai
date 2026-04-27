import { Check, FileText, Sparkles, Target } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: FileText, label: "AI Resume Parsing" },
  { icon: Target, label: "JD Match Analysis" },
  { icon: Sparkles, label: "Bullet Rewriting" },
];

export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight text-foreground">Prologue</span>
          <span className="text-sm text-muted-foreground">/ 第一页</span>
        </Link>
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-md">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-powered job search</span>
        </div>

        <h2 className="mb-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground">
          Your AI job-search workspace.
        </h2>
        <p className="mb-8 text-pretty leading-relaxed text-muted-foreground">
          Parse resumes, analyze job descriptions, and prepare for interviews — all in one focused
          workspace.
        </p>

        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
              <Check className="ml-auto h-4 w-4 text-primary" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats card */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-6 rounded-2xl border border-border bg-card/80 px-6 py-4 shadow-lg backdrop-blur-sm">
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">10K+</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">50K+</p>
            <p className="text-xs text-muted-foreground">Resumes</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-semibold text-foreground">85%</p>
            <p className="text-xs text-muted-foreground">Match Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
