import { FileSearch, GitCompare, PenLine } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Resume Parsing",
    description: "Extract skills, experience, projects, and achievements from resumes.",
  },
  {
    icon: GitCompare,
    title: "JD Diagnosis",
    description:
      "Compare resumes with job descriptions and reveal gaps, risks, and must-haves.",
  },
  {
    icon: PenLine,
    title: "Bullet Rewrite",
    description: "Turn weak resume bullets into truthful, impact-driven statements.",
  },
];

export function FeatureCards() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center lg:mb-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Everything you need to land interviews
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Powerful AI tools designed to optimize every step of your job search process.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 lg:p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
