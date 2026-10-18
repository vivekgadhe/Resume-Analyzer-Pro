import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Analytics from "./pages/Analytics";
import Candidates from "./pages/Candidates";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword"
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/resume-analyzer"
          element={<ResumeAnalyzer />}
        />

  
        <Route path="/analytics" element={<Analytics />} />

        <Route
          path="/candidates"
          element={<Candidates />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />

        <Route
        path="/Register"
        element={<Register/>}
        />

        <Route
        path="/forgot-password"
        element={<ForgotPassword/>}
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

function Page({ title }) {
  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 dark:bg-slate-900">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
        {title}
      </h1>
    </main>
  );
}

export default App;