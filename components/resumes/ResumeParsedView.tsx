"use client";

import {
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit3,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  AppCard,
  AppCardContent,
  AppCardHeader,
} from "@/components/app/AppCard";
import { Button } from "@/components/ui/button";
import type { ResumeParse } from "@/src/lib/ai/schemas/resume-parse";
import type { AppDictionary } from "@/src/lib/i18n/dictionaries";

type ParsedResumeEditorActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

type ParsedResumeEditorAction = (
  previousState: ParsedResumeEditorActionState,
  formData: FormData
) => Promise<ParsedResumeEditorActionState>;

type SectionKey =
  | "basics"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "languages";

type EditorCopy =
  AppDictionary["workspace"]["resumeDetail"]["parsedView"] &
    AppDictionary["workspace"]["resumeDetail"]["editor"];

const sectionLabels: Record<SectionKey, keyof EditorCopy> = {
  basics: "basics",
  certifications: "certifications",
  education: "education",
  experience: "experience",
  languages: "languages",
  projects: "projects",
  skills: "skills",
  summary: "summary",
};

function displayValue(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function formatDateRange(
  fallback: string,
  startDate?: string | null,
  endDate?: string | null
) {
  const start = startDate?.trim();
  const end = endDate?.trim();

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start || end || fallback;
}

function stringifyResume(resume: ResumeParse) {
  return JSON.stringify(resume);
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);

  next.splice(nextIndex, 0, item);

  return next;
}

