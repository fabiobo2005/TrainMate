import { useEffect, useState } from "react";
import { api, Student } from "../api";
import {
  Box, Button, List, ListItem, ListItemText, Stack,
  TextField, Typography, Paper,
} from "@mui/material";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  const load = () => api.get<Student[]>("/students").then((r) => setStudents(r.data));
  useEffect(() => { load(); }, []);

  async function create() {
    if (!name.trim()) return;
    await api.post("/students", { name, nickname: nickname || undefined });
    setName(""); setNickname(""); load();
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Alunos</Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="Apelido" value={nickname} onChange={(e) => setNickname(e.target.value)} fullWidth />
          <Button variant="contained" onClick={create}>Adicionar</Button>
        </Stack>
      </Paper>
      <Paper>
        <List>
          {students.map((s) => (
            <ListItem key={s.id} divider>
              <ListItemText primary={s.name} secondary={s.nickname || s.id} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
