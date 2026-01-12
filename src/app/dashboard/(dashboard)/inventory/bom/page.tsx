"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  Plus,
  Search,
  FileText,
  Link2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Edit,
  Copy,
  BarChart3,
  MoreVertical,
  LayoutGrid,
  List,
  Download,
} from "lucide-react"
import Link from "next/link"
import { RecipeBuilderDrawer } from "@/components/inventory/recipe-builder-drawer"
import { LinkMenuModal } from "@/components/inventory/link-menu-modal"

// Mock data
const bomSummary = {
  totalRecipes: 89,
  linkedRecipes: 72,
  linkedPercent: 81,
  unlinkedRecipes: 17,
  avgCostPercent: 28.4,
  targetCostPercent: 30,
  targetVariance: -1.6,
}

const categories = [
  { id: "cat_breakfast", name: "Breakfast", emoji: "🍳", recipeCount: 12 },
  { id: "cat_starters", name: "Starters", emoji: "🥗", recipeCount: 15 },
  { id: "cat_mains", name: "Mains", emoji: "🍽️", recipeCount: 28 },
  { id: "cat_sides", name: "Sides", emoji: "🥔", recipeCount: 10 },
  { id: "cat_desserts", name: "Desserts", emoji: "🍰", recipeCount: 14 },
]

const recipes = [
  {
    bomId: "bom_omelet",
    name: "Classic Omelet",
    emoji: "🍳",
    category: "Breakfast",
    servings: 1,
    ingredientCount: 5,
    linkedMenuItem: { id: "M001", name: "Classic Omelet", sellPrice: 12.5 },
    costing: {
      totalCost: 1.6,
      costPercent: 12.8,
      status: "under",
      variance: -2.2,
    },
    ingredients: [
      { name: "Eggs (3pc)", cost: 0.45, costPercent: 28 },
      { name: "Cheese (30g)", cost: 0.22, costPercent: 14 },
      { name: "Butter (15g)", cost: 0.12, costPercent: 7 },
      { name: "Herbs (5g)", cost: 0.06, costPercent: 4 },
      { name: "S&P + Oil", cost: 0.03, costPercent: 2 },
    ],
    targetCostPercent: 15,
  },
  {
    bomId: "bom_benedict",
    name: "Eggs Benedict",
    emoji: "🥗",
    category: "Breakfast",
    servings: 1,
    ingredientCount: 8,
    linkedMenuItem: { id: "M003", name: "Eggs Benedict", sellPrice: 16.0 },
    costing: {
      totalCost: 2.5,
      costPercent: 15.6,
      status: "under",
      variance: -2.4,
    },
    ingredients: [
      { name: "Eggs (2pc)", cost: 0.3, costPercent: 12 },
      { name: "Ham (60g)", cost: 0.48, costPercent: 19 },
      { name: "Muffin (1pc)", cost: 0.25, costPercent: 10 },
      { name: "Hollandaise", cost: 0.62, costPercent: 25 },
      { name: "Other (4)", cost: 0.45, costPercent: 18 },
    ],
    targetCostPercent: 18,
  },
  {
    bomId: "bom_ribeye",
    name: "Grilled Ribeye Steak",
    emoji: "🥩",
    category: "Mains",
    servings: 1,
    ingredientCount: 7,
    linkedMenuItem: { id: "M015", name: "Grilled Ribeye Steak", sellPrice: 38.0 },
    costing: {
      totalCost: 13.5,
      costPercent: 35.5,
      status: "over",
      variance: 5.5,
    },
    ingredients: [
      { name: "Ribeye (300g)", cost: 8.4, costPercent: 62 },
      { name: "Butter (25g)", cost: 0.2, costPercent: 1 },
      { name: "Sides", cost: 1.85, costPercent: 14 },
      { name: "Sauce", cost: 0.65, costPercent: 5 },
    ],
    targetCostPercent: 30,
  },
  {
    bomId: "bom_chicken_parm",
    name: "Chicken Parmesan",
    emoji: "🍗",
    category: "Mains",
    servings: 1,
    ingredientCount: 9,
    linkedMenuItem: null,
    costing: {
      totalCost: 4.2,
      costPercent: 0,
      status: "unlinked",
      variance: 0,
      suggestedSellPrice: 16.8,
    },
    ingredients: [],
    targetCostPercent: 25,
  },
  {
    bomId: "bom_brulee",
    name: "Crème Brûlée",
    emoji: "🍰",
    category: "Desserts",
    servings: 1,
    ingredientCount: 6,
    yieldPercent: 85,
    linkedMenuItem: { id: "M045", name: "Crème Brûlée", sellPrice: 9.5 },
    costing: {
      totalCost: 1.85,
      costPercent: 19.5,
      status: "on",
      variance: -0.5,
    },
    ingredients: [
      { name: "Egg Yolks (4pc)", cost: 0.6, costPercent: 32 },
      { name: "Heavy Cream", cost: 0.68, costPercent: 37 },
      { name: "Sugar", cost: 0.08, costPercent: 4 },
      { name: "Vanilla", cost: 0.35, costPercent: 19 },
      { name: "Other (2)", cost: 0.05, costPercent: 3 },
    ],
    targetCostPercent: 20,
  },
]

