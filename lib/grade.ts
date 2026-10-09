export function gradeFor(percent: number) {
  if (percent >= 87) return { note: "1", label: "Sehr gut" };
  if (percent >= 75) return { note: "2", label: "Gut" };
  if (percent >= 63) return { note: "3", label: "Befriedigend" };
  if (percent >= 50) return { note: "4", label: "Genügend" };
  return { note: "5", label: "Nicht genügend" };
}

export const gradeScale = [
  { note: "1", label: "Sehr gut", range: "87–100 %" },
  { note: "2", label: "Gut", range: "75–86 %" },
  { note: "3", label: "Befriedigend", range: "63–74 %" },
  { note: "4", label: "Genügend", range: "50–62 %" },
  { note: "5", label: "Nicht genügend", range: "unter 50 %" },
];
