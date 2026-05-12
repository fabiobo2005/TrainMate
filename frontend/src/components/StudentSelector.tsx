import { useEffect, useState } from "react";
import { api, Student } from "../api";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export default function StudentSelector({
  value, onChange,
}: { value: string; onChange: (id: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => { api.get("/students").then((r) => setStudents(r.data)); }, []);
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Aluno</InputLabel>
      <Select label="Aluno" value={value} onChange={(e) => onChange(String(e.target.value))}>
        {students.map((s) => (
          <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
