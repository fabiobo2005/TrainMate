import { useEffect, useState } from "react";
import {
  Box, Button, FormControl, InputLabel, MenuItem, Select,
  Stack, TextField, Typography, Paper, Alert, List, ListItem, ListItemText, Divider,
} from "@mui/material";
import { api, CardioSession } from "../api";
import StudentSelector from "../components/StudentSelector";

export default function Cardio() {
  const [studentId, setStudentId] = useState("");
  const [equipment, setEquipment] = useState<"ESCADA" | "BICICLETA" | "ESTEIRA" | "OUTRO">("ESCADA");
  const [cardioType, setCardioType] = useState<"CONTINUOUS" | "INTERVALS">("CONTINUOUS");
  const [duration, setDuration] = useState("20");
  const [intensity, setIntensity] = useState("Moderada");
  const [pse, setPse] = useState("6");
  const [intervalsCount, setIntervalsCount] = useState("");
  const [intervalDuration, setIntervalDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CardioSession[]>([]);
  const [success, setSuccess] = useState("");

  async function load() {
    if (!studentId) return setItems([]);
    const r = await api.get<CardioSession[]>("/cardio", { params: { studentId } });
    setItems(r.data);
  }
  useEffect(() => { load(); }, [studentId]);

  async function save() {
    if (!studentId) return;
    await api.post("/cardio", {
      studentId, equipment, cardioType,
      durationMinutes: parseInt(duration || "0", 10),
      intensity, pse: parseInt(pse || "0", 10),
      intervalsCount: intervalsCount ? parseInt(intervalsCount, 10) : undefined,
      intervalDurationSec: intervalDuration ? parseInt(intervalDuration, 10) : undefined,
      notes: notes || undefined,
    });
    setSuccess("Cardio registrado!");
    setTimeout(() => setSuccess(""), 2500);
    load();
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Cardio</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <StudentSelector value={studentId} onChange={setStudentId} />
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Equipamento</InputLabel>
              <Select label="Equipamento" value={equipment} onChange={(e) => setEquipment(e.target.value as any)}>
                <MenuItem value="ESCADA">Escada</MenuItem>
                <MenuItem value="BICICLETA">Bicicleta</MenuItem>
                <MenuItem value="ESTEIRA">Esteira</MenuItem>
                <MenuItem value="OUTRO">Outro</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select label="Tipo" value={cardioType} onChange={(e) => setCardioType(e.target.value as any)}>
                <MenuItem value="CONTINUOUS">Contínuo</MenuItem>
                <MenuItem value="INTERVALS">Intervalado</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField label="Duração (min)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <TextField label="Intensidade" value={intensity} onChange={(e) => setIntensity(e.target.value)} />
            <TextField label="PSE (0-10)" value={pse} onChange={(e) => setPse(e.target.value)} />
          </Stack>
          {cardioType === "INTERVALS" && (
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="N. de intervalos" value={intervalsCount} onChange={(e) => setIntervalsCount(e.target.value)} />
              <TextField label="Duração de cada (s)" value={intervalDuration} onChange={(e) => setIntervalDuration(e.target.value)} />
            </Stack>
          )}
          <TextField label="Observações" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
          <Button variant="contained" onClick={save} disabled={!studentId}>Salvar</Button>
        </Stack>
      </Paper>

      <Typography variant="h6">Histórico</Typography>
      <Paper sx={{ mt: 1 }}>
        <List>
          {items.map((c, idx) => (
            <Box key={c.id}>
              {idx > 0 && <Divider />}
              <ListItem>
                <ListItemText
                  primary={`${new Date(c.date).toLocaleString()} — ${c.equipment} (${c.cardioType})`}
                  secondary={`${c.durationMinutes} min · Intensidade: ${c.intensity} · PSE ${c.pse}${
                    c.intervalsCount ? ` · ${c.intervalsCount}x${c.intervalDurationSec}s` : ""
                  }${c.notes ? ` · ${c.notes}` : ""}`}
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
