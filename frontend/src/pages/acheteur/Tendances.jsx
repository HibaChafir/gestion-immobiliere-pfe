import { useNavigate } from "react-router-dom";

const TENDANCES = [
  {
    id: 1, rang: 1, titre: "Appartement Vue Mer - Ain Diab",
    ville: "Casablanca", type: "vente", prix: 2800000,
    surface: 120, pieces: 4, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
    badge: "🔥 Très demandé", badgeColor: "#ef4444",
    stats: { vues: 2840, demandes: 47, jours: 3 },
    tags: ["Piscine", "Vue mer", "Parking"],
  },
  {
    id: 2, rang: 2, titre: "Villa Moderne - Souissi",
    ville: "Rabat", type: "vente", prix: 5500000,
    surface: 350, pieces: 7, img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
    badge: "⭐ Coup de cœur", badgeColor: "#f59e0b",
    stats: { vues: 1920, demandes: 31, jours: 7 },
    tags: ["Jardin", "Garage", "Meublé"],
  },
  {
    id: 3, rang: 3, titre: "Studio Meublé - Guéliz",
    ville: "Marrakech", type: "location", prix: 5500,
    surface: 45, pieces: 1, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    badge: "🆕 Nouveau", badgeColor: "#059669",
    stats: { vues: 1540, demandes: 28, jours: 1 },
    tags: ["Meublé", "Centre-ville", "Sécurisé"],
  },
  {
    id: 4, rang: 4, titre: "Appartement Standing - Maarif",
    ville: "Casablanca", type: "location", prix: 12000,
    surface: 95, pieces: 3, img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    badge: "💎 Premium", badgeColor: "#7c3aed",
    stats: { vues: 1310, demandes: 22, jours: 5 },
    tags: ["Terrasse", "Gardien", "Ascenseur"],
  },
  {
    id: 5, rang: 5, titre: "Maison avec Jardin - Hay Riad",
    ville: "Rabat", type: "vente", prix: 1950000,
    surface: 180, pieces: 5, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
    badge: "💰 Bon plan", badgeColor: "#0891b2",
    stats: { vues: 1180, demandes: 19, jours: 10 },
    tags: ["Jardin", "Calme", "Quartier résidentiel"],
  },
  {
    id: 6, rang: 6, titre: "Penthouse - Marina",
    ville: "Casablanca", type: "location", prix: 35000,
    surface: 220, pieces: 5, img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&q=80",
    badge: "👑 Luxe", badgeColor: "#d97706",
    stats: { vues: 980, demandes: 15, jours: 14 },
    tags: ["Vue panoramique", "Piscine", "Sécurité 24h"],
  },
];

const STATS_GLOBALES = [
  { icon: "👁️", label: "Vues ce mois",    value: "48 200",  color: "#4F46E5" },
  { icon: "🤝", label: "Demandes",         value: "1 240",   color: "#059669" },
  { icon: "🏠", label: "Biens disponibles",value: "380",     color: "#0891B2" },
  { icon: "📈", label: "Hausse des prix",  value: "+4.2%",   color: "#D97706" },
];

const VILLES = [
  { nom: "Casablanca", biens: 142, prixMoyen: "1.8M MAD", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Casablanca_from_above.jpg/640px-Casablanca_from_above.jpg" },
  { nom: "Rabat",      biens: 87,  prixMoyen: "1.2M MAD", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Rabat_Hassan_tower03.jpg/640px-Rabat_Hassan_tower03.jpg" },
  { nom: "Marrakech",  biens: 64,  prixMoyen: "950K MAD", img: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=400&q=80" },
  { nom: "Tanger",     biens: 51,  prixMoyen: "780K MAD", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80" },
];

const fmt = (n, type) =>
  type === "location"
    ? `${Number(n).toLocaleString("fr-MA")} MAD/mois`
    : new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n);

// Fallback si image ne charge pas
const VilleCard = ({ v }) => {
  const gradients = {
    Casablanca: "linear-gradient(135deg,#1e3a5f,#2563eb)",
    Rabat:      "linear-gradient(135deg,#065f46,#059669)",
    Marrakech:  "linear-gradient(135deg,#92400e,#d97706)",
    Tanger:     "linear-gradient(135deg,#4c1d95,#7c3aed)",
  };
  const emojis = { Casablanca: "🌊", Rabat: "🏛️", Marrakech: "🌴", Tanger: "⛵" };

  return (
    <div className="vcard" style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(15,23,42,.08)", cursor: "pointer" }}>
      <div style={{ height: 100, position: "relative", overflow: "hidden" }}>
        <img
          src={v.img}
          alt={v.nom}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        {/* Fallback dégradé CSS */}
        <div style={{
          display: "none", width: "100%", height: "100%",
          background: gradients[v.nom],
          alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 4, position: "absolute", inset: 0,
        }}>
          <span style={{ fontSize: 28 }}>{emojis[v.nom]}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.55),transparent)" }} />
        <p style={{ position: "absolute", bottom: 8, left: 10, margin: 0, fontSize: 14, fontWeight: 800, color: "#fff" }}>{v.nom}</p>
      </div>
      <div style={{ padding: "10px 12px", background: "#F8FAFF" }}>
        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "#4F46E5" }}>{v.biens} biens</p>
        <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Moy. {v.prixMoyen}</p>
      </div>
    </div>
  );
};

