export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(utc_time: number) {
  return new Date(utc_time * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatSecToHMS(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
}

export function dateToUnix(date: string) {
  const dateObj = new Date(date);
  return Math.floor(dateObj.getTime() / 1000);
}
