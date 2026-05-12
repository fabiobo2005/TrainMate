import { createApp } from "./app";

const port = parseInt(process.env.PORT || "4000", 10);
const app = createApp();

app.listen(port, () => {
  console.log(`[trainmate] backend listening on http://localhost:${port}`);
});
