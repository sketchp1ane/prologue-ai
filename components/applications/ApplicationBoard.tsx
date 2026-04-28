"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";

import { moveApplicationStageAction } from "@/app/(app)/applications/actions";
import {
  APPLICATION_STAGE_LABELS,
  APPLICATION_STAGE_ORDER,
  APPLICATION_STAGE_THEME,
  type ApplicationStageTheme,
  isApplicationStageValue,
  type ApplicationStageValue,
} from "@/src/lib/applications/stage-metadata";
import { cn } from "@/src/lib/utils";

type BoardApplication = {
  companyName: string;
  id: string;
  location: string | null;
  roleTitle: string;
  stage: ApplicationStageValue;
  updatedAt: string;
};

type ApplicationBoardProps = {
  applications: BoardApplication[];
};

function formatRelativeDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays) || diffDays < 0) return "Today";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function groupBoardApplications(applications: BoardApplication[]) {
  const grouped = APPLICATION_STAGE_ORDER.reduce(
    (result, stage) => ({
      ...result,
      [stage]: [] as BoardApplication[],
    }),
    {} as Record<ApplicationStageValue, BoardApplication[]>
  );

  for (const application of applications) {
    grouped[application.stage].push(application);
  }

  return grouped;
}

export function ApplicationBoard({
  applications: initialApplications,
}: ApplicationBoardProps) {
  const [applications, setApplications] = useState(initialApplications);
  const [error, setError] = useState<string | null>(null);
  const [pendingApplicationId, setPendingApplicationId] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const groupedApplications = useMemo(
    () => groupBoardApplications(applications),
    [applications]
  );

  const moveApplication = useCallback(
    (applicationId: string, nextStage: ApplicationStageValue) => {
      const application = applications.find((item) => item.id === applicationId);

      if (!application || application.stage === nextStage) {
        return;
      }

      const previousApplications = applications;

      setError(null);
      setPendingApplicationId(applicationId);
      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId ? { ...item, stage: nextStage } : item
        )
      );

      startTransition(async () => {
        try {
          const result = await moveApplicationStageAction({
            applicationId,
            stage: nextStage,
          });

          if (result.error) {
            setApplications(previousApplications);
            setError(result.error);
          }
        } catch {
          setApplications(previousApplications);
          setError("We could not update this application stage.");
        } finally {
          setPendingApplicationId(null);
        }
      });
    },
    [applications]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const applicationId = String(event.active.id);
      const overId = event.over?.id ? String(event.over.id) : "";

      if (!isApplicationStageValue(overId)) {
        return;
      }

      moveApplication(applicationId, overId);
    },
    [moveApplication]
  );

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
          {error}
        </p>
      )}
      <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="-mx-2 overflow-x-auto px-2 pb-2">
          <div className="grid min-w-[78rem] grid-cols-6 gap-5">
            {APPLICATION_STAGE_ORDER.map((stage) => (
              <DashboardColumn
                key={stage}
                applications={groupedApplications[stage]}
                isBoardPending={isPending || pendingApplicationId !== null}
                moveApplication={moveApplication}
                stage={stage}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}

function DashboardColumn({
  applications,
  isBoardPending,
  moveApplication,
  stage,
}: {
  applications: BoardApplication[];
  isBoardPending: boolean;
  moveApplication: (applicationId: string, stage: ApplicationStageValue) => void;
  stage: ApplicationStageValue;
}) {
  const theme = APPLICATION_STAGE_THEME[stage];
  const { isOver, setNodeRef } = useDroppable({
    id: stage,
  });

  return (
    <section ref={setNodeRef} className="flex min-w-0 flex-col">
      <div className="flex items-center justify-between gap-2 px-1 pb-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)}
            aria-hidden="true"
          />
          <h3 className="truncate text-sm font-medium text-foreground">
            {APPLICATION_STAGE_LABELS[stage]}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
            theme.countBg
          )}
        >
          {applications.length}
        </span>
      </div>

      <div className={cn("mb-3 h-px w-full", theme.accent)} aria-hidden="true" />

      <div
        className={cn(
          "min-h-28 rounded-xl transition",
          isOver && "bg-secondary/40 outline outline-1 outline-border"
        )}
      >
        {applications.length > 0 ? (
          <ul className="flex flex-col gap-2.5">
            {applications.map((application) => (
              <li key={application.id}>
                <DashboardApplicationCard
                  application={application}
                  disabled={isBoardPending}
                  moveApplication={moveApplication}
                  theme={theme}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 px-3 py-6 text-center text-[11px] leading-5 text-muted-foreground/80">
            Empty
          </div>
        )}
      </div>
    </section>
  );
}

function DashboardApplicationCard({
  application,
  disabled,
  moveApplication,
  theme,
}: {
  application: BoardApplication;
  disabled: boolean;
  moveApplication: (applicationId: string, stage: ApplicationStageValue) => void;
  theme: ApplicationStageTheme;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
  } = useDraggable({
    disabled,
    id: application.id,
  });
  const style = transform
    ? {
        transform: `translate3d(${Math.round(transform.x)}px, ${Math.round(
          transform.y
        )}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-3 shadow-sm transition hover:border-foreground/20 hover:shadow-md",
        isDragging && "z-20 opacity-80 shadow-lg"
      )}
      style={style}
    >
      <div className="flex items-start gap-2">
        <Link
          href={`/applications/${application.id}`}
          className="block min-w-0 flex-1 transition hover:text-muted-foreground"
        >
          <span className="block truncate text-sm font-medium leading-tight text-foreground">
            {application.companyName}
          </span>
          <span className="mt-1 block line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {application.roleTitle}
          </span>
        </Link>
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="mt-0.5 inline-flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground opacity-60 outline-none transition hover:bg-secondary hover:text-foreground hover:opacity-100 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`Move ${application.companyName} application`}
          disabled={disabled}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {application.location && (
          <>
            <span className="truncate">{application.location}</span>
            <span aria-hidden="true" className="text-muted-foreground/50">
              ·
            </span>
          </>
        )}
        <span className="shrink-0">
          Updated {formatRelativeDate(application.updatedAt)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", theme.dot)}
          aria-hidden="true"
        />
        <select
          aria-label={`Move ${application.companyName} to another stage`}
          className="h-7 min-w-0 flex-1 cursor-pointer rounded-md border border-border/70 bg-secondary/20 px-2 text-[11px] text-muted-foreground outline-none transition hover:bg-secondary/50 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onChange={(event) => {
            const nextStage = event.currentTarget.value;

            if (isApplicationStageValue(nextStage)) {
              moveApplication(application.id, nextStage);
            }
          }}
          value={application.stage}
        >
          {APPLICATION_STAGE_ORDER.map((stage) => (
            <option key={stage} value={stage}>
              {APPLICATION_STAGE_LABELS[stage]}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
