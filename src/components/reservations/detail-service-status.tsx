"use client"

import { Flame, Check, Circle, Clock } from "lucide-react"
import { type ServiceStatus, type CourseStatus } from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

interface DetailServiceStatusProps {
  service: ServiceStatus
}

function CourseRow({ course }: { course: CourseStatus }) {
  const statusIcon = {
    served: <Check className="h-3.5 w-3.5 text-emerald-400" />,
    firing: <Flame className="h-3.5 w-3.5 text-amber-400" />,
    ordered: <Clock className="h-3.5 w-3.5 text-blue-400" />,
    not_ordered: <Circle className="h-3.5 w-3.5 text-zinc-600" />,
    pending: <Circle className="h-3.5 w-3.5 text-zinc-600" />,
  }

  const statusLabel = {
    served: "Served",
    firing: "Firing",
    ordered: "Ordered",
    not_ordered: "Not ordered",
    pending: "Pending",
  }

  const statusColor = {
    served: "text-emerald-400",
    firing: "text-amber-400",
    ordered: "text-blue-400",
    not_ordered: "text-zinc-500",
    pending: "text-zinc-500",
  }

  const barPercent = course.status === "served" ? 100 : course.status === "firing" ? 65 : course.status === "ordered" ? 30 : 0
  const barColor = course.status === "served" ? "bg-emerald-500" : course.status === "firing" ? "bg-amber-500" : "bg-blue-500"

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs text-zinc-300">{course.name}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-valuenow={barPercent} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${course.name}: ${statusLabel[course.status]}`}>
        <div className={cn("detail-course-fill absolute inset-y-0 left-0 rounded-full transition-all", barColor)} style={{ width: `${barPercent}%` }} />
      </div>
      <div className="flex w-24 items-center justify-end gap-1.5">
        {statusIcon[course.status]}
        <span className={cn("text-[11px] font-medium", statusColor[course.status])}>{statusLabel[course.status]}</span>
      </div>
    </div>
  )
}

export function DetailServiceStatus({ service }: DetailServiceStatusProps) {
  const seatedTime = new Date(service.seatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  const finishTime = new Date(service.estimatedFinish).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  const progressPct = Math.min((service.tableTime / service.estimatedDuration) * 100, 100)
  const overTime = progressPct >= 100
  const warningTime = progressPct >= 80
  const progressColor = overTime ? "bg-rose-500" : warningTime ? "bg-amber-500" : "bg-emerald-500"

  return (
    <section className="detail-section-stagger rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Live Service Status</h3>

      {/* Seated info */}
      <div className="mb-4 flex items-center justify-between text-xs text-zinc-400">
        <span>Seated at: <span className="font-medium text-zinc-200">{seatedTime}</span></span>
        <span>Est. finish: <span className="font-medium text-zinc-200">~{finishTime}</span></span>
      </div>

      {/* Course progress */}
      <div className="mb-4 space-y-2.5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Course Progress</p>
        {service.courses.map((course) => (
          <CourseRow key={course.name} course={course} />
        ))}
      </div>

      {/* Current order */}
      <div className="mb-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Current Order</p>
        <div className="space-y-1.5">
          {service.currentOrder.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-zinc-300">{item.qty > 1 ? `${item.qty}x ` : ""}{item.item}</span>
              <span className="font-mono text-zinc-400">${(item.qty * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="my-2 border-t border-zinc-800/50" />
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Subtotal:</span>
          <span className="font-mono font-medium text-zinc-200">${service.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Running total (inc. tax, tip est.):</span>
          <span className="font-mono font-semibold text-foreground">${service.estimatedTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Table time progress */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Clock className="h-3 w-3" />
            Table time: {service.tableTime}min / Est. {service.estimatedDuration}min
          </span>
          <span className={cn("font-mono text-[11px] font-bold", overTime ? "text-rose-400" : warningTime ? "text-amber-400" : "text-emerald-400")}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-zinc-800" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`Table time: ${service.tableTime} of ${service.estimatedDuration} minutes`}>
          <div className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000", progressColor)} style={{ width: `${Math.min(progressPct, 100)}%` }} />
        </div>
      </div>
    </section>
  )
}
