import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const IMG_BASE = "http://127.0.0.1:8000/storage/";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const GOLD     = "#c8a96e";
const GOLD_END = "#e8c98e";
const DARK     = "#0f1e35";

const Icon = {
  Search: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>),
  MapPin: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>),
  Home:   () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>),
  Ruler:  () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>),
  Door:   () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.069.998L3 20.562a2 2 0 0 1-1-3.562V5a2 2 0 0 1 2-2h9z"/></svg>),
  Tag:    () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>),
  Key:    () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>),
  Grid:   () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>),
  List:   () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>),
  SlidersH: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>),
  ChevronDown: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>),
  ChevronUp:   () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>),
  X:           () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>),
  ArrowRight:  () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>),
  Loader:      () => (<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>),
};

export default function Tendances() {
  const navigate = useNavigate();
  const [biens,       setBiens]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterType,  setFilterType]  = useState("tous");
  const [filterVille, setFilterVille] = useState("");
  const [prixMin,     setPrixMin]     = useState("");
  const [prixMax,     setPrixMax]     = useState("");
  const [surfaceMin,  setSurfaceMin]  = useState("");
  const [piecesMin,   setPiecesMin]   = useState("");
  const [sortBy,      setSortBy]      = useState("recent");
  const [viewMode,    setViewMode]    = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    axios.get("/biens")
      .then((r) => setBiens(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  }, []);

  const disponibles = biens.filter((b) => b.statut === "disponible");
  const prixMoyen   = disponibles.length
    ? Math.round(disponibles.reduce((s, b) => s + Number(b.prix), 0) / disponibles.length) : 0;

  const filtered = disponibles.filter((b) => {
    if (filterType !== "tous" && b.type_bien !== filterType) return false;
    if (filterVille && !(b.adresse || "").toLowerCase().includes(filterVille.toLowerCase())) return false;
    if (prixMin && b.prix < Number(prixMin)) return false;
    if (prixMax && b.prix > Number(prixMax)) return false;
    if (surfaceMin && b.surface < Number(surfaceMin)) return false;
    if (piecesMin && b.nb_pieces < Number(piecesMin)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(b.titre || "").toLowerCase().includes(q) &&
          !(b.adresse || "").toLowerCase().includes(q) &&
          !(b.description || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "prix_asc")  return a.prix - b.prix;
    if (sortBy === "prix_desc") return b.prix - a.prix;
    if (sortBy === "surface")   return b.surface - a.surface;
    return b.id_bien - a.id_bien;
  });

  const hasFilters = search || filterType !== "tous" || filterVille || prixMin || prixMax || surfaceMin || piecesMin;
  const resetFilters = () => { setSearch(""); setFilterType("tous"); setFilterVille(""); setPrixMin(""); setPrixMax(""); setSurfaceMin(""); setPiecesMin(""); };
  const VILLES_RAPIDES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"];

  // ── Badge type unifié (même style vente + location) ───────────────────────
  const BadgeType = ({ type }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700,
      background: DARK, color: GOLD,
    }}>
      {type === "vente" ? <Icon.Tag /> : <Icon.Key />}
      {type === "vente" ? "Vente" : "Location"}
    </span>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFF", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .bien-card { transition: transform .2s, box-shadow .2s; cursor: pointer; }
        .bien-card:hover { transform: translateY(-4px); box-shadow: 0 20px 48px rgba(15,23,42,.13) !important; }
        .chip { transition: all .15s; cursor: pointer; }
        .chip:hover { background: rgba(255,255,255,.2) !important; }
        .btn-view { transition: all .15s; cursor: pointer; }
        .btn-view:hover { opacity: .85; }
        .btn-gold { transition: all .2s; }
        .btn-gold:hover { opacity: .88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(200,169,110,.45) !important; }
        input:focus, select:focus { outline: none; border-color: ${GOLD} !important; box-shadow: 0 0 0 3px rgba(200,169,110,.15); }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #1e3a5f 100%)", padding: "64px 32px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "rgba(200,169,110,.06)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(200,169,110,.04)" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "rgba(200,169,110,.75)", letterSpacing: ".18em", textTransform: "uppercase" }}>ImmoExpert Maroc</p>
          <h1 style={{ margin: "0 0 8px", fontSize: "clamp(30px,4vw,48px)", fontWeight: 800, color: "white", letterSpacing: "-.02em", lineHeight: 1.1 }}>Trouvez votre bien idéal</h1>
          <p style={{ margin: "0 0 36px", fontSize: 15, color: "rgba(255,255,255,.5)", fontWeight: 400 }}>
            {disponibles.length} bien{disponibles.length !== 1 ? "s" : ""} disponible{disponibles.length !== 1 ? "s" : ""} &nbsp;·&nbsp; Prix moyen {fmt(prixMoyen)}
          </p>

          <div style={{ display: "flex", background: "white", borderRadius: 14, padding: 6, boxShadow: "0 24px 64px rgba(0,0,0,.35)", gap: 0 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 16px" }}>
              <span style={{ color: "#94A3B8", flexShrink: 0 }}><Icon.Search /></span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Titre, adresse, description..."
                style={{ flex: 1, padding: "12px 0", border: "none", fontSize: 14, color: "#0F172A", background: "transparent" }} />
            </div>
            <div style={{ width: 1, background: "#E2E8F0", margin: "10px 0" }} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: "12px 16px", border: "none", background: "transparent", fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer", minWidth: 130 }}>
              <option value="tous">Tous types</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
            <div style={{ width: 1, background: "#E2E8F0", margin: "10px 0" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
              <span style={{ color: "#94A3B8", flexShrink: 0 }}><Icon.MapPin /></span>
              <input value={filterVille} onChange={(e) => setFilterVille(e.target.value)} placeholder="Ville..."
                style={{ padding: "12px 0", border: "none", fontSize: 13, color: "#334155", background: "transparent", width: 120 }} />
            </div>
            <button className="btn-gold" style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_END})`, color: DARK, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 16px rgba(200,169,110,.4)` }}>
              <Icon.Search /> Rechercher
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
            {VILLES_RAPIDES.map((v) => (
              <button key={v} className="chip" onClick={() => setFilterVille(filterVille === v ? "" : v)} style={{ padding: "6px 16px", borderRadius: 99, border: `1px solid ${filterVille === v ? "rgba(200,169,110,.7)" : "rgba(255,255,255,.15)"}`, background: filterVille === v ? "rgba(200,169,110,.2)" : "rgba(255,255,255,.07)", color: filterVille === v ? GOLD : "rgba(255,255,255,.65)", fontSize: 12, fontWeight: 600 }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px" }}>

        {/* Barre d'outils */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              {hasFilters && <span style={{ color: GOLD, fontWeight: 600 }}> (filtré{filtered.length !== 1 ? "s" : ""})</span>}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 8, border: "1px solid #FECACA", background: "#FEF2F2", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Icon.X /> Réinitialiser
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${showFilters ? GOLD : "#E2E8F0"}`, background: showFilters ? "#fdfaf5" : "white", color: showFilters ? "#92400E" : "#475569", fontWeight: 600, fontSize: 13 }}>
              <Icon.SlidersH /> Filtres avancés {showFilters ? <Icon.ChevronUp /> : <Icon.ChevronDown />}
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "white", fontSize: 13, fontWeight: 600, color: "#334155", cursor: "pointer" }}>
              <option value="recent">Plus récents</option>
              <option value="prix_asc">Prix croissant</option>
              <option value="prix_desc">Prix décroissant</option>
              <option value="surface">Surface</option>
            </select>
            <div style={{ display: "flex", border: "1.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
              {[["grid", <Icon.Grid />], ["list", <Icon.List />]].map(([m, ico]) => (
                <button key={m} className="btn-view" onClick={() => setViewMode(m)} style={{ padding: "8px 14px", border: "none", cursor: "pointer", background: viewMode === m ? GOLD : "white", color: viewMode === m ? DARK : "#94A3B8", display: "flex", alignItems: "center" }}>{ico}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", marginBottom: 24, boxShadow: "0 4px 20px rgba(15,23,42,.07)", border: `1.5px solid ${GOLD}40`, animation: "fadeUp .2s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[
                { label: "PRIX MIN (MAD)",   val: prixMin,    set: setPrixMin,    ph: "500 000"   },
                { label: "PRIX MAX (MAD)",   val: prixMax,    set: setPrixMax,    ph: "2 000 000" },
                { label: "SURFACE MIN (m²)", val: surfaceMin, set: setSurfaceMin, ph: "50"        },
                { label: "NB PIÈCES MIN",    val: piecesMin,  set: setPiecesMin,  ph: "2"         },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: ".08em", display: "block", marginBottom: 6 }}>{label}</label>
                  <input type="number" value={val} onChange={(e) => set(e.target.value)} placeholder={ph} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#0F172A" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenu */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Icon.Loader />
            <p style={{ fontWeight: 600, fontSize: 15, color: "#64748B", marginTop: 16 }}>Chargement des biens...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#94A3B8" }}><Icon.Home /></div>
            <p style={{ fontWeight: 800, fontSize: 20, color: "#0F172A", margin: "0 0 8px" }}>Aucun bien trouvé</p>
            <p style={{ color: "#64748B", margin: "0 0 24px", fontSize: 14 }}>Essayez de modifier vos critères de recherche</p>
            <button className="btn-gold" onClick={resetFilters} style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_END})`, color: DARK, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Réinitialiser les filtres</button>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 24 }}>
            {filtered.map((b, idx) => {
              const img = b.images?.[0]?.url_image;
              return (
                <div key={b.id_bien} className="bien-card" onClick={() => navigate(`/biens/${b.id_bien}`)}
                  style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(15,23,42,.07)", animation: `fadeUp .4s ease ${idx * 0.05}s both` }}>
                  <div style={{ height: 210, position: "relative", overflow: "hidden", background: "#F1F5F9" }}>
                    {img
                      ? <img src={`${IMG_BASE}${img}`} alt={b.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#CBD5E1" }}><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                    }
                    {/* ✅ Badge unifié — même couleur vente et location */}
                    <div style={{ position: "absolute", top: 14, left: 14 }}>
                      <BadgeType type={b.type_bien} />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 90, background: "linear-gradient(to top,rgba(0,0,0,.55),transparent)" }} />
                    <p style={{ position: "absolute", bottom: 14, left: 16, margin: 0, color: "white", fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", fontFamily: "'Cormorant Garamond', serif" }}>
                      {fmt(b.prix)}{b.type_bien === "location" && <span style={{ fontSize: 12, fontWeight: 400 }}>/mois</span>}
                    </p>
                  </div>
                  <div style={{ padding: "16px 18px 18px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.titre}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14, color: "#94A3B8" }}>
                      <Icon.MapPin /><span style={{ fontSize: 12 }}>{b.adresse || "—"}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748B", marginBottom: 16 }}>
                      {b.surface   && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Ruler />{b.surface} m²</span>}
                      {b.nb_pieces && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Door />{b.nb_pieces} pièces</span>}
                    </div>
                    <button className="btn-gold" style={{ width: "100%", padding: "11px 0", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_END})`, color: DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px rgba(200,169,110,.35)` }}>
                      Voir le bien <Icon.ArrowRight />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((b, idx) => {
              const img = b.images?.[0]?.url_image;
              return (
                <div key={b.id_bien} className="bien-card" onClick={() => navigate(`/biens/${b.id_bien}`)}
                  style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,.07)", display: "flex", animation: `fadeUp .3s ease ${idx * 0.04}s both` }}>
                  <div style={{ width: 200, height: 140, flexShrink: 0, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
                    {img
                      ? <img src={`${IMG_BASE}${img}`} alt={b.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#CBD5E1" }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>
                    }
                    {/* ✅ Badge unifié vue liste */}
                    <div style={{ position: "absolute", top: 10, left: 10 }}>
                      <BadgeType type={b.type_bien} />
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{b.titre}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, color: "#94A3B8" }}>
                        <Icon.MapPin /><span style={{ fontSize: 13 }}>{b.adresse || "—"}</span>
                      </div>
                      <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#64748B" }}>
                        {b.surface   && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Ruler />{b.surface} m²</span>}
                        {b.nb_pieces && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Icon.Door />{b.nb_pieces} pièces</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 24 }}>
                      <p style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 800, color: "#0F172A", letterSpacing: "-.01em", fontFamily: "'Cormorant Garamond', serif" }}>
                        {fmt(b.prix)}{b.type_bien === "location" && <span style={{ fontSize: 12, fontWeight: 400, color: "#64748B" }}>/mois</span>}
                      </p>
                      <button className="btn-gold" style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_END})`, color: DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 14px rgba(200,169,110,.3)` }}>
                        Voir <Icon.ArrowRight />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer stats */}
        {!loading && filtered.length > 0 && (
          <div style={{ marginTop: 40, background: "white", borderRadius: 16, padding: "24px 32px", boxShadow: "0 2px 12px rgba(15,23,42,.07)", display: "flex", gap: 0, justifyContent: "center" }}>
            {[
              { label: "Biens affichés", value: filtered.length },
              { label: "En vente",       value: filtered.filter(b => b.type_bien === "vente").length },
              { label: "En location",    value: filtered.filter(b => b.type_bien === "location").length },
              { label: "Prix moyen",     value: fmt(filtered.reduce((s,b) => s + Number(b.prix),0) / filtered.length) },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "0 24px", borderRight: i < 3 ? "1px solid #F1F5F9" : "none" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}