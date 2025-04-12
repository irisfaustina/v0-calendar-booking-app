import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CalendarClock, CalendarDays, CalendarRange, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { events, bookings } from "@/lib/db/schema"
import { eq, and, gte, sql } from "drizzle-orm"

export default async function DashboardPage() {
  const { userId } = auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/sign-in")
  }

  // Get user's events
  const userEvents = await db.query.events.findMany({
    where: eq(events.clerkUserId, userId),
    with: {
      bookings: true,
    },
  })

  // Get upcoming bookings
  const today = new Date()
  const upcomingBookings = await db.query.bookings.findMany({
    where: and(eq(bookings.status, "confirmed"), gte(bookings.startTime, today)),
    with: {
      event: true,
    },
    orderBy: bookings.startTime,
    limit: 5,
  })

  // Count total bookings
  const totalBookingsResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(bookings)
    .where(eq(events.clerkUserId, userId))
    .innerJoin(events, eq(bookings.eventId, events.id))

  const totalBookings = totalBookingsResult[0]?.count || 0

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName || "User"}! Here's an overview of your scheduling activity.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userEvents.length}</div>
              <p className="text-xs text-muted-foreground">Active booking events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
              <p className="text-xs text-muted-foreground">Appointments booked</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
              <p className="text-xs text-muted-foreground">Upcoming appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBookings > 0 && userEvents.length > 0
                  ? `${Math.round((totalBookings / userEvents.length) * 10) / 10}`
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">Avg. bookings per event</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Your next {upcomingBookings.length} scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4">
                      <div className="w-14 text-center">
                        <div className="text-xl font-bold">{new Date(booking.startTime).getDate()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(booking.startTime).toLocaleString("default", { month: "short" })}
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{booking.bookerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.event?.name || "Event"} •{" "}
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/bookings">View all bookings</Link>
              </Button>
            </CardFooter>
          </Card>
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Events</CardTitle>
              <CardDescription>Booking events you've created</CardDescription>
            </CardHeader>
            <CardContent>
              {userEvents.length > 0 ? (
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CalendarRange className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.durationInMinutes} min • {event.bookings?.length || 0} bookings
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No events created yet</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/events">Manage events</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
