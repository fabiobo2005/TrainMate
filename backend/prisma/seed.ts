import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const names = ["Aluno Demo 1", "Aluno Demo 2", "Aluno Demo 3"];
  for (const name of names) {
    const existing = await prisma.student.findFirst({ where: { name } });
    if (!existing) await prisma.student.create({ data: { name } });
  }

  const demo = await prisma.student.findFirst({ where: { name: "Aluno Demo 1" } });
  if (demo) {
    const hasSession = await prisma.workoutSession.findFirst({ where: { studentId: demo.id } });
    if (!hasSession) {
      const session = await prisma.workoutSession.create({
        data: {
          studentId: demo.id,
          durationMinutes: 60,
          pse: 7,
          arbitraryUnits: 420,
          totalLoadKg: 2200,
          status: "FINISHED",
          notes: "Seed demo session",
        },
      });
      await prisma.workoutSet.createMany({
        data: [
          {
            sessionId: session.id,
            exerciseNameRaw: "Supino Reto",
            setNumber: 1,
            repsExecuted: 10,
            weightKg: 60,
            loadTotal: 600,
          },
          {
            sessionId: session.id,
            exerciseNameRaw: "Agachamento Livre",
            setNumber: 1,
            repsExecuted: 8,
            weightKg: 100,
            loadTotal: 800,
          },
        ],
      });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
