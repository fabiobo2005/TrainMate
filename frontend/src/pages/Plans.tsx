import { useEffect, useState } from "react";
import {
  Box, FormControl, InputLabel, MenuItem, Select, Stack,
  Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import { api, Block, TrainingExercise } from "../api";

const COLORS = ["AMARELO", "VERDE", "VERMELHO", "LARANJA", "AZUL"];

export default function Plans() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockId, setBlockId] = useState("");
  const [color, setColor] = useState("AMARELO");
  const [microcycle, setMicrocycle] = useState(1);
  const [exercises, setExercises] = useState<TrainingExercise[]>([]);

  useEffect(() => {
    api.get<Block[]>("/plans/blocks").then((r) => {
      setBlocks(r.data);
      if (r.data[0]) setBlockId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!blockId) return;
    api.get(`/plans/blocks/${blockId}/days/${color}/microcycles/${microcycle}`)
      .then((r) => setExercises(r.data.exercises || []))
      .catch(() => setExercises([]));
  }, [blockId, color, microcycle]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Planos de Treino</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Bloco</InputLabel>
            <Select label="Bloco" value={blockId} onChange={(e) => setBlockId(String(e.target.value))}>
              {blocks.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Cor / Dia</InputLabel>
            <Select label="Cor / Dia" value={color} onChange={(e) => setColor(String(e.target.value))}>
              {COLORS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Microciclo</InputLabel>
            <Select label="Microciclo" value={microcycle}
              onChange={(e) => setMicrocycle(Number(e.target.value))}>
              {[1, 2, 3, 4].map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Exercício</TableCell>
              <TableCell>Séries</TableCell>
              <TableCell>Reps</TableCell>
              <TableCell>Cadência</TableCell>
              <TableCell>Intervalo (s)</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Observações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell>{ex.orderIndex + 1}</TableCell>
                <TableCell>{ex.exerciseNameRaw}</TableCell>
                <TableCell>{ex.series}</TableCell>
                <TableCell>{ex.reps}</TableCell>
                <TableCell>{ex.cadence}</TableCell>
                <TableCell>{ex.restSeconds}</TableCell>
                <TableCell>{ex.methodRaw}</TableCell>
                <TableCell>{ex.observations}</TableCell>
              </TableRow>
            ))}
            {exercises.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center">
                <i>Sem exercícios. Importe um Excel ou selecione outro bloco/dia/microciclo.</i>
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
