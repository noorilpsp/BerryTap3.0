"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, MapPin } from "lucide-react";

interface OrderInfoCardProps {
  orderType: "dine_in" | "pickup";
  tableNumber?: string;
  restaurant?: {
    name: string;
    address: string;
  };
  minutes: number;
  seconds: number;
  isReady?: boolean;
}

export function OrderInfoCard({
  orderType,
  tableNumber,
  restaurant,
  minutes,
  seconds,
  isReady = false,
}: OrderInfoCardProps) {
  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {orderType === "dine_in" ? (
            <>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dine-in</p>
                <p className="font-semibold">Table {tableNumber}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-semibold">{restaurant?.name}</p>
                <p className="text-sm text-muted-foreground">{restaurant?.address}</p>
              </div>
            </>
          )}
        </div>

        <div className="border-t pt-4">
          {isReady ? (
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 tabular-nums">
                Ready now!
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center mb-2">
                Ready in about
              </p>
              <div className="text-center">
                <p className="text-4xl font-bold text-foreground tabular-nums">
                  {formatTime(minutes, seconds)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">minutes</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
