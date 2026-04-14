import { formatDistanceToNow, isBefore, subDays, format } from "date-fns";

export function formatRelativeOrAbsoluteDate(date: Date | string) {
  const d = new Date(date);
  const threeDaysAgo = subDays(new Date(), 3);

  if (isBefore(threeDaysAgo, d)) {
    return formatDistanceToNow(d, { addSuffix: true });
  }

  return format(d, "MMM d, yyyy");
}
