import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MesBiens from "./pages/vendeur/MesBiens"
import AjouterBien from "./pages/vendeur/AjouterBien"
import CreerContrat from "./pages/vendeur/CreerContrat"
import MesContratsVendeur from "./pages/vendeur/MesContrats"
import MesContratsAcheteur from "./pages/acheteur/MesContrats"
import ModifierBien from "./pages/vendeur/ModifierBien"
import DetailBien from "./pages/DetailBien"
import MesDemandes from "./pages/vendeur/MesDemandes"
import Dashboard from "./pages/vendeur/Dashboard"
import MesPaiements from "./pages/vendeur/MesPaiements"
import MesTransactions from "./pages/vendeur/MesTransactions"
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/biens" element={<h1>Liste des biens</h1>} />
        <Route path="/biens/:id" element={<DetailBien />} />
        <Route path="/contact" element={<h1>Contact</h1>} />
        <Route path="/mes-droits" element={<h1>Mes droits</h1>} />

        {/* ── Vendeur ── */}
        <Route path="/vendeur/mes-biens" element={<MesBiens />} />
        <Route path="/vendeur/ajouter-bien" element={<AjouterBien />} />
        <Route path="/vendeur/creer-contrat" element={<CreerContrat />} />
        <Route path="/vendeur/contrats" element={<MesContratsVendeur />} />
        <Route path="/vendeur/modifier-bien/:id" element={<ModifierBien />} />
        <Route path="/vendeur/mes-demandes" element={<MesDemandes />} />
        <Route path="/vendeur/mes-transactions" element={<MesTransactions />} />
        <Route path="/vendeur/dashboard" element={<Dashboard />} />
        <Route path="/vendeur/mes-paiements"    element={<MesPaiements />} />

        {/* ── Client / Acheteur ──
            La Navbar utilise /client/... donc on aligne ici */}
        <Route path="/client/mes-contrats" element={<MesContratsAcheteur />} />
        <Route path="/client/favoris" element={<h1>Mes Favoris</h1>} />
        <Route path="/client/mes-paiements" element={<h1>Mes Paiements</h1>} />

        {/* Anciennes routes acheteur (redirigent vers les nouvelles) */}
        <Route path="/acheteur/contrats" element={<MesContratsAcheteur />} />
      </Routes>
    </>
  )
}

export default App