"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format, addDays, startOfDay, addMinutes } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTimeSlots, getDayOfWeek } from "@/lib/utils"
import { createBooking } from "./actions"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  time: z.string({
    required_error: "Please select a time.",
  }),
  notes: z.string().optional(),
})

interface BookingFormProps {
  event: {
    id: string
    name: string
    durationInMinutes: number
  }
  schedule: {
    timezone: string
    availabilitySlots: {
      id: string
      dayOfWeek: string
      startTime: string
      endTime: string
    }[]
  }
}

export function BookingForm({ event, schedule }: BookingFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      notes: "",
    },
  })

  // Function to check if a date has availability
  const isDateAvailable = (date: Date) => {
    const dayOfWeek = getDayOfWeek(date)
    return schedule.availabilitySlots.some((slot) => slot.dayOfWeek === dayOfWeek)
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      setAvailableTimes([])
      return
    }

    setSelectedDate(date)
    form.setValue("date", date)

    // Get day of week
    const dayOfWeek = getDayOfWeek(date)

    // Find availability slots for this day
    const daySlots = schedule.availabilitySlots.filter((slot) => slot.dayOfWeek === dayOfWeek)

    // Generate time slots based on availability and event duration
    const times: string[] = []
    daySlots.forEach((slot) => {
      const slotsForRange = generateTimeSlots(slot.startTime, slot.endTime, event.durationInMinutes)
      times.push(...slotsForRange)
    })

    setAvailableTimes(times)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Parse time (format: "HH:MM")
      const [hours, minutes] = values.time.split(":").map(Number)

      // Create start and end times
      const startTime = new Date(values.date)
      startTime.setHours(hours, minutes, 0, 0)

      const endTime = addMinutes(startTime, event.durationInMinutes)

      await createBooking({
        eventId: event.id,
        bookerName: values.name,
        bookerEmail: values.email,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        timezone: schedule.timezone,
        notes: values.notes,
      })

      // Redirect to confirmation page
      router.push(`/book/${event.id}/confirmation`)
    } catch (error) {
      console.error("Failed to create booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select a Date & Time</CardTitle>
          <CardDescription>Choose when you'd like to book this appointment.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // Disable dates in the past
              const today = startOfDay(new Date())
              if (date < today) return true

              // Disable dates more than 60 days in the future
              const maxDate = addDays(today, 60)
              if (date > maxDate) return true

              // Disable dates with no availability
              return !isDateAvailable(date)
            }}
            className="rounded-md border"
          />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {availableTimes.length > 0 ? (
            availableTimes.map((time) => (
              <Button
                key={time}
                type="button"
                variant={form.watch("time") === time ? "default" : "outline"}
                size="sm"
                onClick={() => form.setValue("time", time)}
              >
                {format(new Date(`2000-01-01T${time}`), "h:mm a")}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground w-full text-center">
              {selectedDate ? "No available times for this date." : "Select a date to see available times."}
            </p>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Provide your details to complete the booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>We'll send booking confirmation to this email.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information you'd like to share..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !form.watch("date") || !form.watch("time")}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
