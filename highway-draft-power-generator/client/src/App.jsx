import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import UserPage from "./pages/UserPage.jsx";

export default function App() {
  const [page, setPage] = useState("home"); // home | admin | user
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Routing logic
  useEffect(() => {
    const token = localStorage.getItem("hdpg_token");
    if (token) {
      setIsAuthenticated(true);
      setPage("admin");
    }
  }, []);

  const handleAdminLogin = (token) => {
    localStorage.setItem("hdpg_token", token);
    setIsAuthenticated(true);
    setPage("admin");
  };

  const handleLogout = () => {
    localStorage.removeItem("hdpg_token");
    setIsAuthenticated(false);
    setPage("home");
  };

  if (page === "admin" && isAuthenticated)
    return <AdminPage onLogout={handleLogout} />;
  if (page === "user")
    return <UserPage onBack={() => setPage("home")} />;
  return (
    <HomePage
      onAdminLogin={handleAdminLogin}
      onEnterUser={() => setPage("user")}
    />
  );
}
