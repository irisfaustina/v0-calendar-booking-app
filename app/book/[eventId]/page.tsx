import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { events, schedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { BookingForm } from "./booking-form"

export default async function BookEventPage({
  params,
}: {
  params: { eventId: string }
}) {
  const { eventId } = params

  // Get event details
  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!event || !event.isActive) {
    notFound()
  }

  // Get host's schedule
  const hostSchedule = await db.query.schedules.findFirst({
    where: eq(schedules.clerkUserId, event.clerkUserId),
    with: {
      availabilitySlots: true,
    },
  })

  if (!hostSchedule) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
          <p className="text-muted-foreground">{event.description || "No description provided"}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{event.durationInMinutes} minutes</span>
          </div>
        </div>

        <BookingForm
          event={{
            id: event.id,
            name: event.name,
            durationInMinutes: event.durationInMinutes,
          }}
          schedule={{
            timezone: hostSchedule.timezone,
            availabilitySlots: hostSchedule.availabilitySlots,
          }}
        />
      </div>
    </div>
  )
}
