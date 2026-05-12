import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Students from "./pages/Students";
import Train from "./pages/Train";
import Cardio from "./pages/Cardio";
import Progress from "./pages/Progress";
import Plans from "./pages/Plans";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/train" element={<Train />} />
        <Route path="/train/:studentId" element={<Train />} />
        <Route path="/cardio" element={<Cardio />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/plans" element={<Plans />} />
      </Routes>
    </Layout>
  );
}
