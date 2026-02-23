"use client";

import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { EditTableModal } from "@/components/mobile-ordering/menu/edit-table-modal";

interface DineInSectionProps {
  tableNumber: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (tableNumber: string) => void;
  onCancel: () => void;
}

export function DineInSection({
  tableNumber,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: DineInSectionProps) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  const handleTableClick = () => {
    setIsTableModalOpen(true);
  };

  const handleConfirm = (newTableNumber: string) => {
    onSave(newTableNumber);
    setIsTableModalOpen(false);
  };

  return (
    <>
      <div className="mb-5 rounded-lg border border-border bg-card px-0 py-3">
        <button
          type="button"
          onClick={handleTableClick}
          className="flex gap-3 w-full items-center justify-center cursor-pointer"
        >
          <UtensilsCrossed className="h-5 w-5 flex-shrink-0 self-center text-foreground" />
          <div className="text-center">
            <h3 className="text-base font-medium text-foreground">
              Table {tableNumber}
            </h3>
          </div>
        </button>
      </div>

      <EditTableModal
        open={isTableModalOpen}
        onOpenChange={setIsTableModalOpen}
        tableNumber={tableNumber}
        onConfirm={handleConfirm}
      />
    </>
  );
}
