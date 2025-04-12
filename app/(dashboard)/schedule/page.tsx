import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { schedules } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ScheduleForm } from "./schedule-form"

export default async function SchedulePage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get user's schedule
  const userSchedule = await db.query.schedules.findFirst({
    where: eq(schedules.clerkUserId, userId),
    with: {
      availabilitySlots: true,
    },
  })

  // Format availability slots for the form
  const formattedAvailability =
    userSchedule?.availabilitySlots.reduce(
      (acc, slot) => {
        if (!acc[slot.dayOfWeek]) {
          acc[slot.dayOfWeek] = []
        }
        acc[slot.dayOfWeek].push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })
        return acc
      },
      {} as Record<string, { id: string; startTime: string; endTime: string }[]>,
    ) || {}

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
            <p className="text-muted-foreground">Set your availability for when people can book time with you.</p>
          </div>

          <ScheduleForm
            initialData={{
              id: userSchedule?.id,
              timezone: userSchedule?.timezone || "UTC",
              availability: formattedAvailability,
            }}
          />
        </div>
      </div>
    </div>
  )
}
