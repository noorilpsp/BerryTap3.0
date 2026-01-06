"use client"

import { useState } from "react"
import { PhotoUpload } from "@/components/photo-upload"
import { PhotoGuidelines } from "@/components/photo-guidelines"
import type { Photo } from "@/types/photo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PhotoManagementDemo() {
  const [noPhoto, setNoPhoto] = useState<Photo | undefined>(undefined)
  const [approvedPhoto, setApprovedPhoto] = useState<Photo | undefined>({
    id: "1",
    url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200",
    status: "approved",
    uploadedAt: new Date("2025-03-10"),
    approvedAt: new Date("2025-03-12"),
    metadata: {
      size: 2400000,
      width: 1200,
      height: 1200,
      format: "jpg",
    },
  })
  const [pendingPhoto, setPendingPhoto] = useState<Photo | undefined>({
    id: "2",
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200",
    status: "pending",
    uploadedAt: new Date("2025-03-14"),
    metadata: {
      size: 1800000,
      width: 1000,
      height: 1000,
      format: "jpg",
    },
  })
  const [rejectedPhoto, setRejectedPhoto] = useState<Photo | undefined>({
    id: "3",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    thumbnailUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200",
    status: "rejected",
    uploadedAt: new Date("2025-03-13"),
    rejectedAt: new Date("2025-03-14"),
    rejectionReason: "Image is too dark. Try using natural lighting or increase brightness.",
    metadata: {
      size: 2100000,
      width: 1100,
      height: 1100,
      format: "jpg",
    },
  })

  const handleUpload = async (file: File) => {
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Uploaded file:", file.name)
  }

  const handleReplace = async (file: File) => {
    // Simulate replace
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Replaced with file:", file.name)
  }

  const handleRemove = async () => {
    // Simulate remove
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("[v0] Photo removed")
  }

  const handleWithdraw = async () => {
    // Simulate withdraw
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("[v0] Submission withdrawn")
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Photo Management System</h1>
        <p className="text-gray-600">Upload and manage menu item photos with approval workflow</p>
      </div>

      <Tabs defaultValue="no-photo" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="no-photo">No Photo</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="no-photo" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PhotoUpload
                currentPhoto={noPhoto}
                onUpload={handleUpload}
                onReplace={handleReplace}
                onRemove={handleRemove}
                onWithdraw={handleWithdraw}
                guidelines={true}
              />
            </div>
            <div>
              <PhotoGuidelines />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PhotoUpload
                currentPhoto={approvedPhoto}
                onUpload={handleUpload}
                onReplace={handleReplace}
                onRemove={handleRemove}
                onWithdraw={handleWithdraw}
                guidelines={true}
              />
            </div>
            <div>
              <PhotoGuidelines />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PhotoUpload
                currentPhoto={pendingPhoto}
                onUpload={handleUpload}
                onReplace={handleReplace}
                onRemove={handleRemove}
                onWithdraw={handleWithdraw}
                guidelines={true}
              />
            </div>
            <div>
              <PhotoGuidelines />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PhotoUpload
                currentPhoto={rejectedPhoto}
                onUpload={handleUpload}
                onReplace={handleReplace}
                onRemove={handleRemove}
                onWithdraw={handleWithdraw}
                guidelines={true}
              />
            </div>
            <div>
              <PhotoGuidelines />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
