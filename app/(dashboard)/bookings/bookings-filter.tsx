"use client"

import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookingsFilterProps {
  userEvents: {
    id: string
    name: string
  }[]
  statusFilter: string
  eventFilter: string
}

export function BookingsFilter({ userEvents, statusFilter, eventFilter }: BookingsFilterProps) {
  const router = useRouter()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set(key, value)
    router.push(`/bookings?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <Select defaultValue={statusFilter} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Event:</span>
          <Select defaultValue={eventFilter} onValueChange={(value) => updateFilter("event", value)}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {userEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
