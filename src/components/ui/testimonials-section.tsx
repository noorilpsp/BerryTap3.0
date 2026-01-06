import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "TaskFlow transformed how our team works. We've cut project delivery time by 40% and everyone stays aligned without endless meetings.",
    author: "Sarah Chen",
    role: "Product Manager at TechStart",
    initials: "SC",
  },
  {
    quote:
      "The automation features alone have saved us countless hours. TaskFlow is intuitive, powerful, and exactly what we needed to scale our operations.",
    author: "Michael Rodriguez",
    role: "Operations Director at BuildCo",
    initials: "MR",
  },
  {
    quote:
      "We tried every project management tool out there. TaskFlow is the only one that our entire team actually loves using. Game changer for remote collaboration.",
    author: "Emily Watson",
    role: "CEO at DesignHub",
    initials: "EW",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Loved by teams everywhere
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground leading-relaxed">
            See what our customers have to say about TaskFlow
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-border/50">
              <CardContent className="pt-6">
                <blockquote className="space-y-4">
                  <p className="text-base leading-relaxed">"{testimonial.quote}"</p>
                  <footer className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
