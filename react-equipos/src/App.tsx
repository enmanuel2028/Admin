
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from "./components/Header";
import Teams from "./components/Teams";
import TeamTitles from "./components/TeamTitles";
import Home from "./components/Home";
import Standings from "./components/Standings";
import Players from "./components/Players";
import "./App.css";
import { useParams } from 'react-router-dom';
import Login from './components/Login';
import PlayerHistory from './components/PlayerHistory';


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/equipos" element={<Teams />} />
            <Route path="/titulos" element={<TeamTitles />} />
            <Route path="/titulos/:id" element={<TeamTitles />} />
            <Route path="/posiciones" element={<Standings />} />
            <Route path="/jugadores" element={<Players />} />
            <Route path="/loginadmin" element={<Login />} />
            <Route path="/historia" element={<PlayerHistory />} />

          </Routes>
        </main>
        <footer className="bg-header-bg text-center p-4 text-white text-sm">
          © 2023 IQSCORE - Todos los derechos reservados
        </footer>
      </div>
    </Router>
  );
}

export default App;
