"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { schedules, availabilitySlots } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@clerk/nextjs/server"

interface AvailabilitySlot {
  id?: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface ScheduleData {
  id?: string
  timezone: string
  availability: AvailabilitySlot[]
  clerkUserId: string
}

export async function saveSchedule(data: ScheduleData) {
  const { userId } = auth()

  if (!userId || userId !== data.clerkUserId) {
    throw new Error("Unauthorized")
  }

  // Start a transaction
  return await db.transaction(async (tx) => {
    let scheduleId = data.id

    // If no schedule exists, create one
    if (!scheduleId) {
      const [newSchedule] = await tx
        .insert(schedules)
        .values({
          timezone: data.timezone,
          clerkUserId: data.clerkUserId,
        })
        .returning({ id: schedules.id })

      scheduleId = newSchedule.id
    } else {
      // Update existing schedule
      await tx
        .update(schedules)
        .set({
          timezone: data.timezone,
          updatedAt: new Date(),
        })
        .where(and(eq(schedules.id, scheduleId), eq(schedules.clerkUserId, data.clerkUserId)))
    }

    // Get existing slots to determine which to update, delete, or create
    const existingSlots = await tx.query.availabilitySlots.findMany({
      where: eq(availabilitySlots.scheduleId, scheduleId),
    })

    const existingSlotIds = new Set(existingSlots.map((slot) => slot.id))
    const newSlotIds = new Set(data.availability.filter((slot) => slot.id).map((slot) => slot.id))

    // Delete slots that are no longer in the form
    const slotsToDelete = existingSlots.filter((slot) => !newSlotIds.has(slot.id))
    if (slotsToDelete.length > 0) {
      await tx.delete(availabilitySlots).where(availabilitySlots.id.in(slotsToDelete.map((slot) => slot.id)))
    }

    // Update or create slots
    for (const slot of data.availability) {
      if (slot.id && existingSlotIds.has(slot.id)) {
        // Update existing slot
        await tx
          .update(availabilitySlots)
          .set({
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            updatedAt: new Date(),
          })
          .where(eq(availabilitySlots.id, slot.id))
      } else {
        // Create new slot
        await tx.insert(availabilitySlots).values({
          scheduleId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })
      }
    }
  })

  revalidatePath("/schedule")
}
