import {
  CalendarIcon,
  ChevronDownIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import {
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon
} from "@heroicons/react/24/solid";
import { useMediaQuery } from "@uidotdev/usehooks";
import dayjs from "dayjs";
import { m } from "motion/react";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Controller, useFormContext } from "react-hook-form";
import ToggleWithHelper from "@/components/Shared/ToggleWithHelper";
import {
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RangeSlider,
  Select
} from "@/components/Shared/UI";
import { Calendar } from "@/components/Shared/UI/Calendar";
import Input from "@/components/Shared/UI/Input";
import cn from "@/helpers/cn";
import { IS_MOBILE } from "@/helpers/mediaQueries";
import { EXPANSION_EASE } from "@/helpers/variants";
import { useCollectActionStore } from "@/store/non-persisted/post/useCollectActionStore";

enum Option {
  RANGE = "range",
  CUSTOM = "custom"
}

const FIELD_NAME_DATE = "endAtDate";
const FIELD_NAME_TIME = "endAtTime";

const TimeLimitConfig = () => {
  const isSmallDevice = useMediaQuery(IS_MOBILE);
  const { collectAction, updateCollectAction } = useCollectActionStore(
    (state) => state
  );

  const [enabled, setEnabled] = useState(Boolean(collectAction.endsAt));
  const [selectedOption, setSelectedOption] = useState<Option>(
    collectAction.endsAt ? Option.CUSTOM : Option.RANGE
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { control, register, resetField, getFieldState, setValue, trigger } =
    useFormContext();

  const dateFieldError = getFieldState(FIELD_NAME_DATE).error;
  const timeFieldError = getFieldState(FIELD_NAME_TIME).error;

  const options = useMemo(() => {
    return [
      {
        icon: <AdjustmentsHorizontalIcon className="size-4" />,
        label: "Number of days",
        selected: selectedOption === Option.RANGE,
        value: Option.RANGE
      },
      {
        icon: <CalendarDaysIcon className="size-4" />,
        label: "Date and time",
        selected: selectedOption === Option.CUSTOM,
        value: Option.CUSTOM
      }
    ];
  }, [selectedOption]);

  const onTimeChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (!collectAction.endsAt) return;

      const [hours, minutes, seconds] = value.split(":").map(Number);
      const newEndsAt = dayjs(collectAction.endsAt)
        .hour(hours)
        .minute(minutes)
        .second(seconds)
        .millisecond(0)
        .toISOString();
      updateCollectAction({ endsAt: newEndsAt });
      await trigger([FIELD_NAME_DATE, FIELD_NAME_TIME]);
    },
    [collectAction.endsAt, updateCollectAction, trigger]
  );

  const onDateChange = useCallback(
    async (date: Date | undefined) => {
      setCalendarOpen(false);

      const newDate = dayjs(date);
      const newEndsAt = dayjs(collectAction.endsAt)
        .date(newDate.date())
        .month(newDate.month())
        .year(newDate.year())
        .toISOString();
      updateCollectAction({ endsAt: newEndsAt });
      await trigger([FIELD_NAME_DATE, FIELD_NAME_TIME]);
    },
    [collectAction.endsAt, updateCollectAction]
  );

  useEffect(() => {
    resetField(FIELD_NAME_DATE);
    resetField(FIELD_NAME_TIME);
  }, [enabled]);

  return (
    <div className="mt-5">
      <ToggleWithHelper
        description="Limit collecting to specific period of time"
        heading="Time limit"
        icon={<ClockIcon className="size-5" />}
        on={enabled}
        setOn={(on) => {
          setEnabled(on);
          const endsAt = dayjs().add(1, "day");
          updateCollectAction({
            endsAt: collectAction.endsAt ? undefined : endsAt.toISOString()
          });
          setValue(FIELD_NAME_DATE, endsAt.toDate());
          setValue(FIELD_NAME_TIME, endsAt.format("HH:mm:ss"));
        }}
      />
      {collectAction.endsAt ? (
        <m.div
          animate="visible"
          className="mt-4 ml-8 space-y-2 text-sm"
          initial="hidden"
          transition={{ duration: 0.2, ease: EXPANSION_EASE }}
          variants={{
            hidden: { height: 0, opacity: 0, y: -20 },
            visible: { height: "auto", opacity: 1, y: 0 }
          }}
        >
          <Select onChange={setSelectedOption} options={options} />
          {selectedOption === Option.RANGE ? (
            <>
              <div className="pt-2 font-bold">
                {dayjs(collectAction.endsAt).format("MMM D, YYYY - h:mm:ss A")}
              </div>
              <RangeSlider
                defaultValue={[
                  dayjs(collectAction.endsAt).diff(dayjs(), "day")
                ]}
                displayValue={Math.round(
                  dayjs(collectAction.endsAt).diff(dayjs(), "hour") / 24
                ).toString()}
                max={100}
                min={1}
                onValueChange={async (value) => {
                  const endsAt = dayjs().add(Number(value[0]), "day");
                  updateCollectAction({
                    endsAt: endsAt.toISOString()
                  });
                  setValue(FIELD_NAME_DATE, endsAt.toDate());
                  setValue(FIELD_NAME_TIME, endsAt.format("HH:mm:ss"));
                  await trigger([FIELD_NAME_DATE, FIELD_NAME_TIME]);
                }}
                showValueInThumb
              />
              {dateFieldError && (
                <span className="font-bold text-red-500 text-sm">
                  {dateFieldError.message}
                </span>
              )}
            </>
          ) : (
            <div className="flex gap-4 pt-1">
              <div className="flex shrink-0 flex-col gap-2">
                <Label className="px-1" htmlFor="date-picker">
                  Date
                </Label>
                <Popover onOpenChange={setCalendarOpen} open={calendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      className="ites-center flex justify-between rounded-xl px-3 py-2 font-normal"
                      id="date-picker"
                      variant={dateFieldError ? "danger" : "outline"}
                    >
                      <CalendarIcon className="size-4" />
                      {collectAction.endsAt
                        ? new Date(collectAction.endsAt).toLocaleDateString(
                            undefined,
                            {
                              dateStyle: isSmallDevice ? "short" : "full"
                            }
                          )
                        : "Pick a date"}
                      <ChevronDownIcon className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  {dateFieldError && (
                    <span className="font-bold text-red-500 text-sm">
                      {dateFieldError.message}
                    </span>
                  )}
                  <PopoverContent
                    align="start"
                    className="w-auto overflow-hidden p-0"
                  >
                    <Controller
                      control={control}
                      name={FIELD_NAME_DATE}
                      render={({ field }) => (
                        <Calendar
                          mode="single"
                          onSelect={async (date) => {
                            field.onChange(date);
                            await onDateChange(date);
                          }}
                          selected={
                            collectAction.endsAt
                              ? new Date(collectAction.endsAt)
                              : undefined
                          }
                        />
                      )}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="px-1" htmlFor="time-picker">
                  Time
                </Label>
                <Input
                  className={cn(
                    "appearance-none px-2 text-sm [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
                    {
                      "text-red-500": Boolean(timeFieldError)
                    }
                  )}
                  error={Boolean(timeFieldError)}
                  iconLeft={<ClockIcon className="size-4" />}
                  id="time-picker"
                  step="1"
                  type="time"
                  {...register(FIELD_NAME_TIME, { onChange: onTimeChange })}
                />
              </div>
            </div>
          )}
        </m.div>
      ) : null}
    </div>
  );
};

export default TimeLimitConfig;
