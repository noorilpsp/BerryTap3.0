import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Users, Zap } from "lucide-react"

const features = [
  {
    icon: CheckCircle2,
    title: "Task Management",
    description:
      "Create, assign, and track tasks with ease. Set priorities, deadlines, and dependencies to keep your projects on schedule.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Real-time updates, comments, and file sharing keep everyone on the same page. Work together seamlessly, no matter where you are.",
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description:
      "Automate repetitive tasks and streamline your processes. Set up custom workflows that adapt to your team's unique needs.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-secondary/30 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Everything you need to succeed
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            Powerful features designed to help your team work smarter, not harder.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="border-border/50">
                <CardContent className="p-8">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
