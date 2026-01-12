"use client"

import { StatusChip } from "@/components/status-chip"
import { PriceBadge } from "@/components/price-badge"
import { TagChip } from "@/components/tag-chip"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed } from "lucide-react"
import { useState } from "react"

export default function DesignSystemPage() {
  const [tags, setTags] = useState([
    { id: 1, label: "Vegan", variant: "dietary" as const, icon: "🌱" },
    { id: 2, label: "Spicy", variant: "attribute" as const, icon: "🌶️" },
    { id: 3, label: "Popular", variant: "attribute" as const, icon: "🔥" },
    { id: 4, label: "Vegetarian", variant: "dietary" as const, icon: "🥬" },
    { id: 5, label: "Gluten-Free", variant: "dietary" as const, icon: "🌾" },
    { id: 6, label: "New", variant: "attribute" as const, icon: "✨" },
    { id: 7, label: "Chef's Pick", variant: "attribute" as const, icon: "👨‍🍳" },
    { id: 8, label: "Seasonal", variant: "custom" as const, icon: "🍂" },
  ])

  const removeTag = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">BerryTap Design System</h1>
          <p className="text-muted-foreground">Reusable components for the restaurant menu manager</p>
        </div>

        {/* StatusChip Component */}
        <Card>
          <CardHeader>
            <CardTitle>StatusChip Component</CardTitle>
            <CardDescription>Display menu item status with visual indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Medium Size (default)</h4>
              <div className="flex flex-wrap gap-3">
                <StatusChip status="live" />
                <StatusChip status="draft" />
                <StatusChip status="hidden" />
                <StatusChip status="soldout" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Small Size</h4>
              <div className="flex flex-wrap gap-3">
                <StatusChip status="live" size="sm" />
                <StatusChip status="draft" size="sm" />
                <StatusChip status="hidden" size="sm" />
                <StatusChip status="soldout" size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PriceBadge Component */}
        <Card>
          <CardHeader>
            <CardTitle>PriceBadge Component</CardTitle>
            <CardDescription>Display prices with different variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Default Variant</h4>
              <div className="flex flex-wrap gap-6">
                <PriceBadge price={12.99} />
                <PriceBadge price={24.5} />
                <PriceBadge price={8.0} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Varied Variant</h4>
              <PriceBadge price={0} variant="varied" />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Multi Variant</h4>
              <PriceBadge
                price={0}
                variant="multi"
                orderTypePrices={{ delivery: 15.99, pickup: 13.99, dineIn: 12.99 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* TagChip Component */}
        <Card>
          <CardHeader>
            <CardTitle>TagChip Component</CardTitle>
            <CardDescription>Display dietary restrictions, attributes, and custom tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3">All Tags (with remove)</h4>
              <div className="flex flex-wrap gap-2" role="list">
                {tags.map((tag) => (
                  <TagChip
                    key={tag.id}
                    label={tag.label}
                    variant={tag.variant}
                    icon={tag.icon}
                    onRemove={() => removeTag(tag.id)}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Without Remove Button</h4>
              <div className="flex flex-wrap gap-2" role="list">
                <TagChip label="Vegan" variant="dietary" icon="🌱" />
                <TagChip label="Spicy" variant="attribute" icon="🌶️" />
                <TagChip label="Popular" variant="attribute" icon="🔥" />
                <TagChip label="Seasonal" variant="custom" icon="🍂" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* EmptyState Component */}
        <Card>
          <CardHeader>
            <CardTitle>EmptyState Component</CardTitle>
            <CardDescription>Display empty states with actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <h4 className="text-sm font-medium mb-3">With Primary Action</h4>
              <EmptyState
                icon={<UtensilsCrossed />}
                title="No menu items yet"
                description="Get started by creating your first menu item. Add dishes, set prices, and start taking orders."
                action={{
                  label: "Create Menu Item",
                  onClick: () => alert("Create menu item clicked"),
                }}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">With Primary and Secondary Actions</h4>
              <EmptyState
                icon="🍽️"
                title="No orders today"
                description="You haven't received any orders yet. Share your menu with customers to start receiving orders."
                action={{
                  label: "Share Menu",
                  onClick: () => alert("Share menu clicked"),
                }}
                secondaryAction={{
                  label: "View Analytics",
                  onClick: () => alert("View analytics clicked"),
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
