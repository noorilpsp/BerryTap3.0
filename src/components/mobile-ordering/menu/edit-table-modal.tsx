"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EditTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableNumber: string;
  onConfirm: (tableNumber: string) => void;
}

export function EditTableModal({
  open,
  onOpenChange,
  tableNumber,
  onConfirm,
}: EditTableModalProps) {
  const [selectedNumber, setSelectedNumber] = useState(tableNumber);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Sync selectedNumber with tableNumber when modal opens
  useEffect(() => {
    if (open) {
      setSelectedNumber(tableNumber);
    }
  }, [open, tableNumber]);

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      const selectedNum = parseInt(selectedNumber);
      const itemHeight = 40;
      const containerHeight = 192; // h-48
      const centerOffset = containerHeight / 2 - itemHeight / 2;
      // scrollTop = (item position) - (offset to center)
      const scrollTop = (selectedNum - 1) * itemHeight + 80 - centerOffset;
      isScrollingRef.current = true;
      scrollContainerRef.current.scrollTop = Math.max(0, scrollTop);
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
  }, [open, selectedNumber]);

  const handleScroll = () => {
    if (scrollContainerRef.current && !isScrollingRef.current) {
      const container = scrollContainerRef.current;
      const itemHeight = 40;
      // scrollTop + center offset gives us the content pixel at the center of the highlight
      const centerContentPixel = container.scrollTop + 96;
      // Subtract padding (80px) and item height/2 (20px) to get to item start, then divide by itemHeight
      const itemIndex = Math.round((centerContentPixel - 80 - 20) / itemHeight);
      const tableNum = Math.max(1, Math.min(50, itemIndex + 1));
      setSelectedNumber(String(tableNum));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedNumber);
    onOpenChange(false);
  };

  const tableNumbers = Array.from({ length: 50 }, (_, i) => String(i + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Select Table Number</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Scrollable Number Picker */}
          <div className="relative h-48">
            {/* Center highlight - positioned absolutely behind the numbers */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-10 bg-blue-50 border-y border-blue-200 pointer-events-none z-0" />
            
            {/* Scrollable container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative z-10"
            >
              <div className="pt-20 pb-20">
                {tableNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedNumber(num)}
                    className={`w-full h-10 flex items-center justify-center text-lg font-medium snap-center transition-colors relative z-20 ${
                      selectedNumber === num
                        ? "text-blue-600 font-semibold"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
