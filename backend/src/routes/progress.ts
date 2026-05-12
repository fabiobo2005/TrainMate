import { Router } from "express";
import { prisma } from "../prisma";

export const progressRouter = Router();

function requireStudent(req: any, res: any): string | null {
  const sid = req.query.studentId as string | undefined;
  if (!sid) { res.status(400).json({ error: "studentId is required" }); return null; }
  return sid;
}

progressRouter.get("/total-load", async (req, res, next) => {
  try {
    const sid = requireStudent(req, res); if (!sid) return;
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId: sid, status: "FINISHED" },
      orderBy: { date: "asc" },
      select: { date: true, totalLoadKg: true },
    });
    res.json(sessions.map((s) => ({ date: s.date, totalLoadKg: s.totalLoadKg })));
  } catch (e) { next(e); }
});

progressRouter.get("/arbitrary-units", async (req, res, next) => {
  try {
    const sid = requireStudent(req, res); if (!sid) return;
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId: sid, status: "FINISHED" },
      orderBy: { date: "asc" },
      select: { date: true, arbitraryUnits: true },
    });
    res.json(sessions.map((s) => ({ date: s.date, arbitraryUnits: s.arbitraryUnits })));
  } catch (e) { next(e); }
});

progressRouter.get("/exercise-load", async (req, res, next) => {
  try {
    const sid = requireStudent(req, res); if (!sid) return;
    const exercise = (req.query.exercise as string | undefined)?.trim();
    if (!exercise) return res.status(400).json({ error: "exercise is required" });

    const sets = await prisma.workoutSet.findMany({
      where: {
        exerciseNameRaw: { equals: exercise },
        session: { studentId: sid, status: "FINISHED" },
      },
      include: { session: { select: { date: true } } },
    });

    // group by session date
    const byDate = new Map<string, number>();
    for (const s of sets) {
      const d = s.session.date.toISOString();
      byDate.set(d, (byDate.get(d) || 0) + (s.loadTotal || 0));
    }
    const series = Array.from(byDate.entries())
      .map(([date, totalLoadForExercise]) => ({ date, totalLoadForExercise }))
      .sort((a, b) => a.date.localeCompare(b.date));
    res.json(series);
  } catch (e) { next(e); }
});

progressRouter.get("/muscle-volume", async (req, res, next) => {
  try {
    const sid = requireStudent(req, res); if (!sid) return;
    const sets = await prisma.workoutSet.findMany({
      where: { session: { studentId: sid, status: "FINISHED" } },
      include: { exercise: true },
    });
    const byMuscle = new Map<string, number>();
    for (const s of sets) {
      const muscle = s.exercise?.muscleGroup || "Unknown";
      byMuscle.set(muscle, (byMuscle.get(muscle) || 0) + (s.loadTotal || 0));
    }
    res.json(
      Array.from(byMuscle.entries()).map(([muscleGroup, totalVolume]) => ({ muscleGroup, totalVolume }))
    );
  } catch (e) { next(e); }
});
