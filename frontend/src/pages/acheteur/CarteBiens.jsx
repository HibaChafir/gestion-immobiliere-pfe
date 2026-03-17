import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="background:${color};width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 16px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;">
    <div style="transform:rotate(45deg);font-size:15px;margin-top:2px;">🏠</div>
  </div>`,
  iconSize:    [38, 38],
  iconAnchor:  [19, 38],
  popupAnchor: [0, -40],
});

const ICONS = {
  vente:    makeIcon("#0f1e35"),
  location: makeIcon("#c8a96e"),
  default:  makeIcon("#9ca3af"),
};

const IMG_BASE = "http://127.0.0.1:8000/storage/";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const VILLES_COORDS = {
  casablanca:  { coords: [33.5731, -7.5898],  aliases: ["casablanca", "casa", "dar el beida", "dar-el-beida"] },
  rabat:       { coords: [34.0209, -6.8416],  aliases: ["rabat", "hay riad", "agdal", "souissi", "ocean", "hassan", "akkari"] },
  marrakech:   { coords: [31.6295, -7.9811],  aliases: ["marrakech", "marrakesh", "gueliz", "hivernage", "palmeraie"] },
  fes:         { coords: [34.0181, -5.0078],  aliases: ["fes", "fez", "medersa"] },
  tanger:      { coords: [35.7595, -5.8340],  aliases: ["tanger", "tangier", "tanja", "malabata"] },
  agadir:      { coords: [30.4278, -9.5981],  aliases: ["agadir", "inzegane", "ait melloul"] },
  meknes:      { coords: [33.8935, -5.5473],  aliases: ["meknes", "mekhez"] },
  oujda:       { coords: [34.6814, -1.9086],  aliases: ["oujda"] },
  tetouan:     { coords: [35.5785, -5.3684],  aliases: ["tetouan", "tetuan", "martil"] },
  kenitra:     { coords: [34.2610, -6.5802],  aliases: ["kenitra", "mehdia"] },
  safi:        { coords: [32.2994, -9.2372],  aliases: ["safi", "asfi"] },
  eljadida:    { coords: [33.2549, -8.5078],  aliases: ["el jadida", "eljadida", "azemmour"] },
  benimellal:  { coords: [32.3373, -6.3498],  aliases: ["beni mellal", "benimellal"] },
  nador:       { coords: [35.1681, -2.9335],  aliases: ["nador"] },
  settat:      { coords: [32.9927, -7.6194],  aliases: ["settat"] },
  berrechid:   { coords: [33.2655, -7.5882],  aliases: ["berrechid"] },
  khouribga:   { coords: [32.8811, -6.9063],  aliases: ["khouribga"] },
  mohammedia:  { coords: [33.6861, -7.3830],  aliases: ["mohammedia"] },
  sale:        { coords: [34.0365, -6.8227],  aliases: ["sale", "sala", "tabriquet"] },
  temara:      { coords: [33.9269, -6.9132],  aliases: ["temara"] },
  essaouira:   { coords: [31.5085, -9.7595],  aliases: ["essaouira", "mogador"] },
  ifrane:      { coords: [33.5228, -5.1127],  aliases: ["ifrane"] },
  ouarzazate:  { coords: [30.9335, -6.9370],  aliases: ["ouarzazate"] },
  laayoune:    { coords: [27.1418, -13.1800], aliases: ["laayoune", "el aaiun"] },
};

// ✅ FIX 1 : échapper les caractères spéciaux AVANT injection dans RegExp
// "tanger" contient "g" qui était interprété comme flag regex → plantait silencieusement
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ✅ FIX 2 : normaliser les accents séparément des aliases
// pour éviter que "fès" ou "méknès" créent des regex invalides
function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getCoords(bien) {
  // Priorité 1 : coordonnées GPS exactes en BDD
  if (bien.latitude && bien.longitude) {
    return [parseFloat(bien.latitude), parseFloat(bien.longitude)];
  }

  const adresse = normalizeStr(bien.adresse || "");
  if (!adresse) return [31.7917, -7.0926];

  // Priorité 2 : chercher chaque alias dans l'adresse normalisée
  for (const [, { coords, aliases }] of Object.entries(VILLES_COORDS)) {
    for (const alias of aliases) {
      // ✅ normaliser ET échapper l'alias avant RegExp
      const aliasNorm = escapeRegex(normalizeStr(alias));
      const regex = new RegExp(`(^|[^a-z])${aliasNorm}([^a-z]|$)`);
      if (regex.test(adresse)) {
        return coords;
      }
    }
  }

  // Priorité 3 : ville inconnue → centre Maroc
  return [31.7917, -7.0926];
}

// Même fix pour la liste des villes du dropdown
function detectVille(adresse) {
  const norm = normalizeStr(adresse);
  for (const [nom, { aliases }] of Object.entries(VILLES_COORDS)) {
    for (const alias of aliases) {
      const aliasNorm = escapeRegex(normalizeStr(alias));
      const regex = new RegExp(`(^|[^a-z])${aliasNorm}([^a-z]|$)`);
      if (regex.test(norm)) {
        return nom.charAt(0).toUpperCase() + nom.slice(1);
      }
    }
  }
  return null;
}

function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.2 });
  }, [center]);
  return null;
}

export default function CarteBiens() {
  const navigate = useNavigate();
  const [biens,       setBiens]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [flyCenter,   setFlyCenter]   = useState(null);
  const [filterType,  setFilterType]  = useState("tous");
  const [filterVille, setFilterVille] = useState("");
  const [filterPrix,  setFilterPrix]  = useState([0, 10000000]);
  const [search,      setSearch]      = useState("");
  const [showPanel,   setShowPanel]   = useState(true);

  useEffect(() => {
    axios.get("/biens")
      .then((r) => setBiens(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  const biensAvecCoords = biens
    .filter((b) => b.statut === "disponible")
    .map((b) => ({ ...b, coords: getCoords(b) }));

  const filtered = biensAvecCoords.filter((b) => {
    if (filterType !== "tous" && b.type_bien !== filterType) return false;
    if (filterVille && normalizeStr(b.adresse || "").indexOf(normalizeStr(filterVille)) === -1) return false;
    if (b.prix < filterPrix[0] || b.prix > filterPrix[1]) return false;
    if (search &&
      !normalizeStr(b.titre || "").includes(normalizeStr(search)) &&
      !normalizeStr(b.adresse || "").includes(normalizeStr(search))) return false;
    return true;
  });

  const handleSelectBien = (bien) => {
    setSelected(bien);
    setFlyCenter(bien.coords);
  };

  // ✅ Utilise detectVille() pour le dropdown — même logique robuste
  const villes = [...new Set(
    biens
      .map((b) => detectVille(b.adresse || ""))
      .filter(Boolean)
  )].sort();

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        .bien-card:hover { background: rgba(200,169,110,0.06) !important; transform: translateX(3px); }
        .bien-card { transition: all 0.18s ease; cursor: pointer; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #f8f7f4; }
        ::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.4); border-radius: 99px; }
        .leaflet-popup-content-wrapper {
          border-radius: 20px !important;
          box-shadow: 0 20px 60px rgba(15,30,53,0.2) !important;
          border: 1px solid rgba(200,169,110,0.15) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .leaflet-popup-tip-container { display: none; }
        input[type=range] { accent-color: #c8a96e; }
        input::placeholder { color: rgba(200,169,110,0.5); }
      `}</style>

      {/* ── PANNEAU GAUCHE ── */}
      {showPanel && (
        <div style={{ width: 370, flexShrink: 0, background: "white", boxShadow: "4px 0 24px rgba(15,30,53,0.08)", display: "flex", flexDirection: "column", zIndex: 10, overflow: "hidden", borderRight: "1px solid rgba(200,169,110,0.1)" }}>

          {/* Header navy */}
          <div style={{ background: "#0f1e35", padding: "22px 22px 18px", position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", left: 22, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
            <div style={{ paddingLeft: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Carte interactive
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 4px", color: "white", fontSize: 22, fontWeight: 700 }}>
                  Biens disponibles
                </h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, color: "rgba(200,169,110,0.6)", fontSize: 11 }}>
                  {filtered.length} bien{filtered.length > 1 ? "s" : ""} sur la carte
                </p>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: "50%", width: 30, height: 30, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >✕</button>
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginTop: 14, paddingLeft: 18 }}>
              <svg style={{ position: "absolute", left: 30, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un bien, une ville..."
                style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.2)", background: "rgba(255,255,255,0.06)", color: "white", fontSize: 12, outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Filtres */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(200,169,110,0.08)", background: "#fdfcfa", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              {[
                { val: "tous",     label: "Tous"     },
                { val: "vente",    label: "Vente"    },
                { val: "location", label: "Location" },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setFilterType(val)} style={{ flex: 1, padding: "7px 0", borderRadius: 99, border: `1px solid ${filterType === val ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.5px", background: filterType === val ? "#0f1e35" : "white", color: filterType === val ? "#c8a96e" : "#9ca3af", cursor: "pointer", transition: "all .14s" }}>
                  {label}
                </button>
              ))}
            </div>

            <select
              value={filterVille}
              onChange={(e) => setFilterVille(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", fontSize: 12, color: "#0f1e35", background: "white", outline: "none", fontFamily: "'DM Sans',sans-serif", marginBottom: 12, cursor: "pointer" }}
            >
              <option value="">Toutes les villes</option>
              {villes.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>Prix maximum</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: "#c8a96e" }}>{fmt(filterPrix[1])}</span>
              </div>
              <input type="range" min={0} max={10000000} step={50000} value={filterPrix[1]}
                onChange={(e) => setFilterPrix([0, Number(e.target.value)])}
                style={{ width: "100%" }} />
            </div>
          </div>

          {/* Liste biens */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 12, margin: 0, fontWeight: 600 }}>Chargement...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun bien trouvé</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", margin: 0 }}>Modifiez vos filtres</p>
              </div>
            ) : (
              filtered.map((b) => {
                const img = b.images?.[0]?.url_image;
                const isSelected = selected?.id_bien === b.id_bien;
                return (
                  <div
                    key={b.id_bien}
                    className="bien-card"
                    onClick={() => handleSelectBien(b)}
                    style={{ display: "flex", gap: 12, padding: "12px 20px", background: isSelected ? "rgba(200,169,110,0.08)" : "white", borderLeft: `3px solid ${isSelected ? "#c8a96e" : "transparent"}` }}
                  >
                    <div style={{ width: 66, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.15)" }}>
                      {img
                        ? <img src={`${IMG_BASE}${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                          </div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 3px", fontWeight: 700, fontSize: 14, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.titre}</p>
                      <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 7px", fontSize: 10, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.adresse || "—"}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "#065f46" }}>{fmt(b.prix)}</span>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, padding: "2px 9px", borderRadius: 99, letterSpacing: "0.5px", background: b.type_bien === "vente" ? "rgba(15,30,53,0.08)" : "rgba(200,169,110,0.1)", color: b.type_bien === "vente" ? "#0f1e35" : "#c8a96e", border: `1px solid ${b.type_bien === "vente" ? "rgba(15,30,53,0.2)" : "rgba(200,169,110,0.3)"}` }}>
                          {b.type_bien}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Toggle panel ── */}
      {!showPanel && (
        <button
          onClick={() => setShowPanel(true)}
          style={{ position: "absolute", left: 16, top: 16, zIndex: 1000, background: "#0f1e35", border: "1px solid rgba(200,169,110,0.3)", borderRadius: 14, padding: "10px 18px", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, color: "#c8a96e", boxShadow: "0 4px 20px rgba(15,30,53,0.25)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.5px" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
          Biens ({filtered.length})
        </button>
      )}

      {/* ── CARTE ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={[31.7917, -7.0926]} zoom={6} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          {flyCenter && <FlyTo center={flyCenter} />}
          {filtered.map((b) => (
            <Marker
              key={b.id_bien}
              position={b.coords}
              icon={ICONS[b.type_bien] || ICONS.default}
              eventHandlers={{ click: () => handleSelectBien(b) }}
            >
              <Popup>
                <div style={{ width: 250, fontFamily: "'DM Sans',sans-serif" }}>
                  <div style={{ height: 130, background: "#f8f7f4", position: "relative", overflow: "hidden" }}>
                    {b.images?.[0]?.url_image
                      ? <img src={`${IMG_BASE}${b.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        </div>
                    }
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,30,53,0.6) 0%, transparent 50%)" }} />
                    <span style={{ position: "absolute", top: 10, right: 10, background: b.type_bien === "vente" ? "#0f1e35" : "#c8a96e", color: b.type_bien === "vente" ? "#c8a96e" : "#0f1e35", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.8px", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>
                      {b.type_bien}
                    </span>
                    <div style={{ position: "absolute", bottom: 10, left: 14 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{b.titre}</p>
                    </div>
                  </div>

                  <div style={{ padding: "14px 16px", background: "white" }}>
                    <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 10px", fontSize: 10, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {b.adresse || "—"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#065f46" }}>{fmt(b.prix)}</span>
                      <div style={{ display: "flex", gap: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                        {b.surface   && <span>{b.surface}m²</span>}
                        {b.nb_pieces && <span>{b.nb_pieces} pièces</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/biens/${b.id_bien}`)}
                      style={{ width: "100%", padding: "10px 0", border: "none", borderRadius: 12, background: "#0f1e35", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2d4d"}
                      onMouseLeave={e => e.currentTarget.style.background = "#0f1e35"}
                    >
                      Voir le bien
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* ── Stats overlay ── */}
        <div style={{ position: "absolute", bottom: 20, right: 20, zIndex: 1000, background: "#0f1e35", borderRadius: 16, padding: "14px 20px", boxShadow: "0 8px 30px rgba(15,30,53,0.3)", border: "1px solid rgba(200,169,110,0.15)", display: "flex", gap: 18, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#c8a96e", lineHeight: 1 }}>
              {filtered.filter(b => b.type_bien === "vente").length}
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "rgba(200,169,110,0.5)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginTop: 3 }}>Vente</div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(200,169,110,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1 }}>
              {filtered.filter(b => b.type_bien === "location").length}
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "rgba(200,169,110,0.5)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginTop: 3 }}>Location</div>
          </div>
          <div style={{ width: 1, height: 28, background: "rgba(200,169,110,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: "#c8a96e", lineHeight: 1 }}>
              {filtered.length}
            </div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "rgba(200,169,110,0.5)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginTop: 3 }}>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}