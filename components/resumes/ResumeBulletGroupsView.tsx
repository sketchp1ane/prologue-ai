import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";
import type { ResumeBulletGroup } from "@/src/lib/resumes/detail-view";

function formatSectionType(sectionType: string) {
  return sectionType
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ResumeBulletGroupsView({
  dictionary,
  groups,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  groups: ResumeBulletGroup[];
}) {
  const copy = dictionary.workspace.resumeDetail.bulletGroups;

  return (
    <AppCard padding="lg">
      <AppCardHeader
        title={copy.title}
        description={copy.description}
      />
      <AppCardContent>
        {groups.length > 0 ? (
          <div className="space-y-4">
            {groups.map((group) => (
              <section
                key={`${group.sectionType}:${group.sectionTitle ?? ""}`}
                className="rounded-xl border border-border bg-secondary/20 p-4"
              >
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    {group.sectionTitle || copy.untitledSection}
                  </h3>
                  <span className="w-fit rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                    {formatSectionType(group.sectionType)}
                  </span>
                </div>
                <ul className="space-y-3">
                  {group.bullets.map((bullet) => (
                    <li
                      key={bullet.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <p className="text-sm leading-6 text-foreground">
                        {bullet.currentText}
                      </p>
                      {bullet.currentText !== bullet.originalText && (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {copy.original}: {bullet.originalText}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-6 text-sm leading-6 text-muted-foreground">
            {copy.empty}
          </div>
        )}
      </AppCardContent>
    </AppCard>
  );
}
