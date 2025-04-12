import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, formatStr = "PPP"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function formatTime(date: Date | string, formatStr = "h:mm a"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr)
}

// Simplified timezone conversion functions that don't rely on date-fns-tz
export function convertToTimezone(date: Date, timezone: string): Date {
  // This is a simplified version that doesn't actually convert timezones
  // In a real app, you'd use a proper timezone library
  return new Date(date)
}

export function convertFromTimezone(date: Date, timezone: string): Date {
  // This is a simplified version that doesn't actually convert timezones
  // In a real app, you'd use a proper timezone library
  return new Date(date)
}

export function generateTimeSlots(startTime: string, endTime: string, durationInMinutes: number): string[] {
  const slots: string[] = []

  // Parse start and end times (format: "HH:MM")
  const [startHour, startMinute] = startTime.split(":").map(Number)
  const [endHour, endMinute] = endTime.split(":").map(Number)

  // Convert to minutes for easier calculation
  let currentMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  // Generate slots
  while (currentMinutes + durationInMinutes <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60)
    const minute = currentMinutes % 60

    // Format as "HH:MM"
    slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)

    // Move to next slot
    currentMinutes += durationInMinutes
  }

  return slots
}

export function getDayOfWeek(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return days[date.getDay()]
}