export default function Tendances() {
  const top3 = TENDANCES.slice(0, 3);
  const reste = TENDANCES.slice(3);

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
        @keyframes in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .tcard { transition: transform 0.18s, box-shadow 0.18s; }
        .tcard:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(15,23,42,0.14) !important; }
        .vcard { transition: transform 0.15s; }
        .vcard:hover { transform: scale(1.02); }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>MARCHÉ IMMOBILIER</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>
            📈 Tendances du marché
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>
            Les biens les plus recherchés et les nouvelles annonces populaires — données indicatives
          </p>
        </div>

        {/* Stats globales */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
          {STATS_GLOBALES.map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "20px 24px",
              boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TOP 3 podium */}
        <div style={{ background: "#fff", borderRadius: 22, padding: "28px 32px", marginBottom: 28, boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0F172A" }}>Top 3 des biens les plus demandés</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {top3.map((b, i) => (
              <div key={b.id} className="tcard" style={{
                borderRadius: 16, overflow: "hidden", cursor: "pointer",
                boxShadow: i === 0 ? "0 8px 32px rgba(245,158,11,.25)" : "0 4px 16px rgba(15,23,42,.08)",
                border: i === 0 ? "2px solid #fcd34d" : "2px solid transparent",
                position: "relative",
              }}>
                {/* Rang */}
                <div style={{
                  position: "absolute", top: 10, left: 10, zIndex: 2,
                  width: 32, height: 32, borderRadius: "50%",
                  background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "#cd7c2f",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14, color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,.2)",
                }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </div>

                <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
                  <img src={b.img} alt={b.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.5),transparent)" }} />
                  <span style={{
                    position: "absolute", bottom: 10, left: 10,
                    background: b.badgeColor, color: "#fff",
                    padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 800,
                  }}>{b.badge}</span>
                </div>

                <div style={{ padding: "12px 14px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 800, color: "#0F172A",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.titre}</p>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94A3B8" }}>📍 {b.ville}</p>
                  <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "#4F46E5" }}>{fmt(b.prix, b.type)}</p>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#64748B", marginBottom: 10 }}>
                    <span>👁️ {b.stats.vues}</span>
                    <span>🤝 {b.stats.demandes} demandes</span>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {b.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#F1F5F9", color: "#475569" }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste rang 4-6 */}
        <div style={{ background: "#fff", borderRadius: 22, overflow: "hidden", marginBottom: 28, boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📊</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Autres biens populaires</h2>
          </div>
          {reste.map((b, i) => (
            <div key={b.id} className="tcard" style={{
              display: "grid", gridTemplateColumns: "60px 80px 1fr auto",
              gap: 16, padding: "16px 24px", alignItems: "center",
              borderBottom: i < reste.length - 1 ? "1px solid #F1F5F9" : "none",
              cursor: "pointer",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, color: "#475569",
              }}>#{b.rang}</div>

              <div style={{ width: 80, height: 56, borderRadius: 10, overflow: "hidden" }}>
                <img src={b.img} alt={b.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{b.titre}</p>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 8, background: b.badgeColor + "20", color: b.badgeColor }}>
                    {b.badge}
                  </span>
                </div>
                <p style={{ margin: "0 0 5px", fontSize: 12, color: "#94A3B8" }}>📍 {b.ville} · 📐 {b.surface}m² · 🚪 {b.pieces} pièces</p>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748B" }}>
                  <span>👁️ {b.stats.vues} vues</span>
                  <span>🤝 {b.stats.demandes} demandes</span>
                  <span>📅 Ajouté il y a {b.stats.jours}j</span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#4F46E5" }}>{fmt(b.prix, b.type)}</p>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: b.type === "vente" ? "#EEF2FF" : "#ECFDF5",
                  color: b.type === "vente" ? "#4F46E5" : "#059669" }}>
                  {b.type === "vente" ? "🏠 Vente" : "🔑 Location"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Villes populaires */}
        <div style={{ background: "#fff", borderRadius: 22, padding: "24px 28px", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 22 }}>🌍</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>Villes les plus actives</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            {VILLES.map((v) => <VilleCard key={v.nom} v={v} />)}
          </div>

          <div style={{ marginTop: 20, background: "#FFFBEB", borderRadius: 12, border: "1px solid #FCD34D",
            padding: "12px 16px", display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: 12, color: "#92400E", lineHeight: 1.5 }}>
              Ces données sont <strong>indicatives</strong> et basées sur les tendances observées du marché immobilier marocain.
              Elles ne reflètent pas nécessairement les biens disponibles dans notre base de données.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}