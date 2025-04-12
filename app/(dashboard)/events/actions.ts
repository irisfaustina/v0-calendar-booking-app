"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { auth } from "@clerk/nextjs/server"

interface EventData {
  name: string
  description?: string
  durationInMinutes: number
  isActive: boolean
  clerkUserId: string
}

export async function createEvent(data: EventData) {
  const { userId } = auth()

  if (!userId || userId !== data.clerkUserId) {
    throw new Error("Unauthorized")
  }

  await db.insert(events).values({
    name: data.name,
    description: data.description || null,
    durationInMinutes: data.durationInMinutes,
    isActive: data.isActive,
    clerkUserId: data.clerkUserId,
  })

  revalidatePath("/events")
  revalidatePath("/dashboard")
}

export async function updateEvent(id: string, data: Partial<EventData>) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) => and(eq(events.id, id), eq(events.clerkUserId, userId)),
  })

  if (!event) {
    throw new Error("Event not found or you don't have permission to edit it")
  }

  await db
    .update(events)
    .set({
      name: data.name,
      description: data.description,
      durationInMinutes: data.durationInMinutes,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(events.id === id)

  revalidatePath("/events")
  revalidatePath(`/events/${id}`)
  revalidatePath("/dashboard")
}

export async function deleteEvent(id: string) {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Verify ownership
  const event = await db.query.events.findFirst({
    where: (events, { eq, and }) => and(eq(events.id, id), eq(events.clerkUserId, userId)),
  })

  if (!event) {
    throw new Error("Event not found or you don't have permission to delete it")
  }

  await db.delete(events).where(events.id === id)

  revalidatePath("/events")
  revalidatePath("/dashboard")
}
