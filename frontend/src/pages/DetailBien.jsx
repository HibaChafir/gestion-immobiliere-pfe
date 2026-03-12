import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";

export default function DetailBien() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bien, setBien]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");
  const [isFav, setIsFav]     = useState(false);
  const [favId, setFavId]     = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const token   = localStorage.getItem("token");
  const isClient  = token && user?.id_role === 3;
  const isVendeur = token && user?.id_role === 2;

  useEffect(() => {
    axiosInstance.get(`/biens/${id}`)
      .then((res) => setBien(res.data))
      .catch(() => setError("Bien introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  // Charger l'état favori
  useEffect(() => {
    if (!isClient) return;
    axiosInstance.get('/favoris')
      .then(res => {
        const fav = res.data.find(f => f.id_bien === parseInt(id) && f.id_user === user.id_user)
        if (fav) { setIsFav(true); setFavId(fav.id_favori); }
      })
      .catch(() => {})
  }, [id, isClient])

  const toggleFavori = async () => {
    if (!isClient) { navigate("/login"); return; }
    setFavLoading(true);
    try {
      if (isFav) {
        await axiosInstance.delete(`/favoris/${favId}`);
        setIsFav(false); setFavId(null);
      } else {
        const { data } = await axiosInstance.post('/favoris', { id_bien: parseInt(id), id_user: user.id_user });
        setIsFav(true); setFavId(data.id_favori);
      }
    } catch {}
    setFavLoading(false);
  };

  const handleDemande = async () => {
    if (!token) { navigate("/login"); return; }
    setSending(true); setError(""); setSuccess("");
    try {
      await axiosInstance.post("/contacts", {
        id_bien:   parseInt(id),
        id_client: user.id_user,
        message,
      });
      setSuccess("Votre demande a été envoyée au vendeur !");
      setMessage("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi.");
    } finally { setSending(false); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat("fr-MA", {
      style: "currency", currency: "MAD", maximumFractionDigits: 0,
    }).format(n || 0);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
        <p style={{ color: "#64748b", fontWeight: 600, fontSize: 16 }}>Chargement du bien...</p>
      </div>
    </div>
  );

  if (!bien) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏚️</div>
        <p style={{ color: "#ef4444", fontWeight: 600, fontSize: 16 }}>Bien introuvable.</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          ← Retour
        </button>
      </div>
    </div>
  );

  const images = bien.images || [];
  const fallback = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";
  const imgUrl = (img) => `http://127.0.0.1:8000/storage/${img.url_image}`;

  const statutColor = {
    disponible: { bg: "#dcfce7", color: "#16a34a", dot: "#22c55e" },
    vendu:      { bg: "#fee2e2", color: "#dc2626", dot: "#ef4444" },
    loue:       { bg: "#dbeafe", color: "#2563eb", dot: "#3b82f6" },
  }[bien.statut] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes heartPop { 0%{transform:scale(1)} 50%{transform:scale(1.35)} 100%{transform:scale(1)} }
        .thumb:hover { opacity: 0.85; transform: scale(1.04); }
        .thumb { transition: all 0.15s; }
        .btn-interest:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-interest { transition: all 0.2s; }
        .arrow-btn:hover { background: rgba(0,0,0,0.75) !important; }
        .arrow-btn { transition: background 0.15s; }
        .heart-btn { transition: all 0.18s; }
        .heart-btn:hover { transform: scale(1.12); }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", animation: "fadeUp 0.4s ease" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#94a3b8" }}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer", color: "#4F46E5", fontWeight: 600 }}>Accueil</span>
          <span>›</span>
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer", color: "#4F46E5", fontWeight: 600 }}>Biens</span>
          <span>›</span>
          <span style={{ color: "#0f172a", fontWeight: 600 }}>{bien.titre}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28, alignItems: "start" }}>

          {/* ── Colonne gauche ── */}
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Galerie */}
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 40px rgba(15,23,42,0.12)", marginBottom: 24 }}>
              <div style={{ position: "relative", height: 460, background: "#e2e8f0", overflow: "hidden" }}>
                <img
                  key={imgIndex}
                  src={images.length > 0 ? imgUrl(images[imgIndex]) : fallback}
                  alt={bien.titre}
                  style={{ width: "100%", height: "100%", objectFit: "cover", animation: "fadeIn 0.3s ease" }}
                  onError={(e) => (e.target.src = fallback)}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)" }} />

                {/* Badge type */}
                <div style={{
                  position: "absolute", top: 20, left: 20,
                  background: bien.type_bien === "vente" ? "rgba(15,23,42,0.85)" : "rgba(79,70,229,0.9)",
                  backdropFilter: "blur(8px)",
                  color: "#fff", padding: "7px 18px", borderRadius: 24,
                  fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase",
                }}>{bien.type_bien === "vente" ? "🏠 À vendre" : "🔑 À louer"}</div>

                {/* Badge statut */}
                <div style={{
                  position: "absolute", top: 20, right: 70,
                  background: statutColor.bg, color: statutColor.color,
                  padding: "7px 18px", borderRadius: 24, fontSize: 12, fontWeight: 800,
                  display: "flex", alignItems: "center", gap: 6, backdropFilter: "blur(8px)",
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statutColor.dot, display: "inline-block" }} />
                  {bien.statut.charAt(0).toUpperCase() + bien.statut.slice(1)}
                </div>



                {/* Flèches */}
                {images.length > 1 && (
                  <>
                    <button className="arrow-btn" onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)} style={{
                      position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      color: "#fff", border: "none", borderRadius: "50%",
                      width: 46, height: 46, cursor: "pointer", fontSize: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>‹</button>
                    <button className="arrow-btn" onClick={() => setImgIndex((i) => (i + 1) % images.length)} style={{
                      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      color: "#fff", border: "none", borderRadius: "50%",
                      width: 46, height: 46, cursor: "pointer", fontSize: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>›</button>
                    <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                      {images.map((_, i) => (
                        <div key={i} onClick={() => setImgIndex(i)} style={{
                          width: imgIndex === i ? 24 : 8, height: 8, borderRadius: 4,
                          background: imgIndex === i ? "#fff" : "rgba(255,255,255,0.5)",
                          cursor: "pointer", transition: "all 0.2s",
                        }} />
                      ))}
                    </div>
                    <div style={{
                      position: "absolute", bottom: 16, right: 16,
                      background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
                      color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700,
                    }}>📷 {imgIndex + 1} / {images.length}</div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div style={{ display: "flex", gap: 8, padding: "14px 18px", overflowX: "auto", background: "#fafafa", borderTop: "1px solid #f1f5f9" }}>
                  {images.map((img, i) => (
                    <div key={img.id_image} className="thumb" onClick={() => setImgIndex(i)} style={{
                      width: 80, height: 60, borderRadius: 10, overflow: "hidden",
                      cursor: "pointer", flexShrink: 0,
                      border: `3px solid ${imgIndex === i ? "#4F46E5" : "transparent"}`,
                      boxShadow: imgIndex === i ? "0 0 0 2px rgba(79,70,229,0.2)" : "none",
                    }}>
                      <img src={imgUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => (e.target.src = fallback)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div style={{ background: "#fff", borderRadius: 24, padding: "32px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
                    {bien.titre}
                  </h1>
                  {bien.adresse && (
                    <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>📍 {bien.adresse}</p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#4F46E5", whiteSpace: "nowrap" }}>
                    {fmt(bien.prix)}
                    {bien.type_bien === "location" && <span style={{ fontSize: 14, color: "#94a3b8", fontFamily: "inherit" }}>/mois</span>}
                  </div>

                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { icon: "📐", label: "Surface",  value: `${bien.surface} m²` },
                  { icon: "🚪", label: "Pièces",   value: `${bien.nb_pieces} pièces` },
                  { icon: "🏷️", label: "Type",     value: bien.type_bien === "vente" ? "Vente" : "Location" },
                  { icon: "📊", label: "Statut",   value: bien.statut },
                ].map((info) => (
                  <div key={info.label} style={{
                    background: "#f8faff", borderRadius: 14, padding: "16px",
                    textAlign: "center", border: "1px solid #e2e8f0",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{info.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{info.value}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{info.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0f172a", margin: "0 0 12px" }}>Description</h3>
                <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                  {bien.description || "Aucune description disponible."}
                </p>
              </div>
            </div>

            {/* Équipements */}
            {(bien.garage || bien.piscine || bien.jardin || bien.meuble) && (
              <div style={{ background: "#fff", borderRadius: 24, padding: "24px 36px", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: "#0f172a", margin: "0 0 16px" }}>Équipements</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {bien.garage  && <span style={eqStyle}>🚗 Garage</span>}
                  {bien.piscine && <span style={eqStyle}>🏊 Piscine</span>}
                  {bien.jardin  && <span style={eqStyle}>🌿 Jardin</span>}
                  {bien.meuble  && <span style={eqStyle}>🛋️ Meublé</span>}
                </div>
              </div>
            )}
          </div>

          {/* ── Colonne droite ── */}
          <div style={{ position: "sticky", top: 80, animation: "fadeUp 0.5s ease" }}>
            <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 40px rgba(15,23,42,0.12)" }}>
              <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", padding: "24px 28px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                  {bien.type_bien === "location" ? "LOYER MENSUEL" : "PRIX DE VENTE"}
                </p>
                <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 34, fontWeight: 700, color: "#fff" }}>
                  {fmt(bien.prix)}
                  {bien.type_bien === "location" && <span style={{ fontSize: 14, opacity: 0.6 }}> /mois</span>}
                </p>
              </div>

              <div style={{ padding: "24px 28px" }}>
                {bien.vendeur && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "16px", borderRadius: 14,
                    background: "#f8faff", border: "1px solid #e2e8f0", marginBottom: 20,
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F46E5, #0891B2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0,
                    }}>
                      {bien.vendeur.prenom?.[0]}{bien.vendeur.nom?.[0]}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                        {bien.vendeur.prenom} {bien.vendeur.nom}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Propriétaire</p>
                      {bien.vendeur.telephone && (
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4F46E5", fontWeight: 600 }}>
                          📞 {bien.vendeur.telephone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!token && (
                  <button onClick={() => navigate("/login")} style={{
                    width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg, #2563eb, #4F46E5)",
                    color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(79,70,229,0.35)", marginBottom: 12,
                  }}>🔐 Connectez-vous pour contacter</button>
                )}

                {isVendeur && (
                  <div style={{ background: "#fef3c7", borderRadius: 14, padding: "16px", fontSize: 13, color: "#92400e", fontWeight: 600, textAlign: "center", border: "1px solid #fde68a" }}>
                    👤 Vous êtes vendeur — vous ne pouvez pas faire une demande
                  </div>
                )}

                {isClient && bien.statut !== "disponible" && (
                  <div style={{ background: "#fee2e2", borderRadius: 14, padding: "16px", fontSize: 13, color: "#dc2626", fontWeight: 600, textAlign: "center", border: "1px solid #fecaca" }}>
                    ❌ Ce bien n'est plus disponible
                  </div>
                )}

                {isClient && bien.statut === "disponible" && (
                  <div>
                    {success && (
                      <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 12, padding: "12px 16px", color: "#16a34a", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                        ✅ {success}
                      </div>
                    )}
                    {error && (
                      <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", color: "#dc2626", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                        ⚠️ {error}
                      </div>
                    )}
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Message au vendeur (optionnel)..."
                      rows={3}
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 12,
                        border: "1.5px solid #e2e8f0", fontSize: 13, color: "#0f172a",
                        outline: "none", resize: "vertical", fontFamily: "inherit",
                        boxSizing: "border-box", marginBottom: 12, background: "#fafafa", lineHeight: 1.6,
                      }}
                    />
                    <button onClick={handleDemande} disabled={sending} style={{
                      width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                      background: sending ? "#94a3b8" : "linear-gradient(135deg, #059669, #16a34a)",
                      color: "#fff", fontSize: 15, fontWeight: 700,
                      cursor: sending ? "not-allowed" : "pointer",
                      boxShadow: sending ? "none" : "0 4px 20px rgba(5,150,105,0.35)",
                    }}>
                      {sending ? "⏳ Envoi en cours..." : "🤝 Je suis intéressé"}
                    </button>
                  </div>
                )}

                {/* Bouton favori dans la sidebar */}
                {isClient && (
                  <button
                    className="heart-btn"
                    onClick={toggleFavori}
                    disabled={favLoading}
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 14,
                      border: `1.5px solid ${isFav ? "#ef4444" : "#e2e8f0"}`,
                      background: isFav ? "#fff0f0" : "#f8faff",
                      color: isFav ? "#ef4444" : "#64748b",
                      fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 12,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}>
                    {favLoading ? "⏳" : isFav ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
                  </button>
                )}
              </div>
            </div>

            <div style={{
              marginTop: 16, background: "#f0fdf4", borderRadius: 16,
              padding: "16px 20px", border: "1px solid #bbf7d0",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#065f46" }}>Transaction sécurisée</p>
                <p style={{ margin: 0, fontSize: 12, color: "#047857", lineHeight: 1.5 }}>
                  Vos données sont protégées. Le vendeur sera notifié de votre demande.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const eqStyle = {
  background: "#f1f5f9", color: "#475569",
  padding: "10px 18px", borderRadius: 12,
  fontSize: 13, fontWeight: 600,
  border: "1px solid #e2e8f0",
  display: "flex", alignItems: "center", gap: 6,
};