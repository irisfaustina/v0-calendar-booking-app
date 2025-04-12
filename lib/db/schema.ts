import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core"

// Enums
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
])

// Events table
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  durationInMinutes: integer("duration_in_minutes").notNull(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Schedules table
export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Availability slots table
export const availabilitySlots = pgTable("availability_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // Format: "HH:MM"
  endTime: varchar("end_time", { length: 5 }).notNull(), // Format: "HH:MM"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  bookerName: varchar("booker_name", { length: 255 }).notNull(),
  bookerEmail: varchar("booker_email", { length: 255 }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  bookings: many(bookings),
}))

export const schedulesRelations = relations(schedules, ({ many }) => ({
  availabilitySlots: many(availabilitySlots),
}))

export const bookingsRelations = relations(bookings, ({ one }) => ({
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id],
  }),
}))

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  schedule: one(schedules, {
    fields: [availabilitySlots.scheduleId],
    references: [schedules.id],
  }),
}))
