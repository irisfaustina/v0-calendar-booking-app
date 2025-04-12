"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { TimePicker } from "@/components/ui/time-picker"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { saveSchedule } from "./actions"

const timeSlotSchema = z
  .object({
    id: z.string().optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Start time must be in HH:MM format",
    }),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "End time must be in HH:MM format",
    }),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })

const daySchema = z.array(timeSlotSchema).optional()

const formSchema = z.object({
  timezone: z.string(),
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  sunday: daySchema,
})

type FormValues = z.infer<typeof formSchema>

interface ScheduleFormProps {
  initialData: {
    id?: string
    timezone: string
    availability: Record<string, { id: string; startTime: string; endTime: string }[]>
  }
}

export function ScheduleForm({ initialData }: ScheduleFormProps) {
  const router = useRouter()
  const { userId } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      timezone: initialData.timezone,
      monday: initialData.availability.monday || [],
      tuesday: initialData.availability.tuesday || [],
      wednesday: initialData.availability.wednesday || [],
      thursday: initialData.availability.thursday || [],
      friday: initialData.availability.friday || [],
      saturday: initialData.availability.saturday || [],
      sunday: initialData.availability.sunday || [],
    },
  })

  async function onSubmit(values: FormValues) {
    if (!userId) return

    setIsSubmitting(true)
    try {
      // Transform form data to the format expected by the server
      const availability = days.flatMap((day) => {
        return (values[day] || []).map((slot) => ({
          id: slot.id,
          dayOfWeek: day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      })

      await saveSchedule({
        id: initialData.id,
        timezone: values.timezone,
        availability,
        clerkUserId: userId,
      })

      router.refresh()
    } catch (error) {
      console.error("Failed to save schedule:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTimeSlot = (day: keyof FormValues) => {
    const currentSlots = form.getValues(day) || []
    form.setValue(day, [...currentSlots, { startTime: "09:00", endTime: "17:00" }])
  }

  const removeTimeSlot = (day: keyof FormValues, index: number) => {
    const currentSlots = form.getValues(day) || []
    form.setValue(
      day,
      currentSlots.filter((_, i) => i !== index),
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Timezone</CardTitle>
            <CardDescription>Set your timezone to ensure accurate scheduling.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Timezone</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "UTC",
                        "America/New_York",
                        "America/Chicago",
                        "America/Denver",
                        "America/Los_Angeles",
                        "Europe/London",
                        "Europe/Paris",
                        "Asia/Tokyo",
                        "Australia/Sydney",
                      ].map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>All times will be displayed in this timezone.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Availability</CardTitle>
            <CardDescription>Set the hours when you're available for bookings each day.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="monday" className="w-full">
              <TabsList className="grid grid-cols-7 mb-8">
                {days.map((day) => (
                  <TabsTrigger key={day} value={day} className="capitalize">
                    {day.slice(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {days.map((day) => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium capitalize">{day}</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => addTimeSlot(day)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Time Slot
                    </Button>
                  </div>

                  {form.watch(day)?.length ? (
                    form.watch(day)?.map((_, index) => (
                      <div key={index} className="flex items-end gap-4">
                        <FormField
                          control={form.control}
                          name={`${day}.${index}.startTime`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Start Time</FormLabel>
                              <TimePicker value={field.value} onChange={field.onChange} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`${day}.${index}.endTime`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>End Time</FormLabel>
                              <TimePicker value={field.value} onChange={field.onChange} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(day, index)}
                          className="mb-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove time slot</span>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-24 rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground">No availability set for {day}</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
