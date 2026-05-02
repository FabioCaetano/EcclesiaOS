import { CronExpressionParser } from "cron-parser";
import type { ChurchEvent } from "@ecclesiaos/shared";

const technicalCapMonths = 12;
const maxIterations = 5000;

export interface PlannedOccurrence {
  date: string;
  startTime: string;
}

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const buildStartDate = (event: ChurchEvent): Date => {
  const time = event.startTime || "00:00";
  return new Date(`${event.date}T${time}:00`);
};

const buildEndDate = (event: ChurchEvent, technicalCap: Date): Date => {
  if (event.recurrenceUntil) {
    const explicit = new Date(`${event.recurrenceUntil}T23:59:59`);
    if (!Number.isNaN(explicit.getTime())) {
      return explicit < technicalCap ? explicit : technicalCap;
    }
  }
  return technicalCap;
};

export const computeTechnicalCap = (now: Date = new Date()): Date => {
  const cap = new Date(now);
  cap.setMonth(cap.getMonth() + technicalCapMonths);
  return cap;
};

export const planCronOccurrences = (master: ChurchEvent, now: Date = new Date()): PlannedOccurrence[] => {
  if (master.recurrence !== "cron" || !master.recurrenceRule) return [];

  const startDate = buildStartDate(master);
  if (Number.isNaN(startDate.getTime())) return [];

  const technicalCap = computeTechnicalCap(now);
  const endDate = buildEndDate(master, technicalCap);
  if (endDate <= startDate) return [];

  let interval;
  try {
    interval = CronExpressionParser.parse(master.recurrenceRule, {
      currentDate: startDate,
      endDate
    });
  } catch {
    return [];
  }

  const occurrences: PlannedOccurrence[] = [];
  const masterKey = `${master.date}T${master.startTime}`;
  let iterations = 0;

  while (iterations < maxIterations) {
    if (!interval.hasNext()) break;
    let next;
    try {
      next = interval.next();
    } catch {
      break;
    }
    iterations += 1;

    const nextDate = next.toDate();
    const date = formatDate(nextDate);
    const startTime = formatTime(nextDate);
    const key = `${date}T${startTime}`;
    if (key === masterKey) continue;
    occurrences.push({ date, startTime });
  }

  return occurrences;
};

export const isValidCronExpression = (expression: string): boolean => {
  if (!expression || !expression.trim()) return false;
  try {
    CronExpressionParser.parse(expression);
    return true;
  } catch {
    return false;
  }
};
