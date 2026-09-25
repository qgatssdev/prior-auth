// "YYYY-MM-DD" parsed as a local date (new Date("2026-10-08") would be UTC midnight).
export function parseDay(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
}

// Whole days from today to the given day: 0 = today, -1 = yesterday.
export function daysFromToday(day: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseDay(day).getTime() - today.getTime()) / 86_400_000);
}

// "Thu 8 Oct". Built by hand: en-GB now abbreviates September as "Sept".
function dayLabel(date: Date) {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${weekday} ${date.getDate()} ${month}`;
}

export const formatDay = (day: string) => dayLabel(parseDay(day));

// "Tue 6 Oct, 14:32"
export function formatExact(iso: string) {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayLabel(date)}, ${time}`;
}

// "just now", "5m ago", "2h ago", "3d ago"
export function formatRelative(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// "14 Aug 1942", for dates of birth.
export function formatDate(day: string) {
  const date = parseDay(day);
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}

// "YYYY-MM-DD" in local time: the format the API and the date picker exchange.
export function toDayString(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

// "YYYY-MM-DD" for a day n days from today.
export function dayFromToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDayString(date);
}
