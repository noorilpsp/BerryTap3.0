import Papa from "papaparse"
import type { ImportMenuCatalog, ImportStationCatalog } from "@/lib/menu/import-items"

export const MENU_IMPORT_TEMPLATE_FILENAME = "menu-import-template.csv"

const TEMPLATE_COLUMNS = [
  "name",
  "price",
  "category",
  "menu",
  "description",
  "photo_url",
  "prep_station",
  "kitchen_lane",
  "tags",
  "allergens",
  "calories",
  "status",
] as const

function pickExampleStation(catalog?: ImportStationCatalog) {
  const active = (catalog ?? []).filter((s) => s.isActive)
  const withLanes = active.find((s) => s.substations.length > 0)
  if (withLanes) {
    return {
      prepStation: withLanes.key,
      kitchenLane: withLanes.substations[0]?.key ?? "",
    }
  }
  if (active[0]) {
    return { prepStation: active[0].key, kitchenLane: "" }
  }
  return { prepStation: "kitchen", kitchenLane: "grill" }
}

function pickExampleMenu(menuCatalog?: ImportMenuCatalog) {
  if (menuCatalog && menuCatalog.length > 0) {
    return menuCatalog[0].name
  }
  return "Lunch Menu"
}

export function buildMenuImportTemplateCsv(
  stationCatalog?: ImportStationCatalog,
  menuCatalog?: ImportMenuCatalog,
): string {
  const { prepStation, kitchenLane } = pickExampleStation(stationCatalog)
  const exampleMenu = pickExampleMenu(menuCatalog)

  const rows: Array<Record<(typeof TEMPLATE_COLUMNS)[number], string>> = [
    {
      name: "Margherita Pizza",
      price: "14.50",
      category: "Pizzas",
      menu: exampleMenu,
      description: "Classic tomato and mozzarella",
      photo_url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
      prep_station: prepStation,
      kitchen_lane: kitchenLane,
      tags: "Popular",
      allergens: "Gluten",
      calories: "820",
      status: "draft",
    },
    {
      name: "Caesar Salad",
      price: "9.00",
      category: "Salads",
      menu: "",
      description: "Romaine and parmesan",
      photo_url: "",
      prep_station: "",
      kitchen_lane: "",
      tags: "",
      allergens: "",
      calories: "",
      status: "",
    },
  ]

  return Papa.unparse(rows, { columns: [...TEMPLATE_COLUMNS] })
}

export const MENU_IMPORT_TEMPLATE_CSV = buildMenuImportTemplateCsv()

export function downloadMenuImportTemplate(
  stationCatalog?: ImportStationCatalog,
  menuCatalog?: ImportMenuCatalog,
): void {
  const content = `\uFEFF${buildMenuImportTemplateCsv(stationCatalog, menuCatalog)}`
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = MENU_IMPORT_TEMPLATE_FILENAME
  link.click()
  URL.revokeObjectURL(url)
}

export function formatStationCatalogHint(catalog?: ImportStationCatalog): string | null {
  const active = (catalog ?? []).filter((s) => s.isActive)
  if (active.length === 0) return null

  return active
    .map((s) => {
      if (s.substations.length === 0) {
        return `${s.key}`
      }
      const lanes = s.substations.map((ss) => ss.key).join(", ")
      return `${s.key} (lanes: ${lanes})`
    })
    .join(" · ")
}

export function formatMenuCatalogHint(catalog?: ImportMenuCatalog): string | null {
  if (!catalog || catalog.length === 0) return null
  return catalog.map((m) => m.name).join(", ")
}
