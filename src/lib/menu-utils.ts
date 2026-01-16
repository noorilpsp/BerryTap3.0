// Format time from 24h to 12h
export function formatTime(time: string | number | undefined | null): string {
  if (!time && time !== 0) return "N/A"
  
  // Handle if time is a number (e.g., 7 or 700 or 0700)
  if (typeof time === 'number') {
    time = String(time).padStart(4, '0')
    time = `${time.slice(0, 2)}:${time.slice(2)}`
  }
  
  // Handle various formats
  const timeStr = String(time).trim()
  
  // If it's just hours (e.g., "7" or "07")
  if (!timeStr.includes(':')) {
    const hours = parseInt(timeStr, 10)
    if (isNaN(hours)) return "N/A"
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:00 ${period}`
  }
  
  const [hoursStr, minutesStr] = timeStr.split(":")
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  
  if (isNaN(hours)) return "N/A"
  
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  const displayMinutes = isNaN(minutes) ? 0 : minutes
  
  return `${displayHours}:${displayMinutes.toString().padStart(2, "0")} ${period}`
}

// Format schedule into human-readable text (Monday-Sunday order, shows Closed for missing days)
export function formatSchedule(schedule: Array<{ days: number[]; startTime: string; endTime: string }>): string[] {
  // Day order: Monday (1) to Sunday (0)
  const dayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  
  // Build a map of day -> time blocks
  const daySchedule: Map<number, Array<{ startTime: string; endTime: string }>> = new Map()
  
  schedule.forEach((block) => {
    block.days.forEach((day) => {
      if (!daySchedule.has(day)) {
        daySchedule.set(day, [])
      }
      daySchedule.get(day)!.push({ startTime: block.startTime, endTime: block.endTime })
    })
  })
  
  // Group consecutive days with same hours
  const result: string[] = []
  let i = 0
  
  while (i < dayOrder.length) {
    const currentDay = dayOrder[i]
    const currentBlocks = daySchedule.get(currentDay)
    
    // Find consecutive days with same schedule
    let j = i + 1
    while (j < dayOrder.length) {
      const nextDay = dayOrder[j]
      const nextBlocks = daySchedule.get(nextDay)
      
      // Compare schedules
      const sameSchedule = 
        (!currentBlocks && !nextBlocks) || // Both closed
        (currentBlocks && nextBlocks && 
         currentBlocks.length === nextBlocks.length &&
         currentBlocks.every((b, idx) => 
           b.startTime === nextBlocks[idx].startTime && 
           b.endTime === nextBlocks[idx].endTime
         ))
      
      if (sameSchedule) {
        j++
      } else {
        break
      }
    }
    
    // Format the range
    const startDay = dayOrder[i]
    const endDay = dayOrder[j - 1]
    const blocks = daySchedule.get(startDay)
    
    let dayString: string
    if (i === j - 1) {
      // Single day
      dayString = dayNames[startDay]
    } else if (j - i === 2) {
      // Two days
      dayString = `${dayNames[startDay]} & ${dayNames[endDay]}`
    } else {
      // Range
      dayString = `${dayNames[startDay]} - ${dayNames[endDay]}`
    }
    
    if (!blocks || blocks.length === 0) {
      result.push(`${dayString}: Closed`)
    } else {
      // Format each time block for this day/range
      blocks.forEach((block) => {
        const timeString = `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`
        result.push(`${dayString}: ${timeString}`)
      })
    }
    
    i = j
  }
  
  return result
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}
