"use client"

import { useState } from "react"
import { FileText, Star, Edit, Trash2, Copy, Play, Share2, MoreVertical, Search, Filter, BarChart3, Lock, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TemplateLibraryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const templateLibrary = [
  {
    templateId: "tmpl_001",
    name: "Monthly Sales Report",
    dataset: "Orders",
    format: "CSV",
    useCount: 47,
    lastModified: "2 days ago",
    isFavorite: true,
    visibility: "team",
    tags: ["accounting", "monthly"],
    containsPII: false,
  },
  {
    templateId: "tmpl_002",
    name: "Staff Performance",
    dataset: "Staff Metrics",
    format: "XLSX",
    useCount: 28,
    lastModified: "1 week ago",
    isFavorite: true,
    visibility: "team",
    tags: ["staff", "weekly"],
    containsPII: true,
  },
  {
    templateId: "tmpl_003",
    name: "Weekly Revenue",
    dataset: "Orders",
    format: "CSV",
    useCount: 63,
    lastModified: "Yesterday",
    isFavorite: true,
    visibility: "team",
    tags: ["revenue", "weekly"],
    containsPII: false,
  },
  {
    templateId: "tmpl_004",
    name: "Payroll Data",
    dataset: "Staff Metrics",
    format: "XLSX",
    useCount: 12,
    lastModified: "3 days ago",
    isFavorite: false,
    visibility: "private",
    tags: ["payroll", "hr"],
    containsPII: true,
  },
]

export function TemplateLibraryModal({ open, onOpenChange }: TemplateLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("my")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Template Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              + New Template
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="my">My Templates (8)</TabsTrigger>
              <TabsTrigger value="team">Team Templates (12)</TabsTrigger>
              <TabsTrigger value="org">Organization (3)</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 overflow-auto">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Modified</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templateLibrary.map((template) => (
                      <TableRow key={template.templateId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {template.isFavorite && (
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                            )}
                            {template.visibility === "private" && (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            {template.visibility === "team" && (
                              <Users className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="flex gap-1 mt-1">
                                {template.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {template.containsPII && (
                                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs">
                                    PII
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.dataset}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{template.format}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {template.useCount}×
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {template.lastModified}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Use Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="mr-2 h-4 w-4" />
                                Toggle Favorite
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Manage Sharing
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Usage Stats
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Template
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Showing {templateLibrary.length} of {templateLibrary.length} templates
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
