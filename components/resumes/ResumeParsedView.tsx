import { AlertTriangle } from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import type { ResumeParse } from "@/src/lib/ai/schemas/resume-parse";

function displayValue(value: string | null | undefined) {
  return value?.trim() || "Not found";
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  const start = startDate?.trim();
  const end = endDate?.trim();

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || "Dates not found";
}

function FieldGrid({
  rows,
}: {
  rows: Array<{
    label: string;
    value: string | null | undefined;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-xl border border-border bg-secondary/20 p-3"
        >
          <p className="text-xs font-medium text-muted-foreground">
            {row.label}
          </p>
          <p className="mt-1 break-words text-sm text-foreground">
            {displayValue(row.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChipList({ items, title }: { items: string[]; title: string }) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No items found.</p>
      )}
    </section>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) {
    return <p className="text-sm text-muted-foreground">No bullets found.</p>;
  }

  return (
    <ul className="space-y-2">
      {bullets.map((bullet) => (
        <li key={bullet} className="flex gap-2 text-sm leading-6 text-foreground">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

export function ParsedResumeView({ resume }: { resume: ResumeParse }) {
  return (
    <AppCard padding="lg">
      <AppCardHeader
        title="Structured parsed resume"
        description="Read-only Resume Parse v1 output saved on this record."
      />
      <AppCardContent className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Basics</h3>
          <FieldGrid
            rows={[
              {
                label: "Name",
                value: resume.basics.name,
              },
              {
                label: "Email",
                value: resume.basics.email,
              },
              {
                label: "Phone",
                value: resume.basics.phone,
              },
              {
                label: "Location",
                value: resume.basics.location,
              },
            ]}
          />
          <ChipList title="Links" items={resume.basics.links} />
        </section>

        <section>
          <h3 className="text-sm font-medium text-foreground">Summary</h3>
          <p className="mt-2 rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6 text-foreground">
            {displayValue(resume.summary)}
          </p>
        </section>

        <ChipList title="Skills" items={resume.skills} />

        <section>
          <h3 className="text-sm font-medium text-foreground">Experience</h3>
          {resume.experience.length > 0 ? (
            <div className="mt-3 space-y-3">
              {resume.experience.map((experience, index) => (
                <div
                  key={`${experience.company}-${experience.title}-${index}`}
                  className="rounded-xl border border-border bg-secondary/20 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {displayValue(experience.title)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {displayValue(experience.company)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateRange(
                        experience.startDate,
                        experience.endDate
                      )}
                    </p>
                  </div>
                  {experience.location && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {experience.location}
                    </p>
                  )}
                  <div className="mt-4">
                    <BulletList bullets={experience.bullets} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No experience found.
            </p>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-foreground">Education</h3>
          {resume.education.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {resume.education.map((education, index) => (
                <div
                  key={`${education.school}-${education.degree}-${index}`}
                  className="rounded-xl border border-border bg-secondary/20 p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    {displayValue(education.school)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[education.degree, education.major]
                      .map((part) => part?.trim())
                      .filter(Boolean)
                      .join(", ") || "Degree not found"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDateRange(education.startDate, education.endDate)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No education found.
            </p>
          )}
        </section>

        <section>
          <h3 className="text-sm font-medium text-foreground">Projects</h3>
          {resume.projects.length > 0 ? (
            <div className="mt-3 space-y-3">
              {resume.projects.map((project, index) => (
                <div
                  key={`${project.name}-${index}`}
                  className="rounded-xl border border-border bg-secondary/20 p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    {displayValue(project.name)}
                  </p>
                  {project.description && (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3">
                    <ChipList
                      title="Technologies"
                      items={project.technologies}
                    />
                  </div>
                  <div className="mt-4">
                    <BulletList bullets={project.bullets} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No projects found.
            </p>
          )}
        </section>

        <div className="grid gap-5 lg:grid-cols-2">
          <ChipList title="Certifications" items={resume.certifications} />
          <ChipList title="Languages" items={resume.languages} />
        </div>

        <section>
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Warnings
          </h3>
          {resume.warnings.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {resume.warnings.map((warning) => (
                <li
                  key={warning}
                  className="rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm leading-6 text-muted-foreground"
                >
                  {warning}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No warnings returned.
            </p>
          )}
        </section>
      </AppCardContent>
    </AppCard>
  );
}
