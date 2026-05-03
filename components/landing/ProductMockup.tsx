import {
  BarChart3,
  Briefcase,
  Check,
  FileText,
  Library,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Settings,
} from "lucide-react";

import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type LandingDictionary = AppDictionary["landing"];

function getSidebarItems(dictionary: LandingDictionary) {
  return [
    { icon: Briefcase, label: dictionary.mockup.applications, active: true },
    { icon: FileText, label: dictionary.mockup.resumes, active: false },
    { icon: ListChecks, label: dictionary.mockup.jobDescriptions, active: false },
    { icon: Library, label: dictionary.mockup.bulletLibrary, active: false },
    { icon: MessageSquare, label: dictionary.mockup.interviews, active: false },
    { icon: BarChart3, label: dictionary.mockup.analytics, active: false },
    { icon: Settings, label: dictionary.mockup.settings, active: false },
  ];
}

function getApplicationColumns(dictionary: LandingDictionary) {
  return [
    {
      title: dictionary.mockup.columns[0],
    count: 3,
    cards: [
      { company: "Acme", role: "Product Designer", color: "bg-blue-500" },
      { company: "Figma", role: "Product Designer", color: "bg-orange-500" },
    ],
  },
  {
    title: dictionary.mockup.columns[1],
    count: 2,
    cards: [
      { company: "Notion", role: "Senior Product Designer", color: "bg-neutral-800" },
      { company: "Linear", role: "UX Researcher", color: "bg-indigo-500" },
    ],
  },
  {
    title: dictionary.mockup.columns[2],
    count: 1,
    cards: [{ company: "Airbnb", role: "Design Lead", color: "bg-rose-500" }],
  },
  {
    title: dictionary.mockup.columns[3],
    count: 0,
    cards: [],
  },
  ];
}

const strongMatches = ["Product Design", "Figma", "User Research", "Design Systems"];

export function ProductMockup({
  dictionary,
}: {
  dictionary: LandingDictionary;
}) {
  const sidebarItems = getSidebarItems(dictionary);
  const applicationColumns = getApplicationColumns(dictionary);

  return (
    <div className="relative w-full max-w-2xl" aria-label={dictionary.aria.productPreview}>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-4 text-xs text-muted-foreground">
            Prologue - {dictionary.mockup.applications}
          </span>
        </div>

        <div className="flex">
          <div className="hidden w-44 border-r border-border bg-secondary/20 p-3 lg:block">
            <div className="space-y-0.5">
              {sidebarItems.map((item) => (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center gap-2.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground transition-colors"
                      : "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
                  }
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[340px] flex-1 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                {dictionary.mockup.applicationBoard}
              </h3>
              <span className="text-xs text-muted-foreground">
                {dictionary.mockup.activeCount}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {applicationColumns.map((column) => (
                <div key={column.title} className="min-w-0">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium text-foreground">
                      {column.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{column.count}</span>
                  </div>
                  <div className="space-y-2">
                    {column.cards.map((card) => (
                      <div
                        key={`${column.title}-${card.company}`}
                        className="rounded-lg border border-border bg-card p-2.5 shadow-sm"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${card.color}`} />
                          <span className="truncate text-xs font-medium text-foreground">
                            {card.company}
                          </span>
                        </div>
                        <p className="truncate text-[10px] text-muted-foreground">{card.role}</p>
                      </div>
                    ))}
                    {column.cards.length === 0 && (
                      <div className="rounded-lg border border-dashed border-border p-3 text-center">
                        <span className="text-[10px] text-muted-foreground">
                          {dictionary.mockup.empty}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 hidden w-52 rounded-xl border border-border bg-card p-4 shadow-xl md:block">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-secondary"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="86, 100"
                strokeWidth="3"
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground">86</span>
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-foreground">
              {dictionary.mockup.overallScore}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {dictionary.mockup.resumeMatch}
            </p>
          </div>
        </div>
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-medium text-muted-foreground">
            {dictionary.mockup.strongMatches}
          </p>
          <div className="flex flex-wrap gap-1">
            {strongMatches.map((match) => (
              <span
                key={match}
                className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary"
              >
                {match}
              </span>
            ))}
          </div>
          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {dictionary.mockup.keywordCoverage}
              </span>
              <span className="text-[10px] font-medium text-foreground">78%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[78%] rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 -right-4 hidden w-64 rounded-xl border border-border bg-card p-4 shadow-xl lg:block">
        <p className="mb-1.5 text-[10px] font-medium text-muted-foreground">
          {dictionary.mockup.bulletOriginalLabel}
        </p>
        <p className="mb-3 line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
          {dictionary.mockup.bulletOriginal}
        </p>
        <p className="mb-1.5 text-[10px] font-medium text-primary">
          {dictionary.mockup.aiRewrite}
        </p>
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-foreground">
          {dictionary.mockup.bulletRewrite}
        </p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground">
            <RotateCcw className="h-3 w-3" />
            {dictionary.mockup.regenerate}
          </button>
          <button className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] text-primary-foreground">
            <Check className="h-3 w-3" />
            {dictionary.mockup.useThis}
          </button>
        </div>
      </div>
    </div>
  );
}
