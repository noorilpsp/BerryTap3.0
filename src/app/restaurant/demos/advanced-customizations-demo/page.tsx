"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConditionalPricingBuilder } from "@/components/customization/conditional-pricing-builder"
import { ConditionalQuantitiesBuilder } from "@/components/customization/conditional-quantities-builder"
import { SecondaryGroupsManager } from "@/components/customization/secondary-groups-manager"
import { DefaultSelectionsUI } from "@/components/customization/default-selections-ui"
import type {
  ConditionalPricing,
  ConditionalQuantities,
  SecondaryGroups,
  DefaultSelections,
  CustomizationGroup,
} from "@/types/customization"

export default function AdvancedCustomizationsDemo() {
  // Mock data
  const mockSizeGroup: CustomizationGroup = {
    id: "size",
    name: "Size",
    customerInstructions: "Choose your pizza size",
    rules: { min: 1, max: 1, required: true },
    options: [
      { id: "s", name: 'Small (10")', priceDelta: 0, isDefault: false, order: 0 },
      { id: "m", name: 'Medium (14")', priceDelta: 4, isDefault: false, order: 1 },
      { id: "l", name: 'Large (18")', priceDelta: 8, isDefault: false, order: 2 },
    ],
    itemCount: 12,
    itemNames: ["Margherita Pizza", "Pepperoni Pizza"],
  }

  const mockToppingsGroup: CustomizationGroup = {
    id: "toppings",
    name: "Toppings",
    customerInstructions: "Choose your toppings",
    rules: { min: 0, max: 5, required: false },
    options: [
      { id: "t1", name: "Mushrooms", priceDelta: 1.5, isDefault: false, order: 0 },
      { id: "t2", name: "Olives", priceDelta: 1.5, isDefault: false, order: 1 },
      { id: "t3", name: "Extra Cheese", priceDelta: 2.0, isDefault: false, order: 2 },
      { id: "t4", name: "Pepperoni", priceDelta: 2.0, isDefault: false, order: 3 },
    ],
    itemCount: 8,
    itemNames: ["Margherita Pizza", "Veggie Pizza"],
  }

  const mockMilkGroup: CustomizationGroup = {
    id: "milk",
    name: "Milk Options",
    customerInstructions: "Choose your milk type",
    rules: { min: 1, max: 1, required: true },
    options: [
      { id: "dairy", name: "Dairy Milk", priceDelta: 0, isDefault: true, order: 0 },
      { id: "oat", name: "Oat Milk", priceDelta: 0.75, isDefault: false, order: 1 },
      { id: "almond", name: "Almond Milk", priceDelta: 0.75, isDefault: false, order: 2 },
    ],
    itemCount: 15,
    itemNames: ["Latte", "Cappuccino"],
  }

  const mockBrandGroup: CustomizationGroup = {
    id: "brand",
    name: "Milk Brand",
    customerInstructions: "Choose your preferred brand",
    rules: { min: 1, max: 1, required: true },
    options: [
      { id: "brand-a", name: "Brand A", priceDelta: 0, isDefault: false, order: 0 },
      { id: "brand-b", name: "Brand B", priceDelta: 0.5, isDefault: false, order: 1 },
    ],
    itemCount: 0,
    itemNames: [],
  }

  const mockVeggiesGroup: CustomizationGroup = {
    id: "veggies",
    name: "Vegetables",
    customerInstructions: "Choose your vegetables",
    rules: { min: 0, max: 5, required: false },
    options: [
      { id: "lettuce", name: "Lettuce", priceDelta: 0, isDefault: true, order: 0 },
      { id: "tomato", name: "Tomato", priceDelta: 0, isDefault: true, order: 1 },
      { id: "onions", name: "Onions", priceDelta: 0.5, isDefault: false, order: 2 },
      { id: "pickles", name: "Pickles", priceDelta: 0.5, isDefault: false, order: 3 },
    ],
    itemCount: 6,
    itemNames: ["Classic Burger", "Veggie Burger"],
  }

  const availableGroups = [mockSizeGroup, mockToppingsGroup, mockMilkGroup, mockBrandGroup, mockVeggiesGroup]

  // State for conditional pricing
  const [conditionalPricing, setConditionalPricing] = useState<ConditionalPricing>({
    enabled: false,
    basedOnGroupId: "",
    priceMatrix: {},
  })

  // State for conditional quantities
  const [conditionalQuantities, setConditionalQuantities] = useState<ConditionalQuantities>({
    enabled: false,
    basedOnGroupId: "",
    rulesMatrix: {},
  })

  // State for secondary groups
  const [secondaryGroups, setSecondaryGroups] = useState<SecondaryGroups>({
    rules: [],
  })

  // State for default selections
  const [defaultSelections, setDefaultSelections] = useState<DefaultSelections>({
    lettuce: 1,
    tomato: 1,
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Advanced Customization Features</h1>
        <p className="text-muted-foreground mt-2">
          Configure conditional pricing, quantities, secondary groups, and default selections
        </p>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pricing">Conditional Pricing</TabsTrigger>
          <TabsTrigger value="quantities">Conditional Quantities</TabsTrigger>
          <TabsTrigger value="secondary">Secondary Groups</TabsTrigger>
          <TabsTrigger value="defaults">Default Selections</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-6">
          <ConditionalPricingBuilder
            currentGroup={mockToppingsGroup}
            availableGroups={availableGroups}
            value={conditionalPricing}
            onChange={setConditionalPricing}
          />
        </TabsContent>

        <TabsContent value="quantities" className="space-y-6">
          <ConditionalQuantitiesBuilder
            currentGroup={mockToppingsGroup}
            availableGroups={availableGroups}
            value={conditionalQuantities}
            onChange={setConditionalQuantities}
          />
        </TabsContent>

        <TabsContent value="secondary" className="space-y-6">
          <SecondaryGroupsManager
            currentGroup={mockMilkGroup}
            availableGroups={availableGroups}
            value={secondaryGroups}
            onChange={setSecondaryGroups}
          />
        </TabsContent>

        <TabsContent value="defaults" className="space-y-6">
          <DefaultSelectionsUI
            currentGroup={mockVeggiesGroup}
            value={defaultSelections}
            onChange={setDefaultSelections}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
