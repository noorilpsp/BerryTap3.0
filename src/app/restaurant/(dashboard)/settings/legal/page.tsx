"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings,
  FileDown,
  MoreVertical,
  Shield,
  Scale,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { legalDocuments, retentionPolicies, privacyRequests, complianceChecklists } from "./data"
import { UploadDocumentModal } from "./components/upload-document-modal"
import { DocumentVersionHistoryModal } from "./components/document-version-history-modal"
import { EditRetentionPolicyModal } from "./components/edit-retention-policy-modal"
import { PrivacyRequestDetailModal } from "./components/privacy-request-detail-modal"
import { ComplianceDetailModal } from "./components/compliance-detail-modal"
import { LegalSettingsModal } from "./components/legal-settings-modal"
import { ViewDocumentModal } from "./components/view-document-modal"
import type { LegalDocument, PrivacyRequest, RetentionPolicy } from "./types"

export default function LegalCompliancePage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [versionHistoryModalOpen, setVersionHistoryModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null)
  const [editRetentionModalOpen, setEditRetentionModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(null)
  const [privacyRequestModalOpen, setPrivacyRequestModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PrivacyRequest | null>(null)
  const [complianceModalOpen, setComplianceModalOpen] = useState(false)
  const [selectedCompliance, setSelectedCompliance] = useState<string | null>(null)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [viewDocumentModalOpen, setViewDocumentModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const pendingRequests = privacyRequests.filter((r) => r.status === "pending")
  const gdprCompliance = complianceChecklists.find((c) => c.name === "GDPR Compliance")
  const pciCompliance = complianceChecklists.find((c) => c.name === "PCI DSS Compliance")

  const handleDownloadDocument = (doc: LegalDocument) => {
    toast({
      title: "Download started",
      description: `Downloading ${doc.title} v${doc.version}`,
    })
  }

  const handleViewVersionHistory = (doc: LegalDocument) => {
    setSelectedDocument(doc)
    setVersionHistoryModalOpen(true)
  }

  const handleViewDocument = (doc: LegalDocument) => {
    setSelectedDocument(doc)
    setViewDocumentModalOpen(true)
  }

  const handleEditRetentionPolicy = (policy: RetentionPolicy) => {
    setSelectedPolicy(policy)
    setEditRetentionModalOpen(true)
  }

  const handleViewPrivacyRequest = (request: PrivacyRequest) => {
    setSelectedRequest(request)
    setPrivacyRequestModalOpen(true)
  }

  const handleViewCompliance = (complianceName: string) => {
    setSelectedCompliance(complianceName)
    setComplianceModalOpen(true)
  }

  const handleGenerateReport = () => {
    toast({
      title: "Generating compliance report",
      description: "Your report will be ready in a few moments",
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Legal & Compliance
          </h1>
          <p className="text-muted-foreground mt-1">Manage legal compliance and data privacy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileDown className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSettingsModalOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Compliance Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">GDPR Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Compliant</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">All checks passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">PCI DSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Level 1</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Certified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Data Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="font-semibold">{pendingRequests.length} pending</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Action needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Oct 1, 2024</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Passed ✅</p>
          </CardContent>
        </Card>
      </div>

      {/* Legal Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Legal Documents</CardTitle>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {legalDocuments.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{doc.title}</h3>
                      <Badge variant={doc.status === "active" ? "default" : "secondary"}>
                        {doc.status === "active" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {doc.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Version: {doc.version} ({doc.uploadedDate})
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDocument(doc)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Document
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadDocument(doc)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewVersionHistory(doc)}>
                      <Clock className="h-4 w-4 mr-2" />
                      Version History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setUploadModalOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm mb-2">{doc.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  Last updated: {doc.uploadedDate} by {doc.uploadedBy}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">Effective: {doc.effectiveDate}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {doc.compliance.map((comp) => (
                  <Badge key={comp} variant="outline" className="text-xs">
                    {comp}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Data Retention Policies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Retention Policies</CardTitle>
          <Button variant="outline" size="sm">
            Edit Policies
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Type</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Auto-Delete</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retentionPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{policy.displayName}</div>
                      <div className="text-sm text-muted-foreground">{policy.includes}</div>
                    </div>
                  </TableCell>
                  <TableCell>{policy.retentionPeriod}</TableCell>
                  <TableCell>
                    <Badge variant={policy.autoDelete ? "default" : "secondary"}>
                      {policy.autoDelete ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditRetentionPolicy(policy)}>
                      Edit Policy
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-sm text-muted-foreground">
            Last reviewed: Nov 1, 2024 • Next review: Feb 1, 2025
          </div>
        </CardContent>
      </Card>

      {/* Privacy Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              Privacy Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length} pending
                </Badge>
              )}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm">
            View All ({privacyRequests.length})
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p>No pending privacy requests</p>
            </div>
          ) : (
            pendingRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h3 className="font-semibold capitalize">{request.type.replace("_", " ")} Request</h3>
                  </div>
                  <Badge variant="secondary">{request.status}</Badge>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Requester:</span> {request.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Request ID:</span> {request.id}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Submitted:</span>{" "}
                    {new Date(request.submittedDate).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Due by:</span> {request.dueDate}
                  </p>
                </div>
                {request.warnings && request.warnings.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded p-2 mb-3">
                    {request.warnings.map((warning, idx) => (
                      <p key={idx} className="text-sm text-orange-900 dark:text-orange-200">
                        ⚠️ {warning}
                      </p>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleViewPrivacyRequest(request)}>
                    View Details
                  </Button>
                  {request.type === "data_export" && (
                    <Button size="sm" variant="outline">
                      Approve & Generate Export
                    </Button>
                  )}
                  {request.type === "data_deletion" && (
                    <Button size="sm" variant="outline">
                      Approve Deletion
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    Request More Info
                  </Button>
                  <Button size="sm" variant="ghost">
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compliance Checklist</CardTitle>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Run Full Audit
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {complianceChecklists.map((checklist) => (
            <div key={checklist.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{checklist.name}</h3>
                  <Badge variant={checklist.status === "complete" ? "default" : "secondary"}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {checklist.completedCount}/{checklist.totalCount} Complete
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {checklist.items.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
              {checklist.lastAudit && (
                <p className="text-sm text-muted-foreground mb-3">
                  Last audit: {checklist.lastAudit} • Next audit: {checklist.nextAudit}
                </p>
              )}
              {checklist.certificate && (
                <p className="text-sm text-muted-foreground mb-3">
                  Certificate valid until: {checklist.certificate.validUntil} • Last scan:{" "}
                  {checklist.certificate.lastScan}
                </p>
              )}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleViewCompliance(checklist.name)}>
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modals */}
      <UploadDocumentModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />

      {selectedDocument && (
        <>
          <DocumentVersionHistoryModal
            open={versionHistoryModalOpen}
            onOpenChange={setVersionHistoryModalOpen}
            document={selectedDocument}
          />
          <ViewDocumentModal
            open={viewDocumentModalOpen}
            onOpenChange={setViewDocumentModalOpen}
            document={selectedDocument}
          />
        </>
      )}

      {selectedPolicy && (
        <EditRetentionPolicyModal
          open={editRetentionModalOpen}
          onOpenChange={setEditRetentionModalOpen}
          policy={selectedPolicy}
        />
      )}

      {selectedRequest && (
        <PrivacyRequestDetailModal
          open={privacyRequestModalOpen}
          onOpenChange={setPrivacyRequestModalOpen}
          request={selectedRequest}
        />
      )}

      {selectedCompliance && (
        <ComplianceDetailModal
          open={complianceModalOpen}
          onOpenChange={setComplianceModalOpen}
          complianceName={selectedCompliance}
        />
      )}

      <LegalSettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
    </div>
  )
}
