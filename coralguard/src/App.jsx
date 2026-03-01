import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Overview from "./pages/Overview";
import ReefMap from "./pages/ReefMap";
import Analyze from "./pages/Analyze";
import ReefBot from "./pages/ReefBot";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: "#0a0a0a" }}>
        {/* Grain texture overlay */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px",
          }}
        />

        <Navbar />

        {/* Page content */}
        <main className="relative z-10 pt-16 cita-main">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/reefs" element={<ReefMap />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/reefbot" element={<ReefBot />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
