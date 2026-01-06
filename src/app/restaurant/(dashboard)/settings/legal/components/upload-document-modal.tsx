"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast"

interface UploadDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDocumentModal({ open, onOpenChange }: UploadDocumentModalProps) {
  const [documentType, setDocumentType] = useState("")
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [validUntil, setValidUntil] = useState("")
  const [changeNotes, setChangeNotes] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [setAsActive, setSetAsActive] = useState(true)
  const [sendNotification, setSendNotification] = useState(true)
  const [complianceCoverage, setComplianceCoverage] = useState({
    gdpr: true,
    ccpa: true,
    pipeda: true,
    lgpd: false,
    other: false,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = () => {
    if (!documentType || !title || !version || !effectiveDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Document uploaded successfully",
      description: `${title} v${version} has been uploaded and ${setAsActive ? "set as active" : "saved as draft"}`,
    })
    onOpenChange(false)
    // Reset form
    setDocumentType("")
    setTitle("")
    setVersion("")
    setEffectiveDate("")
    setValidUntil("")
    setChangeNotes("")
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Legal Document</DialogTitle>
          <DialogDescription>Upload a new legal document or replace an existing one</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Document Information</h3>

            <div className="space-y-2">
              <Label htmlFor="docType">
                Document Type <span className="text-destructive">*</span>
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="docType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privacy_policy">Privacy Policy</SelectItem>
                  <SelectItem value="terms_of_service">Terms of Service</SelectItem>
                  <SelectItem value="dpa">Data Processing Agreement (DPA)</SelectItem>
                  <SelectItem value="cookie_policy">Cookie Policy</SelectItem>
                  <SelectItem value="acceptable_use">Acceptable Use Policy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Document Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Privacy Policy v2.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="version">
                Version Number <span className="text-destructive">*</span>
              </Label>
              <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.1" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Effective Dates</h3>

            <div className="space-y-2">
              <Label htmlFor="effectiveDate">
                Effective Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">When this document becomes legally binding</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until (optional)</Label>
              <Input id="validUntil" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              <p className="text-xs text-muted-foreground">Leave blank for indefinite validity</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Document File</h3>

            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-8 w-8" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Drop PDF file here or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Accepted formats: PDF only • Maximum size: 10 MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Compliance Coverage</h3>
            <p className="text-sm text-muted-foreground">This document addresses:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gdpr"
                  checked={complianceCoverage.gdpr}
                  onCheckedChange={(checked) =>
                    setComplianceCoverage((prev) => ({
                      ...prev,
                      gdpr: checked as boolean,
                    }))
                  }
                />
                <label htmlFor="gdpr" className="text-sm">
                  GDPR (EU)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ccpa"
                  checked={complianceCoverage.ccpa}
                  onCheckedChange={(checked) =>
                    setComplianceCoverage((prev) => ({
                      ...prev,
                      ccpa: checked as boolean,
                    }))
                  }
                />
                <label htmlFor="ccpa" className="text-sm">
                  CCPA (California)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pipeda"
                  checked={complianceCoverage.pipeda}
                  onCheckedChange={(checked) =>
                    setComplianceCoverage((prev) => ({
                      ...prev,
                      pipeda: checked as boolean,
                    }))
                  }
                />
                <label htmlFor="pipeda" className="text-sm">
                  PIPEDA (Canada)
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Change Notes</h3>
            <Textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="Updated section 5.2 on data retention periods..."
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Activation</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="setActive"
                  checked={setAsActive}
                  onCheckedChange={(checked) => setSetAsActive(checked as boolean)}
                />
                <label htmlFor="setActive" className="text-sm">
                  Set as active version immediately
                </label>
              </div>
              {setAsActive && (
                <p className="text-xs text-orange-600 ml-6">⚠️ Setting as active will replace the current version</p>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <label htmlFor="notify" className="text-sm">
                  Send notification to all users about policy update
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Upload Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
