import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";

export default function Home() {
  const nav = useNavigate();
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Bem-vindo ao TrainMate</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Selecione o tipo de treino ou gerencie alunos pelo menu.
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Iniciar Treino (Força)</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Escolha aluno, cor/dia e microciclo
            </Typography>
            <Button variant="contained" onClick={() => nav("/train")}>Começar</Button>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Cardio</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Registrar sessão (escada, bike, esteira)
            </Typography>
            <Button variant="contained" onClick={() => nav("/cardio")}>Registrar</Button>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Progresso</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Gráficos de carga, UA, volume
            </Typography>
            <Button variant="contained" onClick={() => nav("/progress")}>Ver</Button>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
