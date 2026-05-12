import { Router } from "express";
import { prisma } from "../prisma";

export const plansRouter = Router();

plansRouter.get("/blocks", async (_req, res, next) => {
  try {
    const blocks = await prisma.trainingBlock.findMany({
      orderBy: { importedAt: "desc" },
    });
    res.json(blocks);
  } catch (e) { next(e); }
});

plansRouter.get("/blocks/:blockId", async (req, res, next) => {
  try {
    const block = await prisma.trainingBlock.findUnique({
      where: { id: req.params.blockId },
      include: {
        days: { orderBy: { color: "asc" } },
        microcycles: { orderBy: { index: "asc" } },
        protocols: true,
      },
    });
    if (!block) return res.status(404).json({ error: "Block not found" });
    res.json(block);
  } catch (e) { next(e); }
});

plansRouter.get(
  "/blocks/:blockId/days/:color/microcycles/:index",
  async (req, res, next) => {
    try {
      const { blockId, color, index } = req.params;
      const day = await prisma.trainingDay.findFirst({
        where: { blockId, color: color.toUpperCase() },
      });
      if (!day) return res.status(404).json({ error: "Day not found" });
      const microcycle = await prisma.trainingMicrocycle.findFirst({
        where: { blockId, index: parseInt(index, 10) },
      });
      if (!microcycle) return res.status(404).json({ error: "Microcycle not found" });

      const exercises = await prisma.trainingExercise.findMany({
        where: { blockId, dayId: day.id, microcycleId: microcycle.id },
        orderBy: { orderIndex: "asc" },
        include: { exercise: true, method: true },
      });
      res.json({ day, microcycle, exercises });
    } catch (e) { next(e); }
  }
);
