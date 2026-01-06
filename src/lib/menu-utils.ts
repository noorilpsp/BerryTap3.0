// Format time from 24h to 12h
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

// Format schedule into human-readable text
export function formatSchedule(schedule: Array<{ days: number[]; startTime: string; endTime: string }>): string[] {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return schedule.map((block) => {
    const sortedDays = [...block.days].sort((a, b) => a - b)

    // Group consecutive days
    const groups: number[][] = []
    let currentGroup: number[] = [sortedDays[0]]

    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i] === sortedDays[i - 1] + 1) {
        currentGroup.push(sortedDays[i])
      } else {
        groups.push(currentGroup)
        currentGroup = [sortedDays[i]]
      }
    }
    groups.push(currentGroup)

    // Format each group
    const dayRanges = groups.map((group) => {
      if (group.length === 1) {
        return dayNames[group[0]]
      } else if (group.length === 2) {
        return `${dayNames[group[0]]} & ${dayNames[group[1]]}`
      } else {
        return `${dayNames[group[0]]} - ${dayNames[group[group.length - 1]]}`
      }
    })

    const dayString = dayRanges.join(", ")
    const timeString = `${formatTime(block.startTime)} - ${formatTime(block.endTime)}`

    return `${dayString}: ${timeString}`
  })
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
