"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Search, Trash2, GripVertical } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RecipeBuilderDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: any
}

export function RecipeBuilderDrawer({ open, onOpenChange, recipe }: RecipeBuilderDrawerProps) {
  const [servings, setServings] = useState(recipe?.servings || 1)
  const [ingredients, setIngredients] = useState(recipe?.ingredients || [])
  const [targetCost, setTargetCost] = useState(recipe?.targetCostPercent || 15)

  const totalCost = ingredients.reduce((sum: number, ing: any) => sum + (ing.cost || 0), 0)
  const suggestedSellPrice = totalCost / (targetCost / 100)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{recipe ? "Edit Recipe" : "Create New Recipe"}</SheetTitle>
          <SheetDescription>Build your recipe and calculate food costs</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Info</h3>

            <div>
              <Label htmlFor="recipe-name">Recipe Name *</Label>
              <Input id="recipe-name" placeholder="Classic Omelet" defaultValue={recipe?.name} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={recipe?.category || "breakfast"}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                    <SelectItem value="starters">🥗 Starters</SelectItem>
                    <SelectItem value="mains">🍽️ Mains</SelectItem>
                    <SelectItem value="sides">🥔 Sides</SelectItem>
                    <SelectItem value="desserts">🍰 Desserts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Servings (Yield)</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setServings(Math.max(1, servings - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    value={servings}
                    onChange={(e) => setServings(Number.parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <Button variant="outline" size="icon" onClick={() => setServings(servings + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Three-egg omelet with cheese and fresh herbs. Served with toast."
                defaultValue={recipe?.description}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-cost">Target Food Cost %</Label>
                <Input
                  id="target-cost"
                  type="number"
                  value={targetCost}
                  onChange={(e) => setTargetCost(Number.parseFloat(e.target.value) || 0)}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="prep-time">Prep Time</Label>
                <Input
                  id="prep-time"
                  placeholder="8 mins"
                  defaultValue={recipe?.prepTime ? `${recipe.prepTime} mins` : ""}
                />
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="font-semibold">Ingredients</h3>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ingredients to add..." className="pl-9" />
              <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2">
                Scan
              </Button>
            </div>

            {/* Ingredients Table */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-3 py-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium">
                  <div className="col-span-4">INGREDIENT</div>
                  <div className="col-span-2">QTY</div>
                  <div className="col-span-2">UNIT</div>
                  <div className="col-span-1">YIELD</div>
                  <div className="col-span-2">COST</div>
                  <div className="col-span-1"></div>
                </div>
              </div>

              <div className="divide-y">
                {ingredients.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No ingredients added yet</div>
                ) : (
                  ingredients.map((ing: any, idx: number) => (
                    <div key={idx} className="p-3">
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4 flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{ing.name}</div>
                            <div className="text-xs text-muted-foreground">{ing.code}</div>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Input type="number" defaultValue={ing.qty} className="h-8" />
                        </div>
                        <div className="col-span-2">
                          <Select defaultValue={ing.unit}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pc">pc</SelectItem>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="ml">ml</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1">
                          <Input type="number" defaultValue={ing.yieldPercent} className="h-8" />
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm font-medium">€{ing.cost.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">@€{ing.unitCost}/unit</div>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>

          {/* Cost Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cost Summary</h3>

            <div className="border rounded-md p-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">💰 COST</div>
                  <div className="text-2xl font-bold">€{totalCost.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">per serving</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">🎯 TARGET</div>
                  <div className="text-2xl font-bold">{targetCost}%</div>
                  <div className="text-xs text-muted-foreground">food cost</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">📊 ACTUAL</div>
                  <div className="text-2xl font-bold">--</div>
                  <div className="text-xs text-muted-foreground">not linked</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">💵 SUGGESTED</div>
                  <div className="text-2xl font-bold">€{suggestedSellPrice.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">sell price</div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Linking */}
          <div className="space-y-4">
            <h3 className="font-semibold">Menu Linking</h3>

            <div>
              <Label>Link to Menu Item (optional)</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search menu items..." className="pl-9" />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="auto-consume" defaultChecked />
              <label
                htmlFor="auto-consume"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Enable auto-consumption
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Automatically deduct ingredients when orders are placed</p>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="font-semibold">Notes & Instructions</h3>

            <div>
              <Label htmlFor="instructions">Prep Instructions (optional)</Label>
              <Textarea
                id="instructions"
                placeholder="1. Crack eggs into bowl, whisk with fork&#10;2. Heat butter in non-stick pan over medium heat&#10;3. Pour eggs, let set slightly, add cheese&#10;4. Fold and serve with herbs"
                className="min-h-[100px]"
                defaultValue={recipe?.instructions}
              />
            </div>

            <div>
              <Label>Allergens</Label>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">🥚 Eggs</Badge>
                <Badge variant="outline">🧀 Dairy</Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="outline">Save Draft</Button>
            <Button>Save Recipe</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
