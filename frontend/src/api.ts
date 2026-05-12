import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

export type Student = { id: string; name: string; nickname?: string | null };
export type Block = { id: string; name: string; sourceFile: string; importedAt: string };
export type Day = { id: string; color: string; label: string };
export type Microcycle = { id: string; index: number };
export type TrainingExercise = {
  id: string;
  exerciseNameRaw: string;
  series: number;
  reps: string;
  cadence: string;
  restSeconds: number;
  methodRaw: string;
  observations: string;
  orderIndex: number;
  exercise?: { id: string; name: string; muscleGroup?: string | null } | null;
  method?: { id: string; name: string; description?: string | null } | null;
};
export type WorkoutSession = {
  id: string;
  studentId: string;
  date: string;
  durationMinutes: number;
  pse: number;
  arbitraryUnits: number;
  totalLoadKg: number;
  notes: string;
  status: "IN_PROGRESS" | "FINISHED";
};
export type WorkoutSet = {
  id: string;
  sessionId: string;
  exerciseNameRaw: string;
  setNumber: number;
  repsExecuted: number;
  weightKg: number;
  loadTotal: number;
  notes: string;
};
export type CardioSession = {
  id: string;
  studentId: string;
  date: string;
  cardioType: "CONTINUOUS" | "INTERVALS";
  equipment: "ESCADA" | "BICICLETA" | "ESTEIRA" | "OUTRO";
  durationMinutes: number;
  intensity: string;
  pse: number;
  intervalsCount?: number | null;
  intervalDurationSec?: number | null;
  notes: string;
};
