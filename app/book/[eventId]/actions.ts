"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { bookings } from "@/lib/db/schema"

interface BookingData {
  eventId: string
  bookerName: string
  bookerEmail: string
  startTime: string
  endTime: string
  timezone: string
  notes?: string
}

export async function createBooking(data: BookingData) {
  await db.insert(bookings).values({
    eventId: data.eventId,
    bookerName: data.bookerName,
    bookerEmail: data.bookerEmail,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    timezone: data.timezone,
    notes: data.notes || null,
    status: "confirmed",
  })

  revalidatePath(`/book/${data.eventId}`)
}
