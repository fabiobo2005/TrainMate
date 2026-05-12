import { useEffect, useState } from "react";
import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import StudentSelector from "../components/StudentSelector";
import { api } from "../api";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

export default function Progress() {
  const [studentId, setStudentId] = useState("");
  const [exercise, setExercise] = useState("");

  const [totalLoad, setTotalLoad] = useState<any[]>([]);
  const [au, setAu] = useState<any[]>([]);
  const [exLoad, setExLoad] = useState<any[]>([]);
  const [muscle, setMuscle] = useState<any[]>([]);

  useEffect(() => {
    if (!studentId) return;
    api.get(`/progress/total-load`, { params: { studentId } }).then((r) =>
      setTotalLoad(r.data.map((x: any) => ({ ...x, label: fmtDate(x.date) })))
    );
    api.get(`/progress/arbitrary-units`, { params: { studentId } }).then((r) =>
      setAu(r.data.map((x: any) => ({ ...x, label: fmtDate(x.date) })))
    );
    api.get(`/progress/muscle-volume`, { params: { studentId } }).then((r) => setMuscle(r.data));
  }, [studentId]);

  useEffect(() => {
    if (!studentId || !exercise) { setExLoad([]); return; }
    api.get(`/progress/exercise-load`, { params: { studentId, exercise } }).then((r) =>
      setExLoad(r.data.map((x: any) => ({ ...x, label: fmtDate(x.date) })))
    );
  }, [studentId, exercise]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Progresso</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}><StudentSelector value={studentId} onChange={setStudentId} /></Box>
          <TextField label="Exercício (p/ evolução)" value={exercise}
            onChange={(e) => setExercise(e.target.value)} fullWidth size="small" />
        </Stack>
      </Paper>

      <Stack spacing={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Carga total por sessão</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={totalLoad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="totalLoadKg" stroke="#1976d2" name="Carga (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">UA (Unidades Arbitrárias)</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={au}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="arbitraryUnits" stroke="#388e3c" name="UA" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Evolução por exercício{exercise ? ` — ${exercise}` : ""}</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={exLoad}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="totalLoadForExercise" stroke="#d32f2f" name="Carga total" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Volume por grupo muscular</Typography>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={muscle}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="muscleGroup" /><YAxis /><Tooltip /><Legend />
              <Bar dataKey="totalVolume" fill="#7b1fa2" name="Volume" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>
    </Box>
  );
}
