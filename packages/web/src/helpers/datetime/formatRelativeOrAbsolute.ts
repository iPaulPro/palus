import dayjs from "dayjs";

const formatRelativeOrAbsolute = (date: Date | string, suffix?: string) => {
  const now = dayjs();
  const targetDate = dayjs(date);
  const diffInDays = now.diff(targetDate, "day");
  const diffInHours = now.diff(targetDate, "hour");
  const diffInMinutes = now.diff(targetDate, "minute");
  const diffInSeconds = now.diff(targetDate, "second");

  if (diffInDays >= 1) {
    // More than a day
    return diffInDays < 7
      ? `${diffInDays}d${suffix ? ` ${suffix}` : ""}`
      : targetDate.format(
          now.isSame(targetDate, "year") ? "MMM D" : "MMM D, YYYY"
        );
  }

  if (diffInHours >= 1) {
    // More than an hour
    return `${diffInHours}h${suffix ? ` ${suffix}` : ""}`;
  }

  if (diffInMinutes >= 1) {
    // More than a minute
    return `${diffInMinutes}m${suffix ? ` ${suffix}` : ""}`;
  }

  // Seconds
  return `${diffInSeconds}s${suffix ? ` ${suffix}` : ""}`;
};

export default formatRelativeOrAbsolute;
