import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const Ico = {
  Heart: ({ filled, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#c8a96e" : "none"} stroke={filled ? "#c8a96e" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    </svg>
  ),
  Pin: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Ruler: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/>
      <path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/>
    </svg>
  ),
  Door: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/>
      <path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.069.998L3 20.562a2 2 0 0 1-1-3.562V5a2 2 0 0 1 2-2h9z"/>
    </svg>
  ),
  Tag: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>
    </svg>
  ),
  Key: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
  ),
  Home: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  Check: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Loader: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

export default function MesFavoris() {
  const [favoris,  setFavoris]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [removing, setRemoving] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/favoris");
      setFavoris(data.filter(f => f.id_user === user.id_user));
    } catch {}
    setLoading(false);
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const removeFavori = async (e, id_favori) => {
    e.stopPropagation();
    setRemoving(p => ({ ...p, [id_favori]: true }));
    try {
      await axios.delete(`/favoris/${id_favori}`);
      setFavoris(p => p.filter(f => f.id_favori !== id_favori));
    } catch {}
    setRemoving(p => ({ ...p, [id_favori]: false }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        .fav-card { transition: transform 0.22s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.22s; cursor: pointer; }
        .fav-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(10,20,40,0.13) !important; }
        .fav-card:hover .fav-img { transform: scale(1.06); }
        .fav-img { transition: transform 0.5s ease; }
        .fav-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#c8a96e,#e8c98e,#c8a96e); transform:scaleX(0); transform-origin:left; transition:transform 0.3s ease; }
        .fav-card:hover::after { transform:scaleX(1); }
        .rem-btn { transition: all 0.15s; }
        .rem-btn:hover { background: #fff0f0 !important; color: #ef4444 !important; transform: scale(1.1); }
        .browse-btn { transition: all 0.2s; }
        .browse-btn:hover { background: #0a1428 !important; transform: translateY(-2px); }
        .voir-btn { transition: all 0.2s; }
        .voir-btn:hover { background: #b8955a !important; }
      `}</style>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 32px", animation: "fadeUp 0.4s ease" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36, paddingBottom: 28, borderBottom: "1px solid #e5e1d8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 2, background: "#c8a96e" }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: "2px", textTransform: "uppercase" }}>
              Espace Client
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, color: "#0f1e35", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                Mes Favoris
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#9ca3af" }}>
                Les biens immobiliers que vous avez sauvegardés
              </p>
            </div>
            {!loading && favoris.length > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 4,
                background: "white", border: "1px solid #e5e1d8",
                boxShadow: "0 2px 8px rgba(10,20,40,0.06)",
              }}>
                <Ico.Heart filled size={18} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>
                  {favoris.length} bien{favoris.length > 1 ? "s" : ""} sauvegardé{favoris.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <Ico.Loader />
            <p style={{ color: "#9ca3af", fontWeight: 600, marginTop: 16 }}>Chargement de vos favoris...</p>
          </div>
        )}

        {/* ── Vide ── */}
        {!loading && favoris.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "white", borderRadius: 4,
            boxShadow: "0 4px 24px rgba(10,20,40,0.08)",
            border: "1px solid #f0ede8",
          }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fafaf8", border: "1px solid #f0ede8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#d4c9b0" }}>
              <Ico.Heart filled={false} size={32} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", margin: "0 0 10px", fontSize: 26, fontWeight: 700, color: "#0f1e35" }}>
              Aucun favori pour l'instant
            </h2>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              Parcourez les biens et cliquez sur le bouton favori pour les sauvegarder ici.
            </p>
            <button className="browse-btn" onClick={() => navigate("/")} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 28px", borderRadius: 4, border: "none",
              background: "#0f1e35", color: "white",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              letterSpacing: "0.3px",
            }}>
              <Ico.Home /> Parcourir les biens
            </button>
          </div>
        )}

        {/* ── Grille favoris ── */}
        {!loading && favoris.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {favoris.map((fav, idx) => {
              const bien  = fav.bien;
              const img   = bien?.images?.[0]?.url_image;
              const isVente = bien?.type_bien === "vente";
              const isDisponible = bien?.statut === "disponible";

              return (
                <div key={fav.id_favori} className="fav-card"
                  onClick={() => navigate(`/biens/${bien?.id_bien}`)}
                  style={{
                    background: "white", borderRadius: 4, overflow: "hidden",
                    boxShadow: "0 2px 16px rgba(10,20,40,0.07)",
                    position: "relative",
                    animation: `fadeUp 0.4s ease ${idx * 0.06}s both`,
                  }}>

                  {/* ── Image ── */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden", background: "#f0ede8" }}>
                    {img
                      ? <img className="fav-img" src={`http://127.0.0.1:8000/storage/${img}`} alt={bien?.titre}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => e.target.style.display = "none"}
                        />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#d4c9b0" }}>
                          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        </div>
                    }

                    {/* Overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,30,0.6) 0%, transparent 50%)" }} />

                    {/* Badge type */}
                    <div style={{
                      position: "absolute", top: 7, left: 9,
                      background: isVente ? "#0f1e35" : "#0f1e35",
                      color: "#c8a96e", padding: "5px 12px",
                      fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      display: "inline-flex", alignItems: "center", gap: 5,
                       borderRadius: 8
                    }}>
                      {isVente ? <Ico.Tag /> : <Ico.Key />}
                      {isVente ? "Vente" : "Location"}
                    </div>

                    {/* Bouton retirer favori */}
                    <button className="rem-btn"
                      onClick={e => removeFavori(e, fav.id_favori)}
                      disabled={removing[fav.id_favori]}
                      title="Retirer des favoris"
                      style={{
                        position: "absolute", top: 0, right: 0,
                        width: 40, height: 32, border: "none",
                        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", color: "#c8a96e",
                      }}>
                      {removing[fav.id_favori]
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin .8s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        : <Ico.Trash />
                      }
                    </button>

                    {/* Prix */}
                    <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                      <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, color: "white", fontSize: 22, lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                        {fmt(bien?.prix)}
                      </p>
                      {!isVente && <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>/mois</span>}
                    </div>

                    {/* Date ajout */}
                    {fav.date_ajout && (
                      <div style={{
                        position: "absolute", bottom: 12, right: 12,
                        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                        color: "white", borderRadius: 20, padding: "3px 10px",
                        fontSize: 10, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Ico.Calendar />
                        {new Date(fav.date_ajout).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </div>
                    )}
                  </div>

                  {/* ── Contenu ── */}
                  <div style={{ padding: "18px 20px 20px" }}>

                    {/* Titre */}
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                      {bien?.titre || "—"}
                    </h3>

                    {/* Adresse */}
                    {bien?.adresse && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 12, color: "#9ca3af" }}>
                        <Ico.Pin />
                        <span style={{ fontSize: 12 }}>{bien.adresse}</span>
                      </div>
                    )}

                    {/* Ligne dorée */}
                    <div style={{ height: 1, background: "linear-gradient(90deg,#e8c98e,transparent)", marginBottom: 14 }} />

                    {/* Specs */}
                    <div style={{ display: "flex", gap: 0, background: "#fafaf8", border: "1px solid #f0ede8", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                      {[
                        { icon: <Ico.Ruler />, val: `${bien?.surface} m²`,         lbl: "Surface" },
                        { icon: <Ico.Door />,  val: `${bien?.nb_pieces} pièces`,   lbl: "Pièces" },
                      ].map((s, i) => (
                        <div key={i} style={{ flex: 1, padding: "10px 8px", textAlign: "center", borderRight: i === 0 ? "1px solid #f0ede8" : "none" }}>
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: "#c8a96e" }}>{s.icon}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1e35" }}>{s.val}</div>
                          <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: 1 }}>{s.lbl}</div>
                        </div>
                      ))}
                      {/* Statut */}
                      <div style={{ flex: 1, padding: "10px 8px", textAlign: "center", borderLeft: "1px solid #f0ede8" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 4, color: isDisponible ? "#059669" : "#dc2626" }}>
                          {isDisponible ? <Ico.Check /> : <Ico.X />}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isDisponible ? "#059669" : "#dc2626" }}>
                          {isDisponible ? "Disponible" : "Indisponible"}
                        </div>
                        <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.6px", textTransform: "uppercase", marginTop: 1 }}>Statut</div>
                      </div>
                    </div>

                    {/* CTA */}
                    <button className="voir-btn" style={{
                      width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
                      background: "#c8a96e", color: "Dark",
                      fontWeight: 700, fontSize: 12, cursor: "pointer",
                      letterSpacing: "1px", textTransform: "uppercase",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 4px 16px rgba(200,169,110,0.3)",
                    }}>
                      Voir le bien <Ico.Arrow />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}