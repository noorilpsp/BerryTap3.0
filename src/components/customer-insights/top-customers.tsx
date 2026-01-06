import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown } from 'lucide-react'

const topCustomers = [
  { name: "Sarah Johnson", visits: 42, spend: "$5,280", tier: "VIP", initials: "SJ" },
  { name: "Mike Chen", visits: 38, spend: "$4,750", tier: "VIP", initials: "MC" },
  { name: "Emma Davis", visits: 35, spend: "$4,200", tier: "VIP", initials: "ED" },
  { name: "James Wilson", visits: 32, spend: "$3,840", tier: "Gold", initials: "JW" },
  { name: "Lisa Anderson", visits: 29, spend: "$3,625", tier: "Gold", initials: "LA" },
]

export function TopCustomers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Top Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCustomers.map((customer, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 text-center font-bold text-lg text-muted-foreground">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{customer.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.visits} visits • {customer.spend}
                </p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                {customer.tier}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
