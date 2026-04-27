import { Check, CreditCard, Sparkles } from "lucide-react";

import { AppCard } from "@/components/app/AppCard";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 resume uploads",
      "10 AI rewrites per month",
      "Basic job tracking",
      "Email support",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "For serious job seekers",
    features: [
      "Unlimited resume uploads",
      "Unlimited AI rewrites",
      "Advanced analytics",
      "Priority support",
      "Interview prep tools",
      "Custom templates",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    period: "per month",
    description: "For career coaches & teams",
    features: [
      "Everything in Pro",
      "5 team members",
      "Client management",
      "White-label reports",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your subscription and billing details."
      />

      {/* Current Plan */}
      <AppCard className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">
                Current Plan
              </h3>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
                Free
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              You&apos;re using 3 of 5 resume uploads this month.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Resume uploads used</span>
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
          Available Plans
        </h3>
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <AppCard
              key={plan.name}
              className={
                plan.highlighted
                  ? "relative border-primary/50 bg-primary/5"
                  : ""
              }
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
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
                variant={plan.current ? "outline" : "default"}
                className="w-full rounded-xl"
                disabled={plan.current}
              >
                {plan.current ? (
                  "Current Plan"
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to {plan.name}
                  </>
                )}
              </Button>
            </AppCard>
          ))}
        </div>
      </div>
    </>
  );
}
