import { z } from "zod";

export const ColorEnum = z.enum(["AMARELO", "VERDE", "VERMELHO", "LARANJA", "AZUL"]);
export type Color = z.infer<typeof ColorEnum>;

export const CardioTypeEnum = z.enum(["CONTINUOUS", "INTERVALS"]);
export type CardioType = z.infer<typeof CardioTypeEnum>;

export const CardioEquipmentEnum = z.enum(["ESCADA", "BICICLETA", "ESTEIRA", "OUTRO"]);
export type CardioEquipment = z.infer<typeof CardioEquipmentEnum>;

export const SessionStatusEnum = z.enum(["IN_PROGRESS", "FINISHED"]);
export type SessionStatus = z.infer<typeof SessionStatusEnum>;

// ----- Students -----
export const CreateStudentSchema = z.object({
  name: z.string().min(1),
  nickname: z.string().optional(),
});
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

// ----- Sessions -----
export const CreateSessionSchema = z.object({
  studentId: z.string().min(1),
  blockId: z.string().optional(),
  dayColor: ColorEnum.optional(),
  microcycleIndex: z.number().int().min(1).max(4).optional(),
  date: z.string().datetime().optional(),
});
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

export const AddSetSchema = z.object({
  exerciseId: z.string().optional(),
  exerciseNameRaw: z.string().min(1),
  setNumber: z.number().int().min(1),
  repsExecuted: z.number().int().min(0),
  weightKg: z.number().min(0),
  notes: z.string().optional(),
});
export type AddSetInput = z.infer<typeof AddSetSchema>;

export const FinishSessionSchema = z.object({
  durationMinutes: z.number().int().min(0),
  pse: z.number().int().min(0).max(10),
  notes: z.string().optional(),
});
export type FinishSessionInput = z.infer<typeof FinishSessionSchema>;

// ----- Cardio -----
export const CreateCardioSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().datetime().optional(),
  cardioType: CardioTypeEnum,
  equipment: CardioEquipmentEnum,
  durationMinutes: z.number().int().min(0),
  intensity: z.string().min(1),
  pse: z.number().int().min(0).max(10),
  intervalsCount: z.number().int().min(0).optional(),
  intervalDurationSec: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});
export type CreateCardioInput = z.infer<typeof CreateCardioSchema>;
