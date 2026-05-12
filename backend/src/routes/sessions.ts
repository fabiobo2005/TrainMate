import { Router } from "express";
import { prisma } from "../prisma";
import {
  CreateSessionSchema,
  AddSetSchema,
  FinishSessionSchema,
} from "@trainmate/shared";

export const sessionsRouter = Router();

sessionsRouter.post("/", async (req, res, next) => {
  try {
    const input = CreateSessionSchema.parse(req.body);

    let dayId: string | undefined;
    let microcycleId: string | undefined;
    if (input.blockId && input.dayColor) {
      const day = await prisma.trainingDay.findFirst({
        where: { blockId: input.blockId, color: input.dayColor },
      });
      dayId = day?.id;
    }
    if (input.blockId && input.microcycleIndex) {
      const mc = await prisma.trainingMicrocycle.findFirst({
        where: { blockId: input.blockId, index: input.microcycleIndex },
      });
      microcycleId = mc?.id;
    }

    const session = await prisma.workoutSession.create({
      data: {
        studentId: input.studentId,
        blockId: input.blockId,
        dayId,
        microcycleId,
        date: input.date ? new Date(input.date) : new Date(),
        status: "IN_PROGRESS",
      },
    });
    res.status(201).json(session);
  } catch (e) { next(e); }
});

sessionsRouter.get("/:id", async (req, res, next) => {
  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: req.params.id },
      include: { sets: true },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (e) { next(e); }
});

sessionsRouter.post("/:sessionId/sets", async (req, res, next) => {
  try {
    const input = AddSetSchema.parse(req.body);
    const loadTotal = input.repsExecuted * input.weightKg;
    const set = await prisma.workoutSet.create({
      data: {
        sessionId: req.params.sessionId,
        exerciseId: input.exerciseId,
        exerciseNameRaw: input.exerciseNameRaw,
        setNumber: input.setNumber,
        repsExecuted: input.repsExecuted,
        weightKg: input.weightKg,
        loadTotal,
        notes: input.notes ?? "",
      },
    });
    res.status(201).json(set);
  } catch (e) { next(e); }
});

sessionsRouter.post("/:sessionId/finish", async (req, res, next) => {
  try {
    const input = FinishSessionSchema.parse(req.body);
    const sets = await prisma.workoutSet.findMany({
      where: { sessionId: req.params.sessionId },
    });
    const totalLoadKg = sets.reduce((a, s) => a + (s.loadTotal || 0), 0);
    const arbitraryUnits = input.pse * input.durationMinutes;

    const session = await prisma.workoutSession.update({
      where: { id: req.params.sessionId },
      data: {
        durationMinutes: input.durationMinutes,
        pse: input.pse,
        notes: input.notes ?? "",
        totalLoadKg,
        arbitraryUnits,
        status: "FINISHED",
      },
    });
    res.json(session);
  } catch (e) { next(e); }
});
