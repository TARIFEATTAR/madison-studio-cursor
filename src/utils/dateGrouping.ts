export type DateGroup = "today" | "thisWeek" | "thisMonth" | "older";

export function getDateGroup(date: string | Date): DateGroup {
  const now = new Date();
  const itemDate = new Date(date);
  
  // Reset time components for accurate comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
  
  // Today
  if (itemDay.getTime() === today.getTime()) {
    return "today";
  }
  
  // This week (last 7 days)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  if (itemDate > sevenDaysAgo) {
    return "thisWeek";
  }
  
  // This month (last 30 days)
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  if (itemDate > thirtyDaysAgo) {
    return "thisMonth";
  }
  
  return "older";
}

export function groupByDate<T extends { created_at: string }>(items: T[]): Map<DateGroup, T[]> {
  const groups = new Map<DateGroup, T[]>();
  
  items.forEach(item => {
    const group = getDateGroup(item.created_at);
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(item);
  });
  
  return groups;
}

export const dateGroupLabels: Record<DateGroup, string> = {
  today: "Today",
  thisWeek: "This Week",
  thisMonth: "This Month",
  older: "Older",
};
