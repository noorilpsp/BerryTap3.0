"use client"

import { useState } from "react"
import { FileText, Star, Users, Lock, MoreVertical, Edit, Trash2, Copy, Play, UtensilsCrossed, TrendingUp, Calendar, Plus } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { savedTemplates } from "@/app/dashboard/(dashboard)/exports/data"
import { TemplateLibraryModal } from "./template-library-modal"

const iconMap: Record<string, any> = {
  Star,
  Users,
  Lock,
  UtensilsCrossed,
  TrendingUp,
  FileText,
  Calendar,
}

export function TemplatesPanel() {
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(savedTemplates.filter((t) => t.favorite).map((t) => t.templateId))
  )
  const [showLibrary, setShowLibrary] = useState(false)

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  const handleUseTemplate = (templateId: string) => {
    console.log("[v0] Using template:", templateId)
  }

  const handleEditTemplate = (templateId: string) => {
    console.log("[v0] Editing template:", templateId)
  }

  const handleDuplicateTemplate = (templateId: string) => {
    console.log("[v0] Duplicating template:", templateId)
  }

  const handleDeleteTemplate = (templateId: string) => {
    console.log("[v0] Deleting template:", templateId)
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Saved Templates</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Quick access to exports</p>
          </div>
          <Button size="sm" className="gap-1.5 h-8 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {/* Templates List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2.5">
            {savedTemplates.slice(0, 8).map((template) => {
              const Icon = iconMap[template.icon]
              const isFavorite = favorites.has(template.templateId)
              
              return (
                <Card
                  key={template.templateId}
                  className="p-3 transition-all hover:shadow-md hover:bg-accent/5 cursor-pointer border"
                  role="article"
                  aria-label={`${template.name} template`}
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          {template.private ? (
                            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center">
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                              <Icon className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <h3 className="font-semibold text-sm truncate text-foreground">{template.name}</h3>
                          {isFavorite && (
                            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 flex-shrink-0"
                            aria-label={`Actions for ${template.name}`}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTemplate(template.templateId)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.templateId)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFavorite(template.templateId)}>
                            <Star className="mr-2 h-4 w-4" />
                            {isFavorite ? "Unfavorite" : "Favorite"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteTemplate(template.templateId)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{template.datasetLabel}</Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{template.format.toUpperCase()}</Badge>
                      <span className="text-muted-foreground text-[11px]">
                        {template.columnCount} cols
                      </span>
                      {template.containsPII && (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] px-1.5 py-0">
                          PII
                        </Badge>
                      )}
                    </div>

                    {/* Last used */}
                    <p className="text-[11px] text-muted-foreground">
                      Last used: {template.lastUsedLabel}
                    </p>

                    <Button
                      onClick={() => handleUseTemplate(template.templateId)}
                      size="sm"
                      variant="outline"
                      className="w-full gap-1.5 h-8 text-xs"
                      aria-label={`Use ${template.name} template`}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Use Template
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="p-3">
            <Button 
              variant="ghost" 
              className="w-full gap-2 h-9 text-xs" 
              aria-label="View all templates"
              onClick={() => setShowLibrary(true)}
            >
              View All ({savedTemplates.length})
              <FileText className="h-3.5 w-3.5" />
            </Button>
          </div>
        </ScrollArea>
      </div>

      <TemplateLibraryModal open={showLibrary} onOpenChange={setShowLibrary} />
    </>
  )
}
