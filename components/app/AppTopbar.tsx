export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-medium text-foreground">Prologue / 第一页</p>
          <p className="text-xs text-muted-foreground">Workspace</p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
          <div className="h-6 w-6 rounded-full bg-primary/10" aria-hidden="true" />
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-foreground">User area</p>
            <p className="text-[10px] text-muted-foreground">Preview</p>
          </div>
        </div>
      </div>
    </header>
  );
}
