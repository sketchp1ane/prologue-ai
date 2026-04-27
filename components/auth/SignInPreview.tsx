import { Briefcase, Check, FileText, Sparkles } from "lucide-react";

const previewColumns = [
  {
    title: "Applied",
    count: 4,
    items: [
      { company: "Notion", role: "Senior Designer", dot: "bg-neutral-800" },
      { company: "Linear", role: "UX Researcher", dot: "bg-indigo-500" },
    ],
  },
  {
    title: "Interview",
    count: 2,
    items: [{ company: "Airbnb", role: "Design Lead", dot: "bg-rose-500" }],
  },
];

const matches = ["Product Design", "Design Systems", "User Research"];

export function SignInPreview() {
  return (
    <div className="relative w-full max-w-md" aria-hidden="true">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-3 text-[11px] text-muted-foreground">
            Prologue — Workspace
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">
                Application Board
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">6 active</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {previewColumns.map((column) => (
              <div key={column.title} className="min-w-0">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="truncate text-[11px] font-medium text-foreground">
                    {column.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {column.count}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.items.map((item) => (
                    <div
                      key={`${column.title}-${item.company}`}
                      className="rounded-lg border border-border bg-background p-2.5"
                    >
                      <div className="mb-1 flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                        <span className="truncate text-[11px] font-medium text-foreground">
                          {item.company}
                        </span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating: resume score card */}
      <div className="absolute -bottom-6 -left-6 w-56 rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-foreground">
              Resume Match
            </p>
            <p className="text-[10px] text-muted-foreground">
              vs. Product Designer JD
            </p>
          </div>
          <span className="ml-auto text-sm font-semibold text-foreground">
            86
          </span>
        </div>
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[86%] rounded-full bg-primary" />
        </div>
        <div className="flex flex-wrap gap-1">
          {matches.map((match) => (
            <span
              key={match}
              className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary"
            >
              {match}
            </span>
          ))}
        </div>
      </div>

      {/* Floating: AI rewrite chip */}
      <div className="absolute -right-4 -top-5 hidden w-60 rounded-xl border border-border bg-card p-3 shadow-xl xl:block">
        <div className="mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-medium text-primary">
            AI Rewrite
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-[11px] leading-relaxed text-foreground">
          Designed intuitive interfaces for 3+ products, lifting task completion
          via research and rapid prototyping.
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
          <Check className="h-3 w-3 text-foreground" />
          <span className="text-foreground">Applied to bullet 02</span>
        </div>
      </div>
    </div>
  );
}
