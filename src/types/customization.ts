export interface CustomizationOption {
  id: string
  name: string
  priceDelta: number
  isDefault: boolean
  order: number
}

export interface CustomizationGroup {
  id: string
  name: string
  customerInstructions: string
  internalNotes?: string
  rules: {
    min: number
    max: number
    required: boolean
  }
  options: CustomizationOption[]
  itemCount: number
  itemNames: string[]
}

export interface CustomizationsContentProps {
  groups: CustomizationGroup[]
  onCreateGroup: () => void
  onEditGroup: (id: string) => void
  onDeleteGroup: (id: string) => void
  onDuplicateGroup: (id: string) => void
}

export interface ConditionalPricing {
  enabled: boolean
  basedOnGroupId: string
  priceMatrix: {
    [optionId: string]: {
      [baseOptionId: string]: number
    }
  }
}

export interface ConditionalQuantities {
  enabled: boolean
  basedOnGroupId: string
  rulesMatrix: {
    [baseOptionId: string]: {
      min: number
      max: number
      required: boolean
      maxPerOption: number
    }
  }
}

export interface SecondaryGroupRule {
  id: string
  triggerOptionId: string
  showGroupId: string
  required: boolean
}

export interface SecondaryGroups {
  rules: SecondaryGroupRule[]
}

export interface DefaultSelections {
  [optionId: string]: number
}

export interface AdvancedCustomizationGroup extends CustomizationGroup {
  conditionalPricing?: ConditionalPricing
  conditionalQuantities?: ConditionalQuantities
  secondaryGroups?: SecondaryGroups
  defaultSelections?: DefaultSelections
}
