import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export default function Home() {
  const { userId } = auth()
  const isSignedIn = !!userId

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Effortless Scheduling for Everyone
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Booking Time makes it easy to schedule meetings, appointments, and events. Share your availability,
                    let others book time with you, and stay organized.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isSignedIn ? (
                    <Button asChild size="lg">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <Button size="lg">Get Started</Button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <Button variant="outline" size="lg">
                          Sign In
                        </Button>
                      </SignInButton>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[450px] lg:h-[500px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted p-8 grid place-items-center">
                    <div className="w-full max-w-sm mx-auto bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold">Book a Meeting</h3>
                        <p className="text-sm text-muted-foreground">Select a date and time that works for you</p>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-10 rounded-md flex items-center justify-center text-sm ${i === 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            {i + 10}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Available Times</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM"].map((time) => (
                            <div key={time} className="h-9 rounded-md border flex items-center justify-center text-xs">
                              {time}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Button className="w-full">Confirm Booking</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Features that make scheduling simple
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your calendar and let others book time with you.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="m9 16 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Smart Scheduling</h3>
                <p className="text-muted-foreground">
                  Set your weekly availability with timezone support for seamless global scheduling.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Event Management</h3>
                <p className="text-muted-foreground">
                  Create and manage different types of booking events with custom durations.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Secure Authentication</h3>
                <p className="text-muted-foreground">
                  User management with Clerk for secure and seamless authentication.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 Booking Time. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
