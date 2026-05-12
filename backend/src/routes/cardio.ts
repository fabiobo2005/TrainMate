import { Router } from "express";
import { prisma } from "../prisma";
import { CreateCardioSchema } from "@trainmate/shared";

export const cardioRouter = Router();

cardioRouter.post("/", async (req, res, next) => {
  try {
    const input = CreateCardioSchema.parse(req.body);
    const created = await prisma.cardioSession.create({
      data: {
        studentId: input.studentId,
        date: input.date ? new Date(input.date) : new Date(),
        cardioType: input.cardioType,
        equipment: input.equipment,
        durationMinutes: input.durationMinutes,
        intensity: input.intensity,
        pse: input.pse,
        intervalsCount: input.intervalsCount ?? null,
        intervalDurationSec: input.intervalDurationSec ?? null,
        notes: input.notes ?? "",
      },
    });
    res.status(201).json(created);
  } catch (e) { next(e); }
});

cardioRouter.get("/", async (req, res, next) => {
  try {
    const studentId = req.query.studentId as string | undefined;
    const items = await prisma.cardioSession.findMany({
      where: studentId ? { studentId } : undefined,
      orderBy: { date: "desc" },
    });
    res.json(items);
  } catch (e) { next(e); }
});
