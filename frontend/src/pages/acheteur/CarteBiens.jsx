import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Fix icônes Leaflet ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const makeIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="background:${color};width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><div style="transform:rotate(45deg);font-size:14px;margin-top:2px;">🏠</div></div>`,
  iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -38],
});

const ICONS = {
  vente:    makeIcon("#4F46E5"),
  location: makeIcon("#059669"),
  default:  makeIcon("#94A3B8"),
};

const IMG_BASE = "http://127.0.0.1:8000/storage/";

const fmt = (n) => new Intl.NumberFormat("fr-MA", {
  style: "currency", currency: "MAD", maximumFractionDigits: 0,
}).format(n || 0);

// ── Géocodage Nominatim depuis le navigateur ──────────────────────────────────
const cache = {};
async function geocode(adresse) {
  if (!adresse) return [33.9716, -6.8498];
  const key = adresse.trim().toLowerCase();
  if (cache[key]) return cache[key];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresse + " Maroc")}&format=json&limit=1&countrycodes=ma`;
    const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      cache[key] = coords;
      return coords;
    }
  } catch (e) {
    console.warn("Geocode error:", e);
  }
  return [33.9716, -6.8498];
}

// ── 13 Régions du Maroc ───────────────────────────────────────────────────────
const REGIONS = [
  { nom: "Toutes les régions",          coords: [31.7917, -7.0926],  zoom: 6  },
  { nom: "Casablanca-Settat",           coords: [33.5731, -7.5898],  zoom: 10 },
  { nom: "Rabat-Salé-Kénitra",          coords: [34.0209, -6.8416],  zoom: 10 },
  { nom: "Marrakech-Safi",              coords: [31.6295, -7.9811],  zoom: 10 },
  { nom: "Fès-Meknès",                  coords: [34.0181, -5.0078],  zoom: 10 },
  { nom: "Tanger-Tétouan-Al Hoceïma",   coords: [35.7595, -5.8340],  zoom: 9  },
  { nom: "Souss-Massa",                 coords: [30.4278, -9.5981],  zoom: 10 },
  { nom: "Oriental",                    coords: [34.6814, -1.9086],  zoom: 10 },
  { nom: "Béni Mellal-Khénifra",        coords: [32.3373, -6.3498],  zoom: 10 },
  { nom: "Drâa-Tafilalet",              coords: [31.9314, -4.4278],  zoom: 9  },
  { nom: "Guelmim-Oued Noun",           coords: [28.9870, -10.0574], zoom: 9  },
  { nom: "Laâyoune-Sakia El Hamra",     coords: [27.1253, -13.1625], zoom: 9  },
  { nom: "Dakhla-Oued Ed-Dahab",        coords: [23.6848, -15.9572], zoom: 9  },
];

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 11, { duration: 1.2 });
  }, [center, zoom]);
  return null;
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function CarteBiens() {
  const navigate = useNavigate();
  const [biensCoords,  setBiensCoords]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [geocoding,    setGeocoding]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [flyTarget,    setFlyTarget]    = useState(null);
  const [filterType,   setFilterType]   = useState("tous");
  const [filterRegion, setFilterRegion] = useState(REGIONS[0]);
  const [regionSearch, setRegionSearch] = useState("");
  const [filterPrix,   setFilterPrix]   = useState(10000000);
  const [search,       setSearch]       = useState("");
  const [showPanel,    setShowPanel]    = useState(true);
  const [showRegions,  setShowRegions]  = useState(false);

  // ── Charger biens puis géocoder un par un ────────────────────────────────
  useEffect(() => {
    axios.get("/biens").then(async (r) => {
      const disponibles = (Array.isArray(r.data) ? r.data : [])
        .filter((b) => b.statut === "disponible");
      setLoading(false);
      setGeocoding(true);

      const resolved = [];
      for (const b of disponibles) {
        let coords;
        // Priorité 1 : coords déjà en BD
        if (b.latitude && b.longitude) {
          coords = [parseFloat(b.latitude), parseFloat(b.longitude)];
        } else {
          // Priorité 2 : géocodage Nominatim depuis navigateur
          coords = await geocode(b.adresse || "");
          await new Promise(res => setTimeout(res, 400)); // pause 400ms
        }
        resolved.push({ ...b, coords });
        setBiensCoords([...resolved]); // affichage progressif
      }
      setGeocoding(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = biensCoords.filter((b) => {
    if (filterType !== "tous" && b.type_bien !== filterType) return false;
    if (b.prix > filterPrix) return false;
    if (search &&
      !(b.titre  || "").toLowerCase().includes(search.toLowerCase()) &&
      !(b.adresse|| "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const regionsFiltrees = REGIONS.filter((r) =>
    r.nom.toLowerCase().includes(regionSearch.toLowerCase())
  );

  const handleSelectBien = (bien) => {
    setSelected(bien);
    setFlyTarget({ center: bien.coords, zoom: 15 });
  };

  const handleSelectRegion = (region) => {
    setFilterRegion(region);
    setFlyTarget({ center: region.coords, zoom: region.zoom });
    setShowRegions(false);
    setRegionSearch("");
  };

  return (
    <div style={{ height: "calc(100vh - 68px)", display: "flex", fontFamily: "'Outfit', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        .bien-card:hover { background:#EEF2FF!important; transform:translateX(3px); }
        .bien-card { transition:all 0.18s ease; cursor:pointer; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#c7d2fe; border-radius:99px; }
        .leaflet-popup-content-wrapper { border-radius:16px!important; box-shadow:0 8px 30px rgba(15,23,42,.15)!important; border:none!important; padding:0!important; overflow:hidden; }
        .leaflet-popup-content { margin:0!important; }
        .region-item:hover { background:#EEF2FF; }
        .region-item { transition:background 0.12s; cursor:pointer; }
      `}</style>

      {/* ── Panneau gauche ── */}
      {showPanel && (
        <div style={{ width: 370, flexShrink: 0, background: "white", boxShadow: "4px 0 20px rgba(15,23,42,0.08)", display: "flex", flexDirection: "column", zIndex: 10, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "18px 18px 14px", background: "linear-gradient(135deg,#4F46E5,#0891B2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: "white", fontSize: 18, fontWeight: 800 }}>🗺️ Carte Immobilière</h2>
                <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.8)", fontSize: 11 }}>
                  {loading
                    ? "Chargement..."
                    : geocoding
                    ? "📍 Localisation des biens..."
                    : `${filtered.length} bien${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
                </p>
              </div>
              <button onClick={() => setShowPanel(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "5px 10px", color: "white", cursor: "pointer", fontSize: 15 }}>✕</button>
            </div>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher titre, adresse..."
                style={{ width: "100%", padding: "9px 12px 9px 32px", borderRadius: 9, border: "none", background: "rgba(255,255,255,0.18)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Filtres */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFF" }}>

            {/* Région */}
            <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: ".06em" }}>📍 RÉGION</p>
            <div style={{ position: "relative", marginBottom: 12 }}>
              <button onClick={() => setShowRegions(!showRegions)} style={{
                width: "100%", padding: "9px 14px", borderRadius: 9,
                border: `1.5px solid ${showRegions ? "#4F46E5" : "#E2E8F0"}`,
                background: "white", textAlign: "left", cursor: "pointer",
                fontSize: 13, fontWeight: 600, color: "#334155",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>🗺️ {filterRegion.nom}</span>
                <span style={{ color: "#94A3B8", fontSize: 11 }}>{showRegions ? "▲" : "▼"}</span>
              </button>

              {showRegions && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  background: "white", border: "1.5px solid #E2E8F0", borderRadius: 10,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.12)", zIndex: 100, overflow: "hidden",
                }}>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid #F1F5F9" }}>
                    <input value={regionSearch} onChange={(e) => setRegionSearch(e.target.value)}
                      placeholder="🔍 Chercher une région..." autoFocus
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1.5px solid #E2E8F0", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div style={{ maxHeight: 220, overflowY: "auto" }}>
                    {regionsFiltrees.map((r) => (
                      <div key={r.nom} className="region-item" onClick={() => handleSelectRegion(r)}
                        style={{
                          padding: "9px 14px", fontSize: 13,
                          fontWeight: filterRegion.nom === r.nom ? 700 : 500,
                          color: filterRegion.nom === r.nom ? "#4F46E5" : "#334155",
                          background: filterRegion.nom === r.nom ? "#EEF2FF" : "transparent",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                        {r.nom}
                        {filterRegion.nom === r.nom && <span style={{ fontSize: 10, color: "#4F46E5" }}>✓</span>}
                      </div>
                    ))}
                    {regionsFiltrees.length === 0 && (
                      <div style={{ padding: "14px", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>Aucune région trouvée</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Type */}
            <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: ".06em" }}>TYPE</p>
            <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
              {[["tous","Tous","#64748B"],["vente","Vente","#4F46E5"],["location","Location","#059669"]].map(([val, label, color]) => (
                <button key={val} onClick={() => setFilterType(val)} style={{
                  flex: 1, padding: "7px 0", borderRadius: 8, border: "none", fontSize: 12, fontWeight: 700,
                  background: filterType === val ? color : "#F1F5F9",
                  color: filterType === val ? "white" : "#64748B",
                  cursor: "pointer", transition: "all .15s",
                }}>{label}</button>
              ))}
            </div>

            {/* Prix max */}
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "#64748B", letterSpacing: ".06em" }}>
              PRIX MAX — <span style={{ color: "#4F46E5" }}>{fmt(filterPrix)}</span>
            </p>
            <input type="range" min={0} max={10000000} step={50000}
              value={filterPrix} onChange={(e) => setFilterPrix(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#4F46E5" }}
            />
          </div>

          {/* Liste biens */}
          <div style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>⏳</div>
                <p style={{ margin: 0, fontWeight: 600 }}>Chargement...</p>
              </div>
            ) : biensCoords.length === 0 && geocoding ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📍</div>
                <p style={{ margin: 0, fontWeight: 600 }}>Localisation en cours...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏚️</div>
                <p style={{ margin: 0, fontWeight: 700 }}>Aucun bien trouvé</p>
              </div>
            ) : (
              filtered.map((b) => {
                const img = b.images?.[0]?.url_image;
                const isSelected = selected?.id_bien === b.id_bien;
                return (
                  <div key={b.id_bien} className="bien-card"
                    onClick={() => handleSelectBien(b)}
                    style={{
                      display: "flex", gap: 12, padding: "11px 18px",
                      background: isSelected ? "#EEF2FF" : "white",
                      borderLeft: isSelected ? "3px solid #4F46E5" : "3px solid transparent",
                    }}>
                    <div style={{ width: 66, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "#F1F5F9" }}>
                      {img
                        ? <img src={`${IMG_BASE}${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                        : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 22 }}>🏠</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.titre}</p>
                      <p style={{ margin: "0 0 5px", fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {b.adresse || "—"}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#4F46E5" }}>{fmt(b.prix)}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                          background: b.type_bien === "vente" ? "#EEF2FF" : "#ECFDF5",
                          color: b.type_bien === "vente" ? "#4F46E5" : "#059669",
                        }}>{b.type_bien}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Bouton rouvrir panneau */}
      {!showPanel && (
        <button onClick={() => setShowPanel(true)} style={{
          position: "absolute", left: 16, top: 16, zIndex: 1000,
          background: "white", border: "none", borderRadius: 12,
          padding: "10px 16px", fontWeight: 700, fontSize: 13, color: "#4F46E5",
          boxShadow: "0 4px 20px rgba(15,23,42,0.15)", cursor: "pointer",
        }}>☰ Biens ({filtered.length})</button>
      )}

      {/* ── Carte ── */}
      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={[31.7917, -7.0926]} zoom={6}
          style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

          {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}

          {filtered.map((b) => (
            <Marker key={b.id_bien} position={b.coords}
              icon={ICONS[b.type_bien] || ICONS.default}
              eventHandlers={{ click: () => handleSelectBien(b) }}>
              <Popup>
                <div style={{ width: 240, fontFamily: "'Outfit', sans-serif" }}>
                  <div style={{ height: 130, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
                    {b.images?.[0]?.url_image
                      ? <img src={`${IMG_BASE}${b.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40 }}>🏠</div>
                    }
                    <span style={{
                      position: "absolute", top: 10, right: 10,
                      background: b.type_bien === "vente" ? "#4F46E5" : "#059669",
                      color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                    }}>{b.type_bien}</span>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <h4 style={{ margin: "0 0 5px", fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{b.titre}</h4>
                    <p style={{ margin: "0 0 10px", fontSize: 11, color: "#94A3B8" }}>📍 {b.adresse || "—"}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#4F46E5" }}>{fmt(b.prix)}</span>
                      <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#64748B" }}>
                        {b.surface && <span>📐 {b.surface}m²</span>}
                        {b.nb_pieces && <span>🛏️ {b.nb_pieces}p</span>}
                      </div>
                    </div>
                    <button onClick={() => navigate(`/biens/${b.id_bien}`)} style={{
                      width: "100%", padding: "9px 0", border: "none", borderRadius: 10,
                      background: "linear-gradient(135deg,#4F46E5,#0891B2)",
                      color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    }}>Voir le bien →</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Badge compteur */}
        <div style={{
          position: "absolute", bottom: 20, right: 20, zIndex: 1000,
          background: "white", borderRadius: 14, padding: "12px 18px",
          boxShadow: "0 4px 20px rgba(15,23,42,0.15)", display: "flex", gap: 16,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#4F46E5" }}>{filtered.filter(b => b.type_bien === "vente").length}</div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>Vente</div>
          </div>
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>{filtered.filter(b => b.type_bien === "location").length}</div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>Location</div>
          </div>
          <div style={{ width: 1, background: "#F1F5F9" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0891B2" }}>{filtered.length}</div>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600 }}>Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}