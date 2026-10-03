/** Hebrew formatting helpers. */

export function timeAgoHe(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "עכשיו";
  if (minutes === 1) return "לפני דקה";
  if (minutes < 60) return `לפני ${minutes} דקות`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "לפני שעה";
  if (hours === 2) return "לפני שעתיים";
  if (hours < 24) return `לפני ${hours} שעות`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;

  return new Date(isoDate).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function likesLabel(count: number): string {
  if (count === 0) return "היו הראשונים לעשות לייק";
  if (count === 1) return "לייק אחד";
  return `${count} לייקים`;
}

export function photosLabel(count: number): string {
  if (count === 0) return "אין תמונות";
  if (count === 1) return "תמונה אחת";
  return `${count} תמונות`;
}
