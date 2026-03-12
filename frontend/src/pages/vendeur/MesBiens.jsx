import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const STATUT_STYLE = {
  disponible: { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e", label: "Disponible" },
  vendu:      { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444", label: "Vendu"      },
  loue:       { bg: "#dbeafe", color: "#2563eb", dot: "#3b82f6", label: "Loué"       },
};

export default function MesBiens() {
  const [biens, setBiens]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const [filtreType, setFiltreType]     = useState("tous");
  const [recherche, setRecherche]       = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification]   = useState(null);

  // ── Charger les biens depuis l'API ────────────────────────
  useEffect(() => {
    const user  = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    fetch("http://127.0.0.1:8000/api/biens", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filtrer seulement les biens du vendeur connecté
        const mesBiens = data.filter((b) => b.id_vendeur === user?.id_user);
        setBiens(mesBiens);
      })
      .catch((err) => console.error("Erreur:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Suppression via API ───────────────────────────────────
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://127.0.0.1:8000/api/biens/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      setBiens((p) => p.filter((b) => b.id_bien !== id));
      setConfirmDelete(null);
      setNotification("Bien supprimé avec succès !");
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  // ── Filtrage ──────────────────────────────────────────────
  const biensFiltres = biens.filter((b) => {
    const okStatut = filtreStatut === "tous" || b.statut === filtreStatut;
    const okType   = filtreType   === "tous" || b.type_bien === filtreType;
    const okSearch =
      b.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
      b.ville?.toLowerCase().includes(recherche.toLowerCase());
    return okStatut && okType && okSearch;
  });

  // ── Image du bien ─────────────────────────────────────────
  const getImage = (bien) => {
    if (bien.images && bien.images.length > 0) {
      return `http://127.0.0.1:8000/storage/${bien.images[0].url_image}`;
    }
    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', sans-serif", paddingLeft: 260 }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {notification && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          background: "#16a34a", color: "#fff",
          padding: "14px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          animation: "slideIn 0.3s ease",
        }}>
          ✅ {notification}
        </div>
      )}

      <main style={{ padding: "36px 40px", maxWidth: 1200 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Mes Biens
            </h1>
            <p style={{ color: "#64748b", fontSize: 15, margin: "6px 0 0" }}>
              Gérez tous vos biens immobiliers publiés
            </p>
          </div>
          <Link to="/vendeur/ajouter-bien" style={{
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            color: "#fff", padding: "13px 26px", borderRadius: 14,
            textDecoration: "none", fontWeight: 600, fontSize: 14,
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 18px rgba(245,158,11,0.4)",
          }}>
            <span style={{ fontSize: 20 }}>＋</span> Ajouter un bien
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 32 }}>
          {[
            { label: "Total biens",  value: biens.length,                                          icon: "🏠", accent: "#6366f1" },
            { label: "Disponibles",  value: biens.filter((b) => b.statut === "disponible").length, icon: "✅", accent: "#16a34a" },
            { label: "Vendus",       value: biens.filter((b) => b.statut === "vendu").length,      icon: "🔑", accent: "#ef4444" },
            { label: "Loués",        value: biens.filter((b) => b.statut === "loue").length,       icon: "📋", accent: "#3b82f6" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "22px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", gap: 16,
              borderLeft: `4px solid ${s.accent}`,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: s.accent + "18",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "18px 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 28,
          display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center",
        }}>
          <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
            <input type="text" placeholder="Rechercher par titre ou ville..."
              value={recherche} onChange={(e) => setRecherche(e.target.value)}
              style={{
                width: "100%", padding: "10px 16px 10px 40px", borderRadius: 10,
                border: "1.5px solid #e2e8f0", fontSize: 14, color: "#0f172a",
                outline: "none", fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box", background: "#fafafa",
              }} />
          </div>
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} style={{
            padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            fontSize: 14, color: "#0f172a", outline: "none",
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer", background: "#fafafa",
          }}>
            <option value="tous">Tous les statuts</option>
            <option value="disponible">Disponible</option>
            <option value="vendu">Vendu</option>
            <option value="loue">Loué</option>
          </select>
          <select value={filtreType} onChange={(e) => setFiltreType(e.target.value)} style={{
            padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0",
            fontSize: 14, color: "#0f172a", outline: "none",
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer", background: "#fafafa",
          }}>
            <option value="tous">Tous les types</option>
            <option value="vente">Vente</option>
            <option value="location">Location</option>
          </select>
          <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: "auto" }}>
            {biensFiltres.length} résultat{biensFiltres.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: "#64748b", fontSize: 15, fontWeight: 600 }}>Chargement de vos biens...</p>
          </div>
        )}

        {/* Grille */}
        {!loading && biensFiltres.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "80px 40px",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🏚️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a", margin: "0 0 8px" }}>
              Aucun bien trouvé
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Ajoutez votre premier bien en cliquant sur "Ajouter un bien".
            </p>
          </div>
        )}

        {!loading && biensFiltres.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 }}>
            {biensFiltres.map((bien) => {
              const s = STATUT_STYLE[bien.statut] || STATUT_STYLE.disponible;
              return (
                <div key={bien.id_bien} style={{
                  background: "#fff", borderRadius: 20, overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                  transition: "transform 0.25s, box-shadow 0.25s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.13)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.07)"; }}
                >
                  {/* Image */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                    <img src={getImage(bien)} alt={bien.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      onMouseEnter={(e) => (e.target.style.transform = "scale(1.06)")}
                      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                      onError={(e) => (e.target.src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80")}
                    />
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: bien.type_bien === "vente" ? "#0f172a" : "#6366f1",
                      color: "#fff", padding: "5px 13px", borderRadius: 20,
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px",
                    }}>
                      {bien.type_bien}
                    </div>
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: s.bg, color: s.color,
                      padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                      {s.label}
                    </div>
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
                      background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
                    }} />
                  </div>

                  {/* Contenu */}
                  <div style={{ padding: "20px 22px 22px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 5px", lineHeight: 1.3 }}>
                      {bien.titre}
                    </h3>
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 14px" }}>
                      📍 {bien.ville || "—"}
                    </p>
                    <div style={{ display: "flex", gap: 18, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>📐 {bien.surface} m²</span>
                      <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>🚪 {bien.nb_pieces} pièces</span>
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b", fontFamily: "'Playfair Display', serif" }}>
                        {Number(bien.prix).toLocaleString("fr-MA")}
                      </span>
                      <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 4 }}>
                        MAD{bien.type_bien === "location" ? " /mois" : ""}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link to={`/vendeur/modifier-bien/${bien.id_bien}`} style={{
                        flex: 1, background: "#f1f5f9", color: "#475569",
                        padding: "10px 0", borderRadius: 11, textDecoration: "none",
                        fontSize: 13, fontWeight: 600, textAlign: "center",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                      >
                        ✏️ Modifier
                      </Link>
                      <button onClick={() => setConfirmDelete(bien)} style={{
                        flex: 1, background: "#fee2e2", color: "#dc2626",
                        padding: "10px 0", borderRadius: 11, border: "none",
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif",
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal suppression */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(null)} style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 999,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 24, padding: "40px 44px",
            maxWidth: 420, width: "90%", textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>🗑️</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0f172a", margin: "0 0 10px" }}>Supprimer ce bien ?</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 6px" }}>Vous êtes sur le point de supprimer :</p>
            <p style={{ color: "#0f172a", fontWeight: 700, fontSize: 15, margin: "0 0 12px", fontFamily: "'Playfair Display', serif" }}>« {confirmDelete.titre} »</p>
            <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 28px" }}>⚠️ Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{
                flex: 1, padding: "12px 0", borderRadius: 12, border: "1.5px solid #e2e8f0",
                background: "#fff", color: "#475569", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >Annuler</button>
              <button onClick={() => handleDelete(confirmDelete.id_bien)} style={{
                flex: 1, padding: "12px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >Supprimer</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(80px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}