"use client"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
  label?: string
  className?: string
}

export function TimePicker({ value, onChange, label, className }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 15, 30, 45]

  const [selectedHour, selectedMinute] = value.split(":").map(Number)

  const handleHourClick = (hour: number) => {
    const newMinute = selectedMinute || 0
    onChange(`${hour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`)
  }

  const handleMinuteClick = (minute: number) => {
    const newHour = selectedHour || 0
    onChange(`${newHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
  }

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
  }

  const displayTime =
    selectedHour !== undefined && selectedMinute !== undefined
      ? formatTime(selectedHour, selectedMinute)
      : "Select time"

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <Clock className="mr-2 h-4 w-4" />
            {displayTime}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex p-2">
            <div className="grid gap-1 pr-2 border-r">
              <div className="text-xs font-medium text-center py-1">Hour</div>
              <div className="grid grid-cols-6 gap-1 h-[180px] overflow-y-auto pr-1">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="sm"
                    variant={hour === selectedHour ? "default" : "ghost"}
                    className="h-8 w-8"
                    onClick={() => handleHourClick(hour)}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-1 pl-2">
              <div className="text-xs font-medium text-center py-1">Minute</div>
              <div className="grid grid-cols-2 gap-1">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="sm"
                    variant={minute === selectedMinute ? "default" : "ghost"}
                    className="h-8 w-8"
                    onClick={() => handleMinuteClick(minute)}
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