export default function BOMPage() {
  const [view, setView] = useState<"list" | "card" | "analysis">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [costFilter, setCostFilter] = useState("all")
  const [linkFilter, setLinkFilter] = useState("all")
  const [sortBy, setSortBy] = useState("costPercent")
  const [expandedRecipes, setExpandedRecipes] = useState<string[]>([])
  const [recipeBuilderOpen, setRecipeBuilderOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<any>(null)
  const [linkMenuOpen, setLinkMenuOpen] = useState(false)
  const [linkingRecipe, setLinkingRecipe] = useState<any>(null)

  const toggleRecipeExpansion = (bomId: string) => {
    setExpandedRecipes((prev) => (prev.includes(bomId) ? prev.filter((id) => id !== bomId) : [...prev, bomId]))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under":
        return "text-green-600 bg-green-50 border-green-200"
      case "on":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "over":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "under":
        return "🟢 Good"
      case "on":
        return "🟢 Good"
      case "over":
        return "🔴 High"
      default:
        return ""
    }
  }

  // Group recipes by category
  const groupedRecipes = recipes.reduce(
    (acc, recipe) => {
      if (!acc[recipe.category]) {
        acc[recipe.category] = []
      }
      acc[recipe.category].push(recipe)
      return acc
    },
    {} as Record<string, typeof recipes>,
  )

  if (view === "analysis") {
    return <CostAnalysisView onBack={() => setView("list")} />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/inventory" className="hover:text-foreground flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Inventory
            </Link>
            <span>/</span>
            <span>Recipes & BOM</span>
          </div>
          <h1 className="text-2xl font-semibold">Recipes & BOM</h1>
          <p className="text-sm text-muted-foreground">Link ingredients to menu items and calculate food costs</p>
        </div>
        <Button
          onClick={() => {
            setEditingRecipe(null)
            setRecipeBuilderOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Recipe
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={costFilter} onValueChange={setCostFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Cost %" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cost %</SelectItem>
                <SelectItem value="under">Under Target</SelectItem>
                <SelectItem value="on">On Target</SelectItem>
                <SelectItem value="over">Over Target</SelectItem>
              </SelectContent>
            </Select>
            <Select value={linkFilter} onValueChange={setLinkFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Linked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recipes</SelectItem>
                <SelectItem value="linked">Linked to Menu</SelectItem>
                <SelectItem value="unlinked">Unlinked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Total Recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bomSummary.totalRecipes}</div>
            <p className="text-xs text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Link2 className="h-4 w-4" />
              Linked to Menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bomSummary.linkedRecipes}</div>
            <p className="text-xs text-muted-foreground mt-1">{bomSummary.linkedPercent}% linked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              Unlinked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bomSummary.unlinkedRecipes}</div>
            <p className="text-xs text-muted-foreground mt-1">Need review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Cost %</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bomSummary.avgCostPercent}%</div>
            <p className="text-xs text-muted-foreground mt-1">of sell price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Target Variance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bomSummary.targetVariance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Under target</p>
          </CardContent>
        </Card>
      </div>

      {/* View Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Button variant={view === "list" ? "default" : "outline"} size="sm" onClick={() => setView("list")}>
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button variant={view === "card" ? "default" : "outline"} size="sm" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Card View
          </Button>
          <Button variant={view === "analysis" ? "default" : "outline"} size="sm" onClick={() => setView("analysis")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Cost Analysis
          </Button>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="costPercent">Cost %</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Recipe List */}
      <div className="flex-1 overflow-auto space-y-6">
        {Object.entries(groupedRecipes).map(([category, categoryRecipes]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold uppercase text-muted-foreground">{category}</h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-3">
              {categoryRecipes.map((recipe) => {
                const isExpanded = expandedRecipes.includes(recipe.bomId)
                return (
                  <Card key={recipe.bomId} className="overflow-hidden">
                    <CardContent className="p-4">
                      {/* Recipe Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{recipe.emoji}</span>
                            <h3 className="font-semibold text-lg">{recipe.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {recipe.ingredientCount} ingredients • {recipe.servings} serving
                            {recipe.yieldPercent && ` • ${recipe.yieldPercent}% yield`}
                          </p>
                        </div>
                        {recipe.linkedMenuItem ? (
                          <Badge variant="outline" className="gap-1">
                            <Link2 className="h-3 w-3" />
                            Menu #{recipe.linkedMenuItem.id}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 border-orange-300 text-orange-600 bg-orange-50">
                            <AlertTriangle className="h-3 w-3" />
                            Unlinked
                          </Badge>
                        )}
                      </div>

                      {/* Cost Breakdown */}
                      {recipe.ingredients.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => toggleRecipeExpansion(recipe.bomId)}
                            className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
                          >
                            {isExpanded ? "Hide" : "Show"} cost breakdown
                          </button>
                          {isExpanded && (
                            <div className="space-y-2 bg-muted/30 p-3 rounded-md">
                              {recipe.ingredients.map((ing, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <div className="w-32 truncate">{ing.name}</div>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${ing.costPercent}%` }} />
                                  </div>
                                  <div className="w-20 text-right font-medium">€{ing.cost.toFixed(2)}</div>
                                  <div className="w-12 text-right text-muted-foreground">({ing.costPercent}%)</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Metrics */}
                      {recipe.linkedMenuItem ? (
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">💰 Food Cost</div>
                            <div className="text-lg font-bold">€{recipe.costing.totalCost.toFixed(2)}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">💵 Sell Price</div>
                            <div className="text-lg font-bold">€{recipe.linkedMenuItem.sellPrice.toFixed(2)}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">📊 Cost %</div>
                            <div className="text-lg font-bold">{recipe.costing.costPercent}%</div>
                            <div className="text-xs">{getStatusLabel(recipe.costing.status)}</div>
                          </div>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">🎯 Target</div>
                            <div className="text-lg font-bold">{recipe.targetCostPercent}%</div>
                            <div className="text-xs flex items-center gap-1">
                              {recipe.costing.variance < 0 ? (
                                <>
                                  <TrendingDown className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">{recipe.costing.variance}%</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="h-3 w-3 text-red-600" />
                                  <span className="text-red-600">+{recipe.costing.variance}%</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-md mb-4">
                          <p className="text-sm text-orange-900">
                            Food Cost: €{recipe.costing.totalCost.toFixed(2)} • Target: {recipe.targetCostPercent}%
                          </p>
                          <p className="text-sm text-orange-900 mt-1">
                            Suggested Sell Price: €{recipe.costing.suggestedSellPrice?.toFixed(2)} (to hit target)
                          </p>
                        </div>
                      )}

                      {/* Alert if over target */}
                      {recipe.costing.status === "over" && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <p className="text-sm text-red-900">
                            Cost above target - Consider portion or price adjustment
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        {!recipe.linkedMenuItem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLinkingRecipe(recipe)
                              setLinkMenuOpen(true)
                            }}
                          >
                            Link to Menu →
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRecipe(recipe)
                            setRecipeBuilderOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">Showing 1-10 of {bomSummary.totalRecipes} recipes</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="ghost" size="sm">
            2
          </Button>
          <Button variant="ghost" size="sm">
            3
          </Button>
          <span className="text-muted-foreground">...</span>
          <Button variant="ghost" size="sm">
            9
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>

      {/* Drawers/Modals */}
      <RecipeBuilderDrawer open={recipeBuilderOpen} onOpenChange={setRecipeBuilderOpen} recipe={editingRecipe} />
      <LinkMenuModal open={linkMenuOpen} onOpenChange={setLinkMenuOpen} recipe={linkingRecipe} />
    </div>
  )
}

function CostAnalysisView({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to List
          </Button>
          <h1 className="text-2xl font-semibold">Cost Analysis View</h1>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-40 text-sm">Under Target (58)</div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: "65%" }} />
              </div>
              <div className="w-12 text-sm font-medium">65%</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-40 text-sm">On Target (19)</div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: "21%" }} />
              </div>
              <div className="w-12 text-sm font-medium">21%</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-40 text-sm">Over Target (12)</div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: "14%" }} />
              </div>
              <div className="w-12 text-sm font-medium">14%</div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-8 text-sm">
            <div>
              <span className="text-muted-foreground">Average: </span>
              <span className="font-semibold">28.4%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Target: </span>
              <span className="font-semibold">30%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Variance: </span>
              <span className="font-semibold text-green-600">-1.6% 🟢</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">🔴 Needs Attention (Cost &gt; Target)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left pb-2">Recipe</th>
                  <th className="text-right pb-2">Cost</th>
                  <th className="text-right pb-2">Target</th>
                  <th className="text-right pb-2">Over by</th>
                  <th className="text-right pb-2">Sales/wk</th>
                  <th className="text-right pb-2">Impact</th>
                  <th className="text-right pb-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">🥩 Ribeye Steak</td>
                  <td className="text-right">35.5%</td>
                  <td className="text-right">30%</td>
                  <td className="text-right text-red-600">+5.5%</td>
                  <td className="text-right">89</td>
                  <td className="text-right font-medium">€186/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">🦞 Surf & Turf</td>
                  <td className="text-right">38.2%</td>
                  <td className="text-right">32%</td>
                  <td className="text-right text-red-600">+6.2%</td>
                  <td className="text-right">34</td>
                  <td className="text-right font-medium">€127/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">🍔 Wagyu Burger</td>
                  <td className="text-right">34.0%</td>
                  <td className="text-right">28%</td>
                  <td className="text-right text-red-600">+6.0%</td>
                  <td className="text-right">67</td>
                  <td className="text-right font-medium">€156/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-red-900">
              💡 Total weekly margin loss from over-target items: <span className="font-semibold">€469</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">🟢 Top Performers (Most under target)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="text-left pb-2">Recipe</th>
                  <th className="text-right pb-2">Cost</th>
                  <th className="text-right pb-2">Target</th>
                  <th className="text-right pb-2">Under</th>
                  <th className="text-right pb-2">Sales/wk</th>
                  <th className="text-right pb-2">Margin</th>
                  <th className="text-right pb-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">🍳 Classic Omelet</td>
                  <td className="text-right">12.8%</td>
                  <td className="text-right">15%</td>
                  <td className="text-right text-green-600">-2.2%</td>
                  <td className="text-right">847</td>
                  <td className="text-right font-medium">€9.2k/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">🥗 Caesar Salad</td>
                  <td className="text-right">18.5%</td>
                  <td className="text-right">22%</td>
                  <td className="text-right text-green-600">-3.5%</td>
                  <td className="text-right">234</td>
                  <td className="text-right font-medium">€2.8k/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">🍝 Spaghetti Carb.</td>
                  <td className="text-right">21.0%</td>
                  <td className="text-right">25%</td>
                  <td className="text-right text-green-600">-4.0%</td>
                  <td className="text-right">189</td>
                  <td className="text-right font-medium">€2.4k/wk</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm">
                      →
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
