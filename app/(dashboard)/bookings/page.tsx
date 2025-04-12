import { Suspense } from "react"
import { BookingsContent } from "./bookings-content"
import { BookingsLoading } from "./loading-skeleton"

export default function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; event?: string }
}) {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">View and manage your scheduled appointments.</p>
          </div>
        </div>

        <Suspense fallback={<BookingsLoading />}>
          <BookingsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
