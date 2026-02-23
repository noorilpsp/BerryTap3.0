"use client"

import { MessageSquare, Mail, DollarSign, CalendarPlus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type BookingChannel, bookingChannels } from "@/lib/reservation-form-data"

interface FormConfirmationProps {
  sendSms: boolean
  sendEmail: boolean
  requireDeposit: boolean
  depositAmount: string
  addToCalendar: boolean
  channel: BookingChannel
  onSmsChange: (v: boolean) => void
  onEmailChange: (v: boolean) => void
  onDepositChange: (v: boolean) => void
  onDepositAmountChange: (v: string) => void
  onCalendarChange: (v: boolean) => void
  onChannelChange: (v: BookingChannel) => void
}

export function FormConfirmation({
  sendSms,
  sendEmail,
  requireDeposit,
  depositAmount,
  addToCalendar,
  channel,
  onSmsChange,
  onEmailChange,
  onDepositChange,
  onDepositAmountChange,
  onCalendarChange,
  onChannelChange,
}: FormConfirmationProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox checked={sendSms} onCheckedChange={(v) => onSmsChange(v === true)} />
          <div className="flex items-center gap-2 text-sm text-foreground group-hover:text-primary transition-colors">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            Send SMS confirmation
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox checked={sendEmail} onCheckedChange={(v) => onEmailChange(v === true)} />
          <div className="flex items-center gap-2 text-sm text-foreground group-hover:text-primary transition-colors">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            Send email confirmation
          </div>
        </label>

        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox checked={requireDeposit} onCheckedChange={(v) => onDepositChange(v === true)} />
            <div className="flex items-center gap-2 text-sm text-foreground group-hover:text-primary transition-colors">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              Require deposit
            </div>
          </label>
          {requireDeposit && (
            <div className="ml-9 mt-2 form-expand-enter">
              <Input
                type="number"
                min="0"
                step="5"
                value={depositAmount}
                onChange={(e) => onDepositAmountChange(e.target.value)}
                placeholder="Amount ($)"
                className="w-32 bg-secondary/50 border-border/60"
              />
            </div>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer group">
          <Checkbox checked={addToCalendar} onCheckedChange={(v) => onCalendarChange(v === true)} />
          <div className="flex items-center gap-2 text-sm text-foreground group-hover:text-primary transition-colors">
            <CalendarPlus className="h-3.5 w-3.5 text-muted-foreground" />
            Add to calendar
          </div>
        </label>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
          Booking channel
        </label>
        <Select value={channel} onValueChange={(v) => onChannelChange(v as BookingChannel)}>
          <SelectTrigger className="h-10 w-full bg-secondary/50 border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {bookingChannels.map((ch) => (
              <SelectItem key={ch.value} value={ch.value}>
                {ch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
