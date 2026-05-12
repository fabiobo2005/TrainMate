import { Router } from "express";
import { prisma } from "../prisma";
import { CreateStudentSchema } from "@trainmate/shared";

export const studentsRouter = Router();

studentsRouter.get("/", async (_req, res, next) => {
  try {
    const students = await prisma.student.findMany({ orderBy: { name: "asc" } });
    res.json(students);
  } catch (e) { next(e); }
});

studentsRouter.post("/", async (req, res, next) => {
  try {
    const input = CreateStudentSchema.parse(req.body);
    const student = await prisma.student.create({ data: input });
    res.status(201).json(student);
  } catch (e) { next(e); }
});
