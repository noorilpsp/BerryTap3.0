"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Folder,
  FolderOpen,
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  ArrowLeft,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockFoldersData } from "./folders-mock-data"

export default function CampaignFoldersPage() {
  const [selectedFolder, setSelectedFolder] = useState("q4_2024")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["root", "q4_2024"])
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { folders, campaignsByFolder } = mockFoldersData

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => (prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]))
  }

  const selectedFolderData = folders.find((f) => f.id === selectedFolder)
  const campaignsInFolder = campaignsByFolder[selectedFolder] || []

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Folder className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Campaign Folders</h1>
        </div>
        <Button onClick={() => setCreateFolderOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folder Tree */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Folder Tree</CardTitle>
            <CardDescription>Organize your campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {folders
                .filter((f) => !f.parentId)
                .map((folder) => (
                  <FolderTreeItem
                    key={folder.id}
                    folder={folder}
                    allFolders={folders}
                    selectedFolder={selectedFolder}
                    expandedFolders={expandedFolders}
                    onSelect={setSelectedFolder}
                    onToggle={toggleFolder}
                    level={0}
                  />
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 bg-transparent"
              onClick={() => setCreateFolderOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">Drag & drop to organize</p>
          </CardContent>
        </Card>

        {/* Campaigns in Folder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {selectedFolderData?.name} ({campaignsInFolder.length})
                </CardTitle>
                <CardDescription>{selectedFolderData?.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search in folder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-3">
              {campaignsInFolder.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No campaigns in this folder</p>
                </div>
              ) : (
                campaignsInFolder.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <StatusBadge status={campaign.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {campaign.channels.includes("email") && <Mail className="w-3 h-3" />}
                              {campaign.channels.includes("sms") && <MessageSquare className="w-3 h-3" />}
                            </span>
                            <span>{campaign.recipientCount.toLocaleString()} sent</span>
                            {campaign.openRate && <span>{campaign.openRate}% open</span>}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Organize your campaigns into folders</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="folderName">Folder Name *</Label>
              <Input id="folderName" placeholder="Q4 2024 Campaigns" className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="All promotional campaigns for Q4 2024"
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="parent">Parent Folder</Label>
              <Select defaultValue="root">
                <SelectTrigger id="parent" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root / All Campaigns</SelectItem>
                  <SelectItem value="q4_2024">Q4 2024</SelectItem>
                  <SelectItem value="templates">Templates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {["red", "orange", "yellow", "green", "blue", "purple"].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 border-transparent hover:border-foreground/20",
                      color === "red" && "bg-red-500",
                      color === "orange" && "bg-orange-500",
                      color === "yellow" && "bg-yellow-500",
                      color === "green" && "bg-green-500",
                      color === "blue" && "bg-blue-500",
                      color === "purple" && "bg-purple-500",
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <RadioGroup defaultValue="everyone" className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Everyone can view and add campaigns</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="me" id="me" />
                  <Label htmlFor="me">Only me</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific">Specific team members</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Auto-organize rules (optional)</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-start gap-2">
                  <Checkbox id="autoTags" />
                  <Label htmlFor="autoTags" className="font-normal">
                    Auto-add campaigns with tags: <Input placeholder="q4, promo" className="inline-block w-48 ml-2" />
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setCreateFolderOpen(false)}>Create Folder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FolderTreeItem({
  folder,
  allFolders,
  selectedFolder,
  expandedFolders,
  onSelect,
  onToggle,
  level,
}: {
  folder: any
  allFolders: any[]
  selectedFolder: string
  expandedFolders: string[]
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  level: number
}) {
  const children = allFolders.filter((f) => f.parentId === folder.id)
  const hasChildren = children.length > 0
  const isExpanded = expandedFolders.includes(folder.id)
  const isSelected = selectedFolder === folder.id

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent",
          isSelected && "bg-accent font-medium",
          level > 0 && "ml-4",
        )}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(folder.id)
            }}
            className="p-0.5"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!hasChildren && <div className="w-5" />}
        {isExpanded ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary" />}
        <span className="flex-1">{folder.name}</span>
        <Badge variant="secondary" className="text-xs">
          {folder.campaignCount}
        </Badge>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              selectedFolder={selectedFolder}
              expandedFolders={expandedFolders}
              onSelect={onSelect}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    sent: { icon: CheckCircle, label: "Sent", className: "bg-success/10 text-success" },
    scheduled: { icon: Clock, label: "Scheduled", className: "bg-primary/10 text-primary" },
  }

  const { icon: Icon, label, className } = config[status as keyof typeof config] || config.sent

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}
