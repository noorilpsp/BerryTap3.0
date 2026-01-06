"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportModal } from "@/components/modals/export-modal"
import { ImportWizard } from "@/components/modals/import-wizard"
import { Download, Upload } from "lucide-react"

export default function ImportExportDemoPage() {
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportWizard, setShowImportWizard] = useState(false)

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import/Export Demo</h1>
        <p className="text-muted-foreground">Comprehensive import and export wizard for bulk menu data management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Menu Data</CardTitle>
            <CardDescription>Export your menu items, categories, and customizations in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowExportModal(true)} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Open Export Modal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Menu Data</CardTitle>
            <CardDescription>Import items from spreadsheets with smart column mapping and validation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowImportWizard(true)} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Open Import Wizard
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Export Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Multiple formats (XLSX, CSV, PDF, JSON)</li>
                <li>• Customizable data inclusion</li>
                <li>• Filter export by current filters</li>
                <li>• PDF template selection</li>
                <li>• Progress tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Import Features</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Drag-and-drop file upload</li>
                <li>• Smart column mapping</li>
                <li>• Real-time validation</li>
                <li>• Inline error fixing</li>
                <li>• Progress tracking with rollback</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <ExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        currentFilterSummary="Currently showing: 47 live items in Pizzas category"
      />

      <ImportWizard open={showImportWizard} onOpenChange={setShowImportWizard} />
    </div>
  )
}
