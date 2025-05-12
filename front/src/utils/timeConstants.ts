
export const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const DAYS_OF_WEEK = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
] as const;

export const DAY_LABELS = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday"
} as const;

export const DAY_LABELS_FR = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi"
} as const;

export function formatTimeSlot(start: string, end: string): string {
  return `${start} - ${end}`;
}

// Import the createEmptyTimeSlots function from availabilityUtils directly
// This avoids duplicate exports
import { createEmptyTimeSlots } from "./availabilityUtils";
export { createEmptyTimeSlots };
