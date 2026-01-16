export interface Category {
  id: string
  name: string
  emoji?: string
  description?: string
  displayOrder: number
  itemCount: number
  menuIds: string[]
  menuNames: string[]
  isExpanded?: boolean
}

export interface CategoriesContentProps {
  categories: Category[]
  items?: any[] // Menu items to count associations
  onCreateCategory: () => void
  onEditCategory: (id: string) => void
  onDeleteCategory: (id: string) => void
  onReorder: (categories: Category[]) => void
  uncategorizedCount?: number
  isLoading?: boolean
}
