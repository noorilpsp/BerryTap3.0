"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Lightbulb } from "lucide-react"

export function PhotoGuidelines() {
  const guidelines = [
    {
      title: "Frame & Composition",
      dos: ["Use landscape orientation (5:4 aspect ratio preferred)", "Food should take up 70-80% of the frame"],
      donts: ["Avoid vertical/portrait orientation", "Don't have food too small in frame"],
    },
    {
      title: "Lighting",
      dos: ["Use natural, indirect sunlight", "Soft, even lighting"],
      donts: ["Avoid harsh shadows", "Avoid very dark or very bright images"],
    },
    {
      title: "Angle",
      dos: ["Top-down for bowls, plates, salads", "45-degree angle for burgers, sandwiches, tall items"],
      donts: ["Avoid extreme angles"],
    },
    {
      title: "Content",
      dos: ["Show what's inside (cut sandwiches/burritos)", "Single dish only", "Fresh, appetizing presentation"],
      donts: ["No multiple dishes in one photo", "No blurry or low-quality images"],
    },
    {
      title: "Style",
      dos: ["Add your restaurant's flair (plating, surfaces)", "Use props (napkins, utensils) sparingly"],
      donts: ["Don't misrepresent portion size"],
    },
  ]

  const tips = [
    "Items with photos are ordered 15% more frequently",
    "You can update photos anytime",
    "Focus on your most popular items first",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Photo Guidelines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {guidelines.map((section, index) => (
          <div key={index} className="space-y-3">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <div className="space-y-2">
              {section.dos.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
              {section.donts.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            {index < guidelines.length - 1 && <Separator />}
          </div>
        ))}

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Tips</h3>
          <div className="space-y-2">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 h-5 w-5 p-0">
                  💡
                </Badge>
                <span className="text-sm text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
