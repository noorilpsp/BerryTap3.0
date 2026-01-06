export interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  status: "pending" | "approved" | "rejected"
  uploadedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  rejectionReason?: string
  metadata: {
    size: number
    width: number
    height: number
    format: string
  }
}

export interface PhotoUploadProps {
  currentPhoto?: Photo
  onUpload: (file: File) => Promise<void>
  onReplace: (file: File) => Promise<void>
  onRemove: () => Promise<void>
  onWithdraw: () => Promise<void>
  guidelines?: boolean
}
