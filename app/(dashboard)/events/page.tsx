import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { events } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EventsPage() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const userEvents = await db.query.events.findMany({
    where: eq(events.clerkUserId, userId),
    orderBy: events.createdAt,
  })

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Create and manage your booking events.</p>
          </div>
          <Button asChild>
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Link>
          </Button>
        </div>

        {userEvents.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Duration:</span>
                      <span>{event.durationInMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                          event.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Created:</span>
                      <span>{formatDate(event.createdAt, "PPP")}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 px-6 py-3">
                  <div className="flex items-center justify-between w-full">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/events/${event.id}`}>Edit</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/book/${event.id}`} target="_blank">
                        View Booking Page
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">No events created</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                You haven't created any booking events yet. Create your first event to start receiving bookings.
              </p>
              <Button asChild>
                <Link href="/events/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
