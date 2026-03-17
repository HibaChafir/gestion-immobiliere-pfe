import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const STATUTS = ['en_attente', 'disponible', 'vendu', 'loue'];
const IMG_BASE = 'http://127.0.0.1:8000/storage/';

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const STATUT_CONFIG = {
  en_attente: { label: "En attente", color: "#c8a96e",  bg: "rgba(200,169,110,0.1)",  border: "rgba(200,169,110,0.3)"  },
  disponible: { label: "Disponible", color: "#065f46",  bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.25)"   },
  vendu:      { label: "Vendu",      color: "#991b1b",  bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"    },
  loue:       { label: "Loué",       color: "#0f1e35",  bg: "rgba(15,30,53,0.08)",    border: "rgba(15,30,53,0.2)"     },
};

const TYPE_CONFIG = {
  vente:    { color: "#0f1e35", bg: "rgba(15,30,53,0.08)",  border: "rgba(15,30,53,0.2)"   },
  location: { color: "#065f46", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.25)" },
};

const GRID    = "45px 180px 95px 125px 80px 55px 150px 115px 150px 70px 130px";
const MIN_W   = 1195;

function Avatar({ nom, prenom, size = 26 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

export default function GestionBiens() {
  const [biens, setBiens]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showImages, setShowImages] = useState(null);
  const [success, setSuccess]       = useState('');
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    axios.get('/biens')
      .then(res => setBiens(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Impossible de charger les biens.'))
      .finally(() => setLoading(false));
  };

  const showMsg = (msg, isError = false) => {
    isError ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer ce bien ?')) return;
    axios.delete(`/biens/${id}`)
      .then(() => { showMsg('Bien supprimé !'); fetchData(); })
      .catch(() => showMsg('Erreur lors de la suppression.', true));
  };

  const handleStatut = (id, statut) => {
    axios.patch(`/biens/${id}/statut`, { statut })
      .then(() => { showMsg('Statut mis à jour !'); fetchData(); })
      .catch(() => showMsg('Erreur lors de la mise à jour.', true));
  };

  const filtered = biens.filter(b => {
    const q = search.toLowerCase();
    return (
      (b.titre     || '').toLowerCase().includes(q) ||
      (b.type_bien || '').toLowerCase().includes(q) ||
      (b.statut    || '').toLowerCase().includes(q) ||
      (b.adresse   || '').toLowerCase().includes(q) ||
      String(b.prix    || '').includes(q) ||
      String(b.surface || '').includes(q) ||
      (b.vendeur ? `${b.vendeur.prenom} ${b.vendeur.nom}`.toLowerCase() : '').includes(q) ||
      (b.vendeur?.email || '').toLowerCase().includes(q)
    );
  });

  const STAT_ITEMS = [
    { label: 'En attente', statut: 'en_attente', color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: 'Disponible', statut: 'disponible', color: "#065f46",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
    { label: 'Vendu',      statut: 'vendu',      color: "#991b1b",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: 'Loué',       statut: 'loue',       color: "#0f1e35",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> },
    { label: 'Total',      statut: null,         color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement des biens...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .rh:hover { background: #faf8f4 !important; cursor: pointer; }
        .rh { transition: background .12s; }
        input:focus, select:focus { border-color: #c8a96e !important; outline: none; }
        .tscroll::-webkit-scrollbar { height: 4px; }
        .tscroll::-webkit-scrollbar-track { background: #f8f7f4; }
        .tscroll::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.4); border-radius: 99px; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=90" alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: 72, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>Administration</span>
            <h1 style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>Gestion des Biens</h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>Gérez, validez et suivez tous les biens immobiliers</p>
          </div>
          <button onClick={fetchData}
            style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Actualiser
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 28px 80px" }} className="fade-up">

        {/* ── Notifications ── */}
        {success && (
          <div style={{ background: "white", border: "1px solid rgba(5,150,105,0.2)", borderLeft: "3px solid #065f46", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#065f46", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
          {STAT_ITEMS.map(s => {
            const count = s.statut ? biens.filter(b => b.statut === s.statut).length : biens.length;
            return (
              <div key={s.label} style={{ background: "white", padding: "20px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{s.label}</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: s.color, lineHeight: 1 }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* ── Table card ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>

          {/* Search */}
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Rechercher par titre, type, adresse, vendeur, prix, statut..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif" }} />
            </div>
          </div>

          {/* ✅ scroll horizontal */}
          <div className="tscroll" style={{ overflowX: "auto" }}>

            {/* Header navy */}
            <div style={{ background: "#0f1e35", padding: "12px 20px", display: "grid", gridTemplateColumns: GRID, gap: 6, minWidth: MIN_W }}>
              {["#", "Titre", "Type", "Prix", "Surface", "Pcs", "Adresse", "Statut", "Vendeur", "Photos", "Actions"].map(h => (
                <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)", whiteSpace: "nowrap" }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", minWidth: MIN_W }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun bien trouvé</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Modifiez votre recherche</p>
              </div>
            ) : (
              filtered.map((bien, i) => {
                const firstImg = bien.images?.[0]?.url_image;
                const sc = STATUT_CONFIG[bien.statut] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
                const tc = TYPE_CONFIG[bien.type_bien] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
                return (
                  <div key={bien.id_bien} className="rh" style={{ display: "grid", gridTemplateColumns: GRID, gap: 6, padding: "12px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none", minWidth: MIN_W }}>

                    {/* # */}
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#c4bfb8", fontWeight: 700 }}>
                      #{String(bien.id_bien).padStart(3,"0")}
                    </div>

                    {/* Photo + Titre */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", overflow: "hidden" }}>
                      <div style={{ width: 36, height: 30, borderRadius: 8, overflow: "hidden", background: "#f8f7f4", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                        {firstImg
                          ? <img src={`${IMG_BASE}${firstImg}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#c4bfb8" }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                            </div>
                        }
                      </div>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 13, fontWeight: 700, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bien.titre}</p>
                    </div>

                    {/* Type */}
                    <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.6px", color: tc.color, background: tc.bg, border: `1px solid ${tc.border}`, whiteSpace: "nowrap" }}>
                      {bien.type_bien || "—"}
                    </span>

                    {/* Prix */}
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                      {fmt(bien.prix)}
                    </div>

                    {/* Surface */}
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280" }}>{bien.surface} m²</div>

                    {/* Pièces */}
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280", textAlign: "center" }}>{bien.nb_pieces}</div>

                    {/* Adresse */}
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {bien.adresse || <span style={{ color: "#c4bfb8" }}>—</span>}
                    </div>

                    {/* Statut dropdown */}
                    <select value={bien.statut} onChange={e => handleStatut(bien.id_bien, e.target.value)}
                      style={{ padding: "4px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.5px", border: `1px solid ${sc.border}`, background: sc.bg, color: sc.color, cursor: "pointer", outline: "none", maxWidth: "100%" }}>
                      {STATUTS.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>

                    {/* Vendeur */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                      {bien.vendeur ? (
                        <>
                          <Avatar nom={bien.vendeur.nom} prenom={bien.vendeur.prenom} size={24} />
                          <div style={{ overflow: "hidden" }}>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#0f1e35", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bien.vendeur.prenom} {bien.vendeur.nom}</p>
                            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 9, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bien.vendeur.email}</p>
                          </div>
                        </>
                      ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8" }}>—</span>}
                    </div>

                    {/* Photos */}
                    <button onClick={() => setShowImages(bien)}
                      style={{ padding: "5px 10px", borderRadius: 99, background: "rgba(15,30,53,0.06)", border: "1px solid rgba(15,30,53,0.15)", color: "#0f1e35", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all .2s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#0f1e35"; e.currentTarget.style.color = "#c8a96e"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,30,53,0.06)"; e.currentTarget.style.color = "#0f1e35"; }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      {bien.images?.length || 0}
                    </button>

                    {/* Supprimer */}
                    <button onClick={() => handleDelete(bien.id_bien)}
                      style={{ padding: "5px 10px", borderRadius: 99, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 3, transition: "all .2s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#991b1b"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "#991b1b"; }}
                    >
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      Suppr.
                    </button>

                  </div>
                );
              })
            )}
          </div>
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
          {filtered.length} bien{filtered.length !== 1 ? "s" : ""}{filtered.length !== biens.length ? ` sur ${biens.length}` : ""}
        </p>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>

      {/* ── MODAL IMAGES ── */}
      {showImages && (
        <div onClick={() => setShowImages(null)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflow: "hidden", boxShadow: "0 40px 100px rgba(10,20,40,0.4)", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)", display: "flex", flexDirection: "column" }}>

            {/* Modal header */}
            <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", left: 30, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
              <div style={{ paddingLeft: 20 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Galerie photos</span>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "white" }}>{showImages.titre}</h2>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.6px", background: showImages.type_bien === "vente" ? "rgba(15,30,53,0.4)" : "rgba(200,169,110,0.2)", color: showImages.type_bien === "vente" ? "#c8a96e" : "#c8a96e", border: "1px solid rgba(200,169,110,0.3)" }}>
                  {showImages.type_bien}
                </span>
              </div>
              <button onClick={() => setShowImages(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "24px 28px", overflowY: "auto" }}>
              {!showImages.images?.length ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#0f1e35", margin: "0 0 4px", fontWeight: 700 }}>Aucune photo</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Ce bien ne possède pas encore de photos</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {showImages.images.map(img => (
                    <div key={img.id_image} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(200,169,110,0.15)", boxShadow: "0 2px 12px rgba(10,20,40,0.08)" }}>
                      <img src={`${IMG_BASE}${img.url_image}`} alt={img.description || ''} style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }} onError={e => { e.target.style.display = "none"; }} />
                      {img.description && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#9ca3af", padding: "6px 10px", margin: 0, textAlign: "center", background: "#fdfcfa" }}>{img.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: "right", marginTop: 20 }}>
                <button onClick={() => setShowImages(null)}
                  style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", background: "white", color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}