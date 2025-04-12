import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { bookings, events } from "@/lib/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { formatDate, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookingsFilter } from "./bookings-filter"

export async function BookingsContent({
  searchParams,
}: {
  searchParams: { status?: string; event?: string }
}) {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  // Get filter parameters
  const statusFilter = searchParams.status || "all"
  const eventFilter = searchParams.event || "all"

  // Get user's events
  const userEvents = await db.query.events.findMany({
    where: eq(events.clerkUserId, userId),
  })

  // Build query filters
  const filters = []

  // Always filter by user's events
  filters.push(eq(events.clerkUserId, userId))

  // Add status filter if not "all"
  if (statusFilter !== "all") {
    filters.push(eq(bookings.status, statusFilter))
  }

  // Add event filter if not "all"
  if (eventFilter !== "all") {
    filters.push(eq(bookings.eventId, eventFilter))
  }

  // Get bookings
  const userBookings = await db
    .select({
      booking: bookings,
      event: events,
    })
    .from(bookings)
    .innerJoin(events, eq(bookings.eventId, events.id))
    .where(and(...filters))
    .orderBy(desc(bookings.startTime))

  return (
    <>
      <BookingsFilter userEvents={userEvents} statusFilter={statusFilter} eventFilter={eventFilter} />

      {userBookings.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Booker</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userBookings.map(({ booking, event }) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{booking.bookerName}</span>
                      <span className="text-xs text-muted-foreground">{booking.bookerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.startTime, "PPP")}</TableCell>
                  <TableCell>
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/bookings/${booking.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h3 className="mt-4 text-lg font-semibold">No bookings found</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              {statusFilter !== "all" || eventFilter !== "all"
                ? "Try changing your filters to see more results."
                : "You don't have any bookings yet."}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
