"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import type { PhotoUploadProps } from "@/types/photo"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Upload, CheckCircle, Clock, XCircle, AlertCircle, Trash2, X, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PhotoGuidelines } from "@/components/photo-guidelines"

export function PhotoUpload({
  currentPhoto,
  onUpload,
  onReplace,
  onRemove,
  onWithdraw,
  guidelines = true,
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check format
    const validFormats = ["image/jpeg", "image/png", "image/webp"]
    if (!validFormats.includes(file.type)) {
      return "Only JPG, PNG, and WebP are supported"
    }

    // Check size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return "File size exceeds 5MB limit"
    }

    return null
  }

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
      setPreviewFile(file)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadConfirm = async () => {
    if (!previewFile) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + 10
      })
    }, 200)

    try {
      if (currentPhoto) {
        await onReplace(previewFile)
      } else {
        await onUpload(previewFile)
      }
      setUploadProgress(100)
      toast.success("Photo uploaded successfully")
      setPreviewFile(null)
      setPreviewUrl(null)
    } catch (error) {
      toast.error("Upload failed. Please try again")
    } finally {
      clearInterval(interval)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleCancelPreview = () => {
    setPreviewFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemove = async () => {
    try {
      await onRemove()
      toast.success("Photo removed")
    } catch (error) {
      toast.error("Failed to remove photo")
    }
  }

  const handleWithdraw = async () => {
    try {
      await onWithdraw()
      toast.success("Submission withdrawn")
    } catch (error) {
      toast.error("Failed to withdraw submission")
    }
  }

  // Show preview if file is selected
  if (previewFile && previewUrl) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Preview Photo</h3>
          <p className="text-sm text-gray-600">Review your photo before uploading</p>
        </div>

        <AspectRatio ratio={1} className="overflow-hidden rounded-xl">
          <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
        </AspectRatio>

        {isUploading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleUploadConfirm} className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Upload Photo
            </Button>
            <Button variant="outline" onClick={handleCancelPreview} disabled={isUploading}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Show current photo if exists
  if (currentPhoto) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <AspectRatio ratio={1} className="overflow-hidden rounded-xl">
            <Image
              src={currentPhoto.url || "/placeholder.svg"}
              alt="Menu item photo"
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </AspectRatio>

          {/* Status Badge */}
          <div className="absolute right-3 top-3">
            {currentPhoto.status === "approved" && (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="mr-1 h-3 w-3" />
                Approved
              </Badge>
            )}
            {currentPhoto.status === "pending" && (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Clock className="mr-1 h-3 w-3" />
                Pending Review
              </Badge>
            )}
            {currentPhoto.status === "rejected" && (
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                <XCircle className="mr-1 h-3 w-3" />
                Rejected
              </Badge>
            )}
          </div>
        </div>

        {/* Status Details */}
        {currentPhoto.status === "pending" && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Under Review</AlertTitle>
            <AlertDescription>Your photo is being reviewed. This typically takes 1-3 days.</AlertDescription>
          </Alert>
        )}

        {currentPhoto.status === "rejected" && currentPhoto.rejectionReason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Photo Rejected</AlertTitle>
            <AlertDescription>{currentPhoto.rejectionReason}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {currentPhoto.status === "approved" && (
            <>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Replace Photo
              </Button>
              <Button variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleRemove}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Photo
              </Button>
            </>
          )}

          {currentPhoto.status === "pending" && (
            <>
              <Button variant="outline" onClick={handleWithdraw}>
                Withdraw Submission
              </Button>
              <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
                Replace with Different Photo
              </Button>
            </>
          )}

          {currentPhoto.status === "rejected" && (
            <>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Photo
              </Button>
              <Button variant="ghost" onClick={() => setShowGuidelines(!showGuidelines)}>
                <Lightbulb className="mr-2 h-4 w-4" />
                View Guidelines
              </Button>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    )
  }

  // Show empty state
  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors",
          isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
        )}
      >
        <AspectRatio ratio={1} className="w-full">
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            {isDragging ? (
              <>
                <Upload className="h-12 w-12 animate-bounce text-orange-500" />
                <p className="text-lg font-medium text-orange-700">Drop to upload</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <div className="space-y-1 text-center">
                  <p className="text-lg font-medium text-gray-700">Drag photo here or click to upload</p>
                  <p className="text-sm text-gray-500">Recommended: 800×800px, JPG or PNG</p>
                  <p className="text-xs text-gray-400">Max file size: 5MB</p>
                </div>
              </>
            )}
          </div>
        </AspectRatio>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {guidelines && (
        <Button variant="ghost" onClick={() => setShowGuidelines(!showGuidelines)} className="w-full">
          <Lightbulb className="mr-2 h-4 w-4" />
          {showGuidelines ? "Hide Photo Guidelines" : "View Photo Guidelines"}
        </Button>
      )}

      {showGuidelines && guidelines && (
        <div className="mt-4">
          <PhotoGuidelines />
        </div>
      )}
    </div>
  )
}
