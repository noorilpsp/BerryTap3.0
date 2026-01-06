import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Streamline your team's workflow
          </h1>
          <p className="mt-8 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            TaskFlow helps teams collaborate seamlessly, manage projects efficiently, and deliver results faster.
            Everything you need to keep your team organized in one powerful platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" className="text-base">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base bg-transparent">
              Watch demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">No credit card required • 14-day free trial</p>
        </div>

        {/* Social Proof */}
        <div className="mx-auto mt-20 max-w-5xl">
          <p className="text-center text-sm font-medium text-muted-foreground">Trusted by leading teams worldwide</p>
          <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
            {["Acme Corp", "TechStart", "Innovate", "BuildCo", "DesignHub"].map((company) => (
              <div key={company} className="flex items-center justify-center text-muted-foreground/60">
                <span className="text-lg font-semibold">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
