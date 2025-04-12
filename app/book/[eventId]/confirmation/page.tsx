import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BookingConfirmationPage({
  params,
}: {
  params: { eventId: string }
}) {
  return (
    <div className="container max-w-md py-20">
      <div className="flex flex-col items-center justify-center text-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Booking Confirmed!</h1>
          <p className="text-muted-foreground">
            Your appointment has been successfully scheduled. We've sent a confirmation email with all the details.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-[400px]:flex-row">
          <Button asChild variant="outline">
            <Link href={`/book/${params.eventId}`}>Book Another</Link>
          </Button>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
