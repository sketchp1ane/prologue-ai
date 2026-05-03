import { Check, CreditCard, Sparkles } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { requireCurrentUserId } from "@/src/lib/auth/current-user";
import { getCurrentLocale, getDictionary } from "@/src/lib/i18n/server";

export default async function BillingPage() {
  const userId = await requireCurrentUserId();
  const locale = await getCurrentLocale(userId);
  const dictionary = getDictionary(locale);
  const copy = dictionary.workspace.billing;

  return (
    <>
      <PageHeader title={copy.title} description={copy.description} />

      {/* Current Plan */}
      <AppCard className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">
                {copy.currentPlan}
              </h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                {copy.free}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{copy.usage}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl">
              <CreditCard className="mr-2 h-4 w-4" />
              {copy.manageBilling}
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{copy.uploadsUsed}</span>
            <span className="font-medium text-foreground">3/5</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[60%] rounded-full bg-primary" />
          </div>
        </div>
      </AppCard>

      {/* Plans Grid */}
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-medium text-foreground">
          {copy.availablePlans}
        </h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {copy.plans.map((plan) => {
            const isCurrent = "current" in plan && plan.current;
            const isHighlighted = "highlighted" in plan && plan.highlighted;

            return (
              <AppCard
                key={plan.name}
                className={
                  isHighlighted
                    ? "relative border-primary/50 bg-primary/5"
                    : ""
                }
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {copy.mostPopular}
                  </div>
                )}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "outline" : "default"}
                className="w-full rounded-xl"
                disabled={isCurrent}
              >
                {isCurrent ? (
                  copy.currentPlanButton
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {copy.upgradeTo.replace("{plan}", plan.name)}
                  </>
                )}
              </Button>
              </AppCard>
            );
          })}
        </div>
      </div>
    </>
  );
}
