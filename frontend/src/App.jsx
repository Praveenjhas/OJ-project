import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProblemsPage from "./pages/ProblemsPage.jsx";
import ProblemDetail from "./pages/ProblemDetail.jsx";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/problems"
          element={
            <PrivateRoute>
              <ProblemsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <PrivateRoute>
              <ProblemDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
