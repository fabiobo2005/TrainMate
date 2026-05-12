import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box, Button, Card, CardContent, FormControl, InputLabel,
  MenuItem, Select, Stack, TextField, Typography, Paper, Alert,
} from "@mui/material";
import { api, Block, TrainingExercise, WorkoutSession } from "../api";
import StudentSelector from "../components/StudentSelector";

const COLORS = ["AMARELO", "VERDE", "VERMELHO", "LARANJA", "AZUL"];

type SetInput = { reps: string; weight: string; notes: string };

export default function Train() {
  const params = useParams();
  const [studentId, setStudentId] = useState(params.studentId || "");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockId, setBlockId] = useState("");
  const [color, setColor] = useState("AMARELO");
  const [microcycle, setMicrocycle] = useState(1);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [setsByEx, setSetsByEx] = useState<Record<string, SetInput[]>>({});
  const [finishDuration, setFinishDuration] = useState("60");
  const [finishPse, setFinishPse] = useState("7");
  const [finishNotes, setFinishNotes] = useState("");
  const [summary, setSummary] = useState<WorkoutSession | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    api.get<Block[]>("/plans/blocks").then((r) => {
      setBlocks(r.data);
      if (r.data[0]) setBlockId(r.data[0].id);
    });
  }, []);

  async function loadPrescription() {
    setError("");
    if (!blockId) return;
    try {
      const r = await api.get(`/plans/blocks/${blockId}/days/${color}/microcycles/${microcycle}`);
      setExercises(r.data.exercises || []);
      const init: Record<string, SetInput[]> = {};
      for (const ex of r.data.exercises) init[ex.id] = [{ reps: "", weight: "", notes: "" }];
      setSetsByEx(init);
    } catch (e: any) {
      setError(e?.response?.data?.error || "Erro ao carregar prescrição");
      setExercises([]);
    }
  }

  async function startSession() {
    if (!studentId) { setError("Selecione um aluno"); return; }
    const r = await api.post<WorkoutSession>("/sessions", {
      studentId, blockId, dayColor: color, microcycleIndex: microcycle,
    });
    setSession(r.data);
    setSummary(null);
  }

  function addSet(exId: string) {
    setSetsByEx((prev) => ({ ...prev, [exId]: [...(prev[exId] || []), { reps: "", weight: "", notes: "" }] }));
  }
  function updateSet(exId: string, idx: number, field: keyof SetInput, val: string) {
    setSetsByEx((prev) => {
      const arr = [...(prev[exId] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, [exId]: arr };
    });
  }

  async function finishSession() {
    if (!session) return;
    // Save all sets
    for (const ex of exercises) {
      const sets = setsByEx[ex.id] || [];
      for (let i = 0; i < sets.length; i++) {
        const s = sets[i];
        const reps = parseInt(s.reps || "0", 10);
        const weight = parseFloat(s.weight || "0");
        if (reps <= 0 && weight <= 0) continue;
        await api.post(`/sessions/${session.id}/sets`, {
          exerciseId: ex.exercise?.id,
          exerciseNameRaw: ex.exerciseNameRaw,
          setNumber: i + 1,
          repsExecuted: reps,
          weightKg: weight,
          notes: s.notes || undefined,
        });
      }
    }
    const r = await api.post<WorkoutSession>(`/sessions/${session.id}/finish`, {
      durationMinutes: parseInt(finishDuration || "0", 10),
      pse: parseInt(finishPse || "0", 10),
      notes: finishNotes || undefined,
    });
    setSummary(r.data);
    setSession(null);
  }

  const canLoad = useMemo(() => Boolean(blockId), [blockId]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Iniciar Treino (Força)</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}><StudentSelector value={studentId} onChange={setStudentId} /></Box>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Bloco</InputLabel>
            <Select label="Bloco" value={blockId} onChange={(e) => setBlockId(String(e.target.value))}>
              {blocks.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Cor / Dia</InputLabel>
            <Select label="Cor / Dia" value={color} onChange={(e) => setColor(String(e.target.value))}>
              {COLORS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Microciclo</InputLabel>
            <Select
              label="Microciclo"
              value={microcycle}
              onChange={(e) => setMicrocycle(Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
          </FormControl>
          <Button variant="outlined" disabled={!canLoad} onClick={loadPrescription}>Carregar</Button>
          <Button variant="contained" disabled={!studentId || exercises.length === 0} onClick={startSession}>
            Iniciar Sessão
          </Button>
        </Stack>
      </Paper>

      {exercises.length > 0 && (
        <Stack spacing={2}>
          {exercises.map((ex) => (
            <Card key={ex.id}>
              <CardContent>
                <Typography variant="h6">{ex.exerciseNameRaw}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {ex.series}x{ex.reps} | Cadência: {ex.cadence || "-"} | Intervalo: {ex.restSeconds}s
                  {ex.methodRaw ? ` | Método: ${ex.methodRaw}` : ""}
                  {ex.observations ? ` | ${ex.observations}` : ""}
                </Typography>
                {session && (
                  <Stack spacing={1}>
                    {(setsByEx[ex.id] || []).map((s, idx) => (
                      <Stack key={idx} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                        <Typography sx={{ minWidth: 50 }}>Set {idx + 1}</Typography>
                        <TextField size="small" label="Reps" value={s.reps}
                          onChange={(e) => updateSet(ex.id, idx, "reps", e.target.value)} />
                        <TextField size="small" label="Carga (kg)" value={s.weight}
                          onChange={(e) => updateSet(ex.id, idx, "weight", e.target.value)} />
                        <TextField size="small" label="Obs." value={s.notes} fullWidth
                          onChange={(e) => updateSet(ex.id, idx, "notes", e.target.value)} />
                      </Stack>
                    ))}
                    <Button size="small" onClick={() => addSet(ex.id)}>+ Adicionar set</Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {session && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6">Finalizar Sessão</Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1 }}>
            <TextField label="Duração (min)" value={finishDuration}
              onChange={(e) => setFinishDuration(e.target.value)} />
            <TextField label="PSE (0-10)" value={finishPse}
              onChange={(e) => setFinishPse(e.target.value)} />
            <TextField label="Observações" value={finishNotes} fullWidth
              onChange={(e) => setFinishNotes(e.target.value)} />
            <Button variant="contained" color="success" onClick={finishSession}>Finalizar</Button>
          </Stack>
        </Paper>
      )}

      {summary && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Sessão finalizada — Carga total: <b>{summary.totalLoadKg} kg</b> · UA: <b>{summary.arbitraryUnits}</b>
        </Alert>
      )}
    </Box>
  );
}