function FieldGrid({
  fallback,
  rows,
}: {
  fallback: string;
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
            {displayValue(row.value, fallback)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChipList({
  dictionary,
  items,
  title,
}: {
  dictionary: Pick<AppDictionary, "workspace">;
  items: string[];
  title: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-border bg-secondary/30 px-2.5 py-1 text-xs text-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          {dictionary.workspace.resumeDetail.parsedView.noItemsFound}
        </p>
      )}
    </section>
  );
}

function BulletList({
  bullets,
  dictionary,
}: {
  bullets: string[];
  dictionary: Pick<AppDictionary, "workspace">;
}) {
  if (bullets.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {dictionary.workspace.resumeDetail.parsedView.noBulletsFound}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bullets.map((bullet, index) => (
        <li
          key={`${bullet}-${index}`}
          className="flex gap-2 text-sm leading-6 text-foreground"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionFrame({
  children,
  copy,
  editing,
  onCancel,
  onEdit,
  pending,
  section,
}: {
  children: ReactNode;
  copy: EditorCopy;
  editing: boolean;
  onCancel: () => void;
  onEdit: () => void;
  pending: boolean;
  section: SectionKey;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-medium text-foreground">
          {copy[sectionLabels[section]]}
        </h3>
        {editing ? (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={onCancel}
              disabled={pending}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {copy.cancelEdit}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl"
              disabled={pending}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {pending ? copy.saving : copy.saveSection}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={onEdit}
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            {copy.editSection}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

function TextInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string | null;
}) {
  return (
    <label className="space-y-1.5 text-sm font-medium text-foreground">
      <span>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      />
    </label>
  );
}

function ListEditor({
  addLabel,
  emptyLabel,
  items,
  label,
  moveDownLabel,
  moveUpLabel,
  onChange,
  removeLabel,
}: {
  addLabel: string;
  emptyLabel: string;
  items: string[];
  label: string;
  moveDownLabel: string;
  moveUpLabel: string;
  onChange: (items: string[]) => void;
  removeLabel: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <RowControls
                canMoveDown={index < items.length - 1}
                canMoveUp={index > 0}
                moveDownLabel={moveDownLabel}
                moveUpLabel={moveUpLabel}
                onDelete={() => onChange(items.filter((_, i) => i !== index))}
                onMoveDown={() => onChange(moveItem(items, index, 1))}
                onMoveUp={() => onChange(moveItem(items, index, -1))}
                removeLabel={removeLabel}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={() => onChange([...items, ""])}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel}
      </Button>
    </div>
  );
}

function RowControls({
  canMoveDown,
  canMoveUp,
  moveDownLabel,
  moveUpLabel,
  onDelete,
  onMoveDown,
  onMoveUp,
  removeLabel,
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  moveDownLabel: string;
  moveUpLabel: string;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  removeLabel: string;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={moveUpLabel}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={moveDownLabel}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={removeLabel}
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

export function ParsedResumeView({
  action,
  dictionary,
  initialActionState,
  resume,
  resumeId,
}: {
  action: ParsedResumeEditorAction;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  initialActionState: ParsedResumeEditorActionState;
  resume: ResumeParse;
  resumeId: string;
}) {
  const router = useRouter();
  const copy = {
    ...dictionary.workspace.resumeDetail.parsedView,
    ...dictionary.workspace.resumeDetail.editor,
  };
  const [state, setState] = useState(initialActionState);
  const [pending, setPending] = useState(false);
  const [savedResume, setSavedResume] = useState(resume);
  const [draft, setDraft] = useState(resume);
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const result = await action(state, new FormData(event.currentTarget));

      setState(result);

      if (result.status === "success") {
        toast.success(result.message);
        setSavedResume(draft);
        setEditingSection(null);
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    } finally {
      setPending(false);
    }
  }

  function startEditing(section: SectionKey) {
    setState(initialActionState);
    setDraft(savedResume);
    setEditingSection(section);
  }

  function cancelEditing() {
    setDraft(savedResume);
    setEditingSection(null);
  }

  function updateBasics(
    field: keyof ResumeParse["basics"],
    value: string | string[]
  ) {
    setDraft((current) => ({
      ...current,
      basics: {
        ...current.basics,
        [field]: value,
      },
    }));
  }

  function updateList(
    field: "certifications" | "languages" | "skills",
    items: string[]
  ) {
    setDraft((current) => ({
      ...current,
      [field]: items,
    }));
  }

  const visibleResume = editingSection ? draft : savedResume;

  return (
    <AppCard padding="lg">
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={resumeId} />
        <input
          type="hidden"
          name="parsedResume"
          value={stringifyResume(draft)}
          readOnly
        />
        <AppCardHeader
          title={copy.structuredTitle}
          description={copy.structuredDescription}
        />
        <AppCardContent className="space-y-6">
          <SectionFrame
            copy={copy}
            editing={editingSection === "basics"}
            onCancel={cancelEditing}
            onEdit={() => startEditing("basics")}
            pending={pending}
            section="basics"
          >
            {editingSection === "basics" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label={copy.name}
                  value={draft.basics.name}
                  onChange={(value) => updateBasics("name", value)}
                />
                <TextInput
                  label={copy.email}
                  value={draft.basics.email}
                  onChange={(value) => updateBasics("email", value)}
                />
                <TextInput
                  label={copy.phone}
                  value={draft.basics.phone}
                  onChange={(value) => updateBasics("phone", value)}
                />
                <TextInput
                  label={copy.location}
                  value={draft.basics.location}
                  onChange={(value) => updateBasics("location", value)}
                />
                <div className="sm:col-span-2">
                  <ListEditor
                    addLabel={copy.addItem}
                    emptyLabel={copy.emptyList}
                    items={draft.basics.links}
                    label={copy.links}
                    moveDownLabel={copy.moveDown}
                    moveUpLabel={copy.moveUp}
                    onChange={(items) => updateBasics("links", items)}
                    removeLabel={copy.removeItem}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <FieldGrid
                  fallback={dictionary.common.notFound}
                  rows={[
                    { label: copy.name, value: visibleResume.basics.name },
                    { label: copy.email, value: visibleResume.basics.email },
                    { label: copy.phone, value: visibleResume.basics.phone },
                    {
                      label: copy.location,
                      value: visibleResume.basics.location,
                    },
                  ]}
                />
                <ChipList
                  dictionary={dictionary}
                  title={copy.links}
                  items={visibleResume.basics.links}
                />
              </div>
            )}
          </SectionFrame>

          <SectionFrame
            copy={copy}
            editing={editingSection === "summary"}
            onCancel={cancelEditing}
            onEdit={() => startEditing("summary")}
            pending={pending}
            section="summary"
          >
            {editingSection === "summary" ? (
              <textarea
                value={draft.summary ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                rows={6}
                className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            ) : (
              <p className="rounded-xl border border-border bg-secondary/20 p-4 text-sm leading-6 text-foreground">
                {displayValue(visibleResume.summary, dictionary.common.notFound)}
              </p>
            )}
          </SectionFrame>

          <SectionFrame
            copy={copy}
            editing={editingSection === "skills"}
            onCancel={cancelEditing}
            onEdit={() => startEditing("skills")}
            pending={pending}
            section="skills"
          >
            {editingSection === "skills" ? (
              <ListEditor
                addLabel={copy.addItem}
                emptyLabel={copy.emptyList}
                items={draft.skills}
                label={copy.skills}
                moveDownLabel={copy.moveDown}
                moveUpLabel={copy.moveUp}
                onChange={(items) => updateList("skills", items)}
                removeLabel={copy.removeItem}
              />
            ) : (
              <ChipList
                dictionary={dictionary}
                title={copy.skills}
                items={visibleResume.skills}
              />
            )}
          </SectionFrame>

          <ExperienceSection
            copy={copy}
            dictionary={dictionary}
            draft={draft}
            editing={editingSection === "experience"}
            onCancel={cancelEditing}
            onChange={setDraft}
            onEdit={() => startEditing("experience")}
            pending={pending}
            visibleResume={visibleResume}
          />

          <EducationSection
            copy={copy}
            dictionary={dictionary}
            draft={draft}
            editing={editingSection === "education"}
            onCancel={cancelEditing}
            onChange={setDraft}
            onEdit={() => startEditing("education")}
            pending={pending}
            visibleResume={visibleResume}
          />

          <ProjectsSection
            copy={copy}
            dictionary={dictionary}
            draft={draft}
            editing={editingSection === "projects"}
            onCancel={cancelEditing}
            onChange={setDraft}
            onEdit={() => startEditing("projects")}
            pending={pending}
            visibleResume={visibleResume}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionFrame
              copy={copy}
              editing={editingSection === "certifications"}
              onCancel={cancelEditing}
              onEdit={() => startEditing("certifications")}
              pending={pending}
              section="certifications"
            >
              {editingSection === "certifications" ? (
                <ListEditor
                  addLabel={copy.addItem}
                  emptyLabel={copy.emptyList}
                  items={draft.certifications}
                  label={copy.certifications}
                  moveDownLabel={copy.moveDown}
                  moveUpLabel={copy.moveUp}
                  onChange={(items) => updateList("certifications", items)}
                  removeLabel={copy.removeItem}
                />
              ) : (
                <ChipList
                  dictionary={dictionary}
                  title={copy.certifications}
                  items={visibleResume.certifications}
                />
              )}
            </SectionFrame>

            <SectionFrame
              copy={copy}
              editing={editingSection === "languages"}
              onCancel={cancelEditing}
              onEdit={() => startEditing("languages")}
              pending={pending}
              section="languages"
            >
              {editingSection === "languages" ? (
                <ListEditor
                  addLabel={copy.addItem}
                  emptyLabel={copy.emptyList}
                  items={draft.languages}
                  label={copy.languages}
                  moveDownLabel={copy.moveDown}
                  moveUpLabel={copy.moveUp}
                  onChange={(items) => updateList("languages", items)}
                  removeLabel={copy.removeItem}
                />
              ) : (
                <ChipList
                  dictionary={dictionary}
                  title={copy.languages}
                  items={visibleResume.languages}
                />
              )}
            </SectionFrame>
          </div>

          <section>
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {copy.warnings}
            </h3>
            {visibleResume.warnings.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {visibleResume.warnings.map((warning, index) => (
                  <li
                    key={`${warning}-${index}`}
                    className="rounded-xl border border-border bg-secondary/20 px-3 py-2 text-sm leading-6 text-muted-foreground"
                  >
                    {warning}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {copy.noWarningsReturned}
              </p>
            )}
          </section>
        </AppCardContent>
      </form>
    </AppCard>
  );
}

function ExperienceSection({
  copy,
  dictionary,
  draft,
  editing,
  onCancel,
  onChange,
  onEdit,
  pending,
  visibleResume,
}: {
  copy: EditorCopy;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  draft: ResumeParse;
  editing: boolean;
  onCancel: () => void;
  onChange: Dispatch<SetStateAction<ResumeParse>>;
  onEdit: () => void;
  pending: boolean;
  visibleResume: ResumeParse;
}) {
  function updateItem(
    index: number,
    patch: Partial<ResumeParse["experience"][number]>
  ) {
    onChange((current) => ({
      ...current,
      experience: current.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  return (
    <SectionFrame
      copy={copy}
      editing={editing}
      onCancel={onCancel}
      onEdit={onEdit}
      pending={pending}
      section="experience"
    >
      {editing ? (
        <div className="space-y-3">
          {draft.experience.length > 0 ? (
            draft.experience.map((experience, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label={copy.titleLabel}
                    value={experience.title}
                    onChange={(value) => updateItem(index, { title: value })}
                  />
                  <TextInput
                    label={copy.company}
                    value={experience.company}
                    onChange={(value) => updateItem(index, { company: value })}
                  />
                  <TextInput
                    label={copy.startDate}
                    value={experience.startDate}
                    onChange={(value) => updateItem(index, { startDate: value })}
                  />
                  <TextInput
                    label={copy.endDate}
                    value={experience.endDate}
                    onChange={(value) => updateItem(index, { endDate: value })}
                  />
                  <div className="sm:col-span-2">
                    <TextInput
                      label={copy.location}
                      value={experience.location}
                      onChange={(value) => updateItem(index, { location: value })}
                    />
                  </div>
                </div>
                <ListEditor
                  addLabel={copy.addBullet}
                  emptyLabel={copy.emptyBullets}
                  items={experience.bullets}
                  label={copy.bullets}
                  moveDownLabel={copy.moveDown}
                  moveUpLabel={copy.moveUp}
                  onChange={(bullets) => updateItem(index, { bullets })}
                  removeLabel={copy.removeItem}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === 0}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        experience: moveItem(current.experience, index, -1),
                      }))
                    }
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    {copy.moveUp}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === draft.experience.length - 1}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        experience: moveItem(current.experience, index, 1),
                      }))
                    }
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    {copy.moveDown}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        experience: current.experience.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {copy.removeItem}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              {copy.noExperienceFound}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              onChange((current) => ({
                ...current,
                experience: [
                  ...current.experience,
                  {
                    bullets: [],
                    company: null,
                    endDate: null,
                    location: null,
                    startDate: null,
                    title: null,
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {copy.addExperience}
          </Button>
        </div>
      ) : visibleResume.experience.length > 0 ? (
        <div className="space-y-3">
          {visibleResume.experience.map((experience, index) => (
            <div
              key={`${experience.company}-${experience.title}-${index}`}
              className="rounded-xl border border-border bg-secondary/20 p-4"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {displayValue(experience.title, dictionary.common.notFound)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {displayValue(experience.company, dictionary.common.notFound)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDateRange(
                    dictionary.common.notFound,
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
                <BulletList
                  dictionary={dictionary}
                  bullets={experience.bullets}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {copy.noExperienceFound}
        </p>
      )}
    </SectionFrame>
  );
}

function EducationSection({
  copy,
  dictionary,
  draft,
  editing,
  onCancel,
  onChange,
  onEdit,
  pending,
  visibleResume,
}: {
  copy: EditorCopy;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  draft: ResumeParse;
  editing: boolean;
  onCancel: () => void;
  onChange: Dispatch<SetStateAction<ResumeParse>>;
  onEdit: () => void;
  pending: boolean;
  visibleResume: ResumeParse;
}) {
  function updateItem(
    index: number,
    patch: Partial<ResumeParse["education"][number]>
  ) {
    onChange((current) => ({
      ...current,
      education: current.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  return (
    <SectionFrame
      copy={copy}
      editing={editing}
      onCancel={onCancel}
      onEdit={onEdit}
      pending={pending}
      section="education"
    >
      {editing ? (
        <div className="space-y-3">
          {draft.education.length > 0 ? (
            draft.education.map((education, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    label={copy.school}
                    value={education.school}
                    onChange={(value) => updateItem(index, { school: value })}
                  />
                  <TextInput
                    label={copy.degree}
                    value={education.degree}
                    onChange={(value) => updateItem(index, { degree: value })}
                  />
                  <TextInput
                    label={copy.major}
                    value={education.major}
                    onChange={(value) => updateItem(index, { major: value })}
                  />
                  <TextInput
                    label={copy.startDate}
                    value={education.startDate}
                    onChange={(value) => updateItem(index, { startDate: value })}
                  />
                  <TextInput
                    label={copy.endDate}
                    value={education.endDate}
                    onChange={(value) => updateItem(index, { endDate: value })}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === 0}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        education: moveItem(current.education, index, -1),
                      }))
                    }
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    {copy.moveUp}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === draft.education.length - 1}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        education: moveItem(current.education, index, 1),
                      }))
                    }
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    {copy.moveDown}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        education: current.education.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {copy.removeItem}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              {copy.noEducationFound}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              onChange((current) => ({
                ...current,
                education: [
                  ...current.education,
                  {
                    degree: null,
                    endDate: null,
                    major: null,
                    school: null,
                    startDate: null,
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {copy.addEducation}
          </Button>
        </div>
      ) : visibleResume.education.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleResume.education.map((education, index) => (
            <div
              key={`${education.school}-${education.degree}-${index}`}
              className="rounded-xl border border-border bg-secondary/20 p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {displayValue(education.school, dictionary.common.notFound)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {[education.degree, education.major]
                  .map((part) => part?.trim())
                  .filter(Boolean)
                  .join(", ") || dictionary.common.notFound}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDateRange(
                  dictionary.common.notFound,
                  education.startDate,
                  education.endDate
                )}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.noEducationFound}</p>
      )}
    </SectionFrame>
  );
}

function ProjectsSection({
  copy,
  dictionary,
  draft,
  editing,
  onCancel,
  onChange,
  onEdit,
  pending,
  visibleResume,
}: {
  copy: EditorCopy;
  dictionary: Pick<AppDictionary, "common" | "workspace">;
  draft: ResumeParse;
  editing: boolean;
  onCancel: () => void;
  onChange: Dispatch<SetStateAction<ResumeParse>>;
  onEdit: () => void;
  pending: boolean;
  visibleResume: ResumeParse;
}) {
  function updateItem(
    index: number,
    patch: Partial<ResumeParse["projects"][number]>
  ) {
    onChange((current) => ({
      ...current,
      projects: current.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  return (
    <SectionFrame
      copy={copy}
      editing={editing}
      onCancel={onCancel}
      onEdit={onEdit}
      pending={pending}
      section="projects"
    >
      {editing ? (
        <div className="space-y-3">
          {draft.projects.length > 0 ? (
            draft.projects.map((project, index) => (
              <div
                key={index}
                className="space-y-3 rounded-xl border border-border bg-secondary/20 p-4"
              >
                <TextInput
                  label={copy.projectName}
                  value={project.name}
                  onChange={(value) => updateItem(index, { name: value })}
                />
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  <span>{copy.descriptionLabel}</span>
                  <textarea
                    value={project.description ?? ""}
                    onChange={(event) =>
                      updateItem(index, { description: event.target.value })
                    }
                    rows={4}
                    className="w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm font-normal leading-6 text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>
                <ListEditor
                  addLabel={copy.addItem}
                  emptyLabel={copy.emptyList}
                  items={project.technologies}
                  label={copy.technologies}
                  moveDownLabel={copy.moveDown}
                  moveUpLabel={copy.moveUp}
                  onChange={(technologies) =>
                    updateItem(index, { technologies })
                  }
                  removeLabel={copy.removeItem}
                />
                <ListEditor
                  addLabel={copy.addBullet}
                  emptyLabel={copy.emptyBullets}
                  items={project.bullets}
                  label={copy.bullets}
                  moveDownLabel={copy.moveDown}
                  moveUpLabel={copy.moveUp}
                  onChange={(bullets) => updateItem(index, { bullets })}
                  removeLabel={copy.removeItem}
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === 0}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        projects: moveItem(current.projects, index, -1),
                      }))
                    }
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    {copy.moveUp}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={index === draft.projects.length - 1}
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        projects: moveItem(current.projects, index, 1),
                      }))
                    }
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    {copy.moveDown}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() =>
                      onChange((current) => ({
                        ...current,
                        projects: current.projects.filter(
                          (_, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {copy.removeItem}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              {copy.noProjectsFound}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              onChange((current) => ({
                ...current,
                projects: [
                  ...current.projects,
                  {
                    bullets: [],
                    description: null,
                    name: null,
                    technologies: [],
                  },
                ],
              }))
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {copy.addProject}
          </Button>
        </div>
      ) : visibleResume.projects.length > 0 ? (
        <div className="space-y-3">
          {visibleResume.projects.map((project, index) => (
            <div
              key={`${project.name}-${index}`}
              className="rounded-xl border border-border bg-secondary/20 p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {displayValue(project.name, dictionary.common.notFound)}
              </p>
              {project.description && (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-3">
                <ChipList
                  dictionary={dictionary}
                  title={copy.technologies}
                  items={project.technologies}
                />
              </div>
              <div className="mt-4">
                <BulletList dictionary={dictionary} bullets={project.bullets} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{copy.noProjectsFound}</p>
      )}
    </SectionFrame>
  );
}
