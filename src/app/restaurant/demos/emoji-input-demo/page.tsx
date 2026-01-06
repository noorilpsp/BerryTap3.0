"use client"

import * as React from "react"
import { EmojiInputField } from "@/components/emoji-input-field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function EmojiInputDemo() {
  const [message1, setMessage1] = React.useState("")
  const [message2, setMessage2] = React.useState("AA")
  const [message3, setMessage3] = React.useState("🍒")

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Emoji Input Field</h1>
          <p className="text-muted-foreground">
            Select one emoji or type up to 2 letters for initials. The left button mirrors your input.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Before Selection</CardTitle>
            <CardDescription>
              Start with a default emoji. Click the emoji picker to select a new one, or type initials in the input.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Icon or Initials</Label>
              <EmojiInputField value={message1} onChange={setMessage1} placeholder="Or type emoji here..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMessage1("")} variant="outline">
                Clear
              </Button>
              <Button onClick={() => console.log("Value:", message1)}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Initials</CardTitle>
            <CardDescription>
              Type up to 2 letters for your initials. They will appear in both the button and input field.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Your Initials</Label>
              <EmojiInputField value={message2} onChange={setMessage2} placeholder="Or type emoji here..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMessage2("")} variant="outline">
                Clear
              </Button>
              <Button onClick={() => console.log("Initials:", message2)}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>After Emoji Selection</CardTitle>
            <CardDescription>
              Select an emoji from the picker. It replaces any previous content and appears in both places.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Emoji</Label>
              <EmojiInputField value={message3} onChange={setMessage3} placeholder="Or type emoji here..." />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setMessage3("")} variant="outline">
                Clear
              </Button>
              <Button onClick={() => console.log("Emoji:", message3)}>Save</Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Select one emoji at a time - new selection replaces previous</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Type up to 2 letters for initials (automatically uppercase)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Left button mirrors the input field content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Search emojis by keyword with powerful search</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Organized by categories (Smileys, Animals, Food, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Automatic theme detection (light/dark mode)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
