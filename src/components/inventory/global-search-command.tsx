"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Plus, Package, Repeat, Calculator, Trash2, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const quickActions = [
  { id: "create_sku", icon: Plus, label: "Create new SKU", shortcut: "N", href: "/inventory/skus?action=new" },
  {
    id: "create_po",
    icon: Package,
    label: "Create purchase order",
    shortcut: "P",
    href: "/inventory/purchase-orders?action=new",
  },
  {
    id: "create_transfer",
    icon: Repeat,
    label: "Create transfer",
    shortcut: "T",
    href: "/inventory/transfers?action=new",
  },
  {
    id: "start_count",
    icon: Calculator,
    label: "Start stock count",
    shortcut: "C",
    href: "/inventory/stockcounts?action=new",
  },
  { id: "log_waste", icon: Trash2, label: "Log waste", shortcut: "W", href: "/inventory?action=waste" },
  { id: "view_reports", icon: BarChart3, label: "View reports", shortcut: "R", href: "/inventory/reports" },
]

const recentItems = [
  {
    type: "sku",
    id: "sku_beef",
    name: "Beef Tenderloin",
    code: "BEF001",
    emoji: "🥩",
    href: "/inventory/skus?id=sku_beef",
  },
  {
    type: "po",
    id: "po_1858",
    name: "PO #1858 - Fresh Farms",
    emoji: "📦",
    href: "/inventory/purchase-orders/po_1858",
  },
  { type: "transfer", id: "tr_158", name: "Transfer #TR-158", emoji: "🔄", href: "/inventory/transfers?id=tr_158" },
  { type: "count", id: "cs_089", name: "Count #CS-089", emoji: "🧮", href: "/inventory/stockcounts?id=cs_089" },
]

const mockSearchResults = {
  skus: [
    {
      id: "1",
      name: "Chicken Breast",
      code: "CHK001",
      category: "Proteins",
      stock: "12.5 kg",
      status: "healthy",
      emoji: "🍗",
    },
    {
      id: "2",
      name: "Chicken Thighs",
      code: "CHK002",
      category: "Proteins",
      stock: "8.2 kg",
      status: "low",
      emoji: "🍗",
    },
    { id: "3", name: "Chicken Wings", code: "CHK003", category: "Proteins", stock: "0 kg", status: "out", emoji: "🍗" },
    {
      id: "4",
      name: "Chicken Stock",
      code: "STK001",
      category: "Dry Goods",
      stock: "24 L",
      status: "healthy",
      emoji: "🥣",
    },
  ],
  recipes: [
    { id: "1", name: "Chicken Parmesan", ingredients: "8 ingredients", cost: "€4.32", emoji: "🍳" },
    { id: "2", name: "Grilled Chicken Salad", ingredients: "12 ingredients", cost: "€3.87", emoji: "🍳" },
  ],
  suppliers: [{ id: "1", name: "Poultry Plus", products: "12 products", badge: "Preferred", emoji: "🏪" }],
}

export function GlobalSearchCommand() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const hasSearchQuery = search.length > 0

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search inventory..." value={search} onValueChange={setSearch} />
      <CommandList>
        {!hasSearchQuery ? (
          <>
            <CommandGroup heading="QUICK ACTIONS">
              {quickActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    router.push(action.href)
                    setOpen(false)
                  }}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    {action.shortcut}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="RECENT">
              {recentItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    router.push(item.href)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2">{item.emoji}</span>
                  <span>{item.name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.type === "sku"
                      ? "SKU"
                      : item.type === "po"
                        ? "Purchase Order"
                        : item.type === "transfer"
                          ? "Transfer"
                          : "Stock Count"}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">Search for SKUs, suppliers, purchase orders, recipes...</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tips: Type "sku:" for SKUs only, "po:" for POs, "sup:" for suppliers
                </p>
              </div>
            </CommandEmpty>
          </>
        ) : (
          <>
            <CommandEmpty>No results found for "{search}"</CommandEmpty>
            <CommandGroup heading={`SKUS (${mockSearchResults.skus.length})`}>
              {mockSearchResults.skus.map((sku) => (
                <CommandItem
                  key={sku.id}
                  onSelect={() => {
                    router.push(`/inventory/skus?id=${sku.id}`)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2">{sku.emoji}</span>
                  <div className="flex flex-col">
                    <span>{sku.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {sku.code} • {sku.category} • {sku.stock} •{" "}
                      {sku.status === "healthy" ? "🟢 Healthy" : sku.status === "low" ? "🟡 Low" : "🔴 Out"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={`RECIPES (${mockSearchResults.recipes.length})`}>
              {mockSearchResults.recipes.map((recipe) => (
                <CommandItem
                  key={recipe.id}
                  onSelect={() => {
                    router.push(`/inventory/bom?id=${recipe.id}`)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2">{recipe.emoji}</span>
                  <div className="flex flex-col">
                    <span>{recipe.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Recipe • {recipe.ingredients} • {recipe.cost} cost
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading={`SUPPLIERS (${mockSearchResults.suppliers.length})`}>
              {mockSearchResults.suppliers.map((supplier) => (
                <CommandItem
                  key={supplier.id}
                  onSelect={() => {
                    router.push(`/inventory/settings?tab=suppliers&id=${supplier.id}`)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2">{supplier.emoji}</span>
                  <div className="flex flex-col">
                    <span>{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Supplier • {supplier.products} • ⭐ {supplier.badge}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
