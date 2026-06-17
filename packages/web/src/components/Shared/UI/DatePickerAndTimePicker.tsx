import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Button } from "./Button";
import { Calendar } from "./Calendar";
import Input from "./Input";
import { Label } from "./Label";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

const DatePickerAndTimePicker = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-2">
        <Label className="px-1" htmlFor="date-picker">
          Date picker
        </Label>
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <Button
              className="justify-between font-normal"
              id="date-picker"
              variant="outline"
            >
              {date ? date.toLocaleDateString() : "Pick a date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto overflow-hidden p-0">
            <Calendar
              mode="single"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="px-1" htmlFor="time-picker">
          Time input
        </Label>
        <Input
          className="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          defaultValue="06:30:00"
          id="time-picker"
          step="1"
          type="time"
        />
      </div>
    </div>
  );
};

export default DatePickerAndTimePicker;
