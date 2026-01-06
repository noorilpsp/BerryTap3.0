import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

const alerts = [
  { message: "47 VIP customers showing churn signals", severity: "high" },
  { message: "23 customers near tier upgrade", severity: "medium" },
  { message: "156 customers haven't visited in 30 days", severity: "medium" },
  { message: "12 negative feedback reports this week", severity: "high" },
]

export function AlertsWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  alert.severity === "high" ? "bg-red-500" : "bg-orange-500"
                }`}
              />
              <p className="text-sm flex-1">{alert.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
