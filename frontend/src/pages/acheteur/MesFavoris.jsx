import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

export default function MesFavoris() {
  const [favoris, setFavoris]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [removing, setRemoving] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/favoris");
      setFavoris(data.filter(f => f.id_user === user.id_user));
    } catch {}
    setLoading(false);
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const removeFavori = async (e, id_favori) => {
    e.stopPropagation();
    setRemoving(p => ({ ...p, [id_favori]: true }));
    try {
      await axiosInstance.delete(`/favoris/${id_favori}`);
      setFavoris(p => p.filter(f => f.id_favori !== id_favori));
    } catch {}
    setRemoving(p => ({ ...p, [id_favori]: false }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartOut { 0%{transform:scale(1)} 50%{transform:scale(0.7)} 100%{transform:scale(1)} }
        .fav-card { transition: transform 0.18s, box-shadow 0.18s; }
        .fav-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.12) !important; }
        .rem-btn { transition: all 0.15s; }
        .rem-btn:hover { transform: scale(1.1); background: #fee2e2 !important; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#ef4444", letterSpacing: ".14em" }}>ESPACE ACHETEUR</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>
            ❤️ Mes Favoris
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>
            Les biens immobiliers que vous avez sauvegardés
          </p>
        </div>

        {/* Stat */}
        {!loading && (
          <div style={{ marginBottom: 24 }}>
            <span style={{
              background: favoris.length > 0 ? "#fff0f0" : "#F8FAFF",
              color: favoris.length > 0 ? "#ef4444" : "#94A3B8",
              border: `1px solid ${favoris.length > 0 ? "#fecaca" : "#E2E8F0"}`,
              borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 700,
            }}>
              {favoris.length > 0 ? `❤️ ${favoris.length} bien${favoris.length > 1 ? "s" : ""} sauvegardé${favoris.length > 1 ? "s" : ""}` : "Aucun favori pour l'instant"}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94A3B8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <p style={{ fontWeight: 600 }}>Chargement de vos favoris…</p>
          </div>
        )}

        {/* Vide */}
        {!loading && favoris.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "#fff", borderRadius: 24, boxShadow: "0 2px 16px rgba(15,23,42,.07)"
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🤍</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: "#0F172A" }}>
              Aucun favori pour l'instant
            </h2>
            <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
              Cliquez sur le ❤️ sur un bien pour l'ajouter ici
            </p>
            <button onClick={() => navigate("/")} style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg,#4F46E5,#0891B2)",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              boxShadow: "0 4px 18px rgba(79,70,229,.3)",
            }}>
              🏠 Parcourir les biens
            </button>
          </div>
        )}

        {/* Grille favoris */}
        {!loading && favoris.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {favoris.map((fav) => {
              const bien = fav.bien;
              const img  = bien?.images?.[0]?.url_image;
              return (
                <div key={fav.id_favori} className="fav-card"
                  onClick={() => navigate(`/biens/${bien?.id_bien}`)}
                  style={{
                    background: "#fff", borderRadius: 18, overflow: "hidden",
                    cursor: "pointer", boxShadow: "0 2px 16px rgba(15,23,42,.08)",
                  }}>

                  {/* Image */}
                  <div style={{ position: "relative", height: 200 }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt={bien?.titre}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", background: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: "#CBD5E1" }}>🏠</div>
                    }

                    {/* Badge type */}
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: bien?.type_bien === "vente" ? "rgba(15,23,42,0.85)" : "rgba(79,70,229,0.9)",
                      color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    }}>
                      {bien?.type_bien === "vente" ? "🏠 Vente" : "🔑 Location"}
                    </span>

                    {/* Bouton supprimer favori */}
                    <button
                      className="rem-btn"
                      onClick={(e) => removeFavori(e, fav.id_favori)}
                      disabled={removing[fav.id_favori]}
                      title="Retirer des favoris"
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 36, height: 36, borderRadius: "50%", border: "none",
                        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}>
                      {removing[fav.id_favori] ? "⏳" : "❤️"}
                    </button>

                    {/* Date ajout */}
                    <div style={{
                      position: "absolute", bottom: 8, right: 8,
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      color: "#fff", borderRadius: 12, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                    }}>
                      Ajouté le {new Date(fav.date_ajout).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ padding: "16px 18px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, color: "#0F172A",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {bien?.titre || "—"}
                    </h3>
                    {bien?.adresse && (
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94A3B8" }}>📍 {bien.adresse}</p>
                    )}
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                      <span>📐 {bien?.surface} m²</span>
                      <span>🚪 {bien?.nb_pieces} pièces</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#4F46E5" }}>
                        {fmt(bien?.prix)}
                        {bien?.type_bien === "location" && <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>/mois</span>}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                        background: bien?.statut === "disponible" ? "#ECFDF5" : "#FEF2F2",
                        color: bien?.statut === "disponible" ? "#059669" : "#DC2626",
                      }}>
                        {bien?.statut === "disponible" ? "✅ Disponible" : "❌ Indisponible"}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "0 18px 16px" }}>
                    <div style={{
                      width: "100%", padding: "10px 0", borderRadius: 10, textAlign: "center",
                      background: "linear-gradient(135deg,#4F46E5,#0891B2)",
                      color: "#fff", fontWeight: 700, fontSize: 13,
                    }}>
                      Voir le bien →
                    </div>
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