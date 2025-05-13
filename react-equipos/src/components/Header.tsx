import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faCog, faBars } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    const darkVars = {
      "--bg-color": "#000000",
      "--header-bg": "linear-gradient(145deg, #1E1E1E, #000000)",
      "--card-bg": "linear-gradient(145deg, #1E1E1E, #2B2B2B)",
      "--text-color": "#ffffff",
      "--text-secondary": "#a0aec0",
      "--input-bg": "#1a202c",
      "--card-shadow": "0 10px 20px rgba(160, 32, 240, 0.3)",
      "--header-text": "#ffffff",
    };

    const lightVars = {
      "--bg-color": "#f7fafc",
      "--header-bg": "#3357E9",
      "--card-bg": "linear-gradient(145deg, #ffffff, #f7fafc)",
      "--text-color": "#1a202c",
      "--text-secondary": "#4a5568",
      "--input-bg": "#edf2f7",
      "--card-shadow": "0 10px 20px rgba(37, 99, 235, 0.2)",
      "--header-text": "#ffffff",
    };

    const vars = theme === "dark" ? darkVars : lightVars;

    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    document.body.style.backgroundColor = vars["--bg-color"];
    document.body.style.color = vars["--text-color"];
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev: "light" | "dark") => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="flex justify-between items-center p-4 header-bg shadow-lg">
      <div className="text-2xl font-bold" style={{ color: "var(--header-text)" }}>
        <i className="fas fa-users mr-2"></i> IQSCORE - Visor de Jugadores
      </div>
      <div className="flex items-center space-x-2">
        <button className="theme-switch" id="theme-toggle" onClick={toggleTheme}>
          <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} style={{ color: "var(--header-text)" }} />
        </button>
        <button className="md:hidden p-2 rounded theme-switch">
          <FontAwesomeIcon icon={faBars} style={{ color: "var(--header-text)" }} />
        </button>
        <button className="hidden md:block p-2 rounded theme-switch">
          <FontAwesomeIcon icon={faCog} style={{ color: "var(--header-text)" }} />
        </button>
      </div>
    </header>
  );
};

export default Header;