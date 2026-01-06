import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb } from 'lucide-react'

const insights = [
  "Weekend dinner service attracts 40% more repeat customers",
  "Customers who try desserts have 2.3x higher lifetime value",
  "Loyalty program members visit 3x more frequently",
  "Peak churn period is between 45-60 days of inactivity",
]

export function InsightsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
