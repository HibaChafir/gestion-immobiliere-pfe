import { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

const getUserId = () => {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    return u.id_user ?? u.id ?? null;
  } catch { return null; }
};

const TYPE_CONFIG = {
  vente:      { label: "Vente",      color: "#4F46E5", bg: "#EEF2FF", border: "#A5B4FC", icon: "🏠" },
  location:   { label: "Location",   color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", icon: "🔑" },
  paiement:   { label: "Paiement",   color: "#0891B2", bg: "#F0F9FF", border: "#7DD3FC", icon: "💳" },
  annulation: { label: "Annulation", color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", icon: "❌" },
};

function TypeBadge({ type }) {
  const t = TYPE_CONFIG[type] || { label: type, color: "#64748B", bg: "#F8FAFF", border: "#E2E8F0", icon: "🔁" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: t.color, background: t.bg, border: `1px solid ${t.border}`,
    }}>
      {t.icon} {t.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 32 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5", "#0891B2", "#059669", "#D97706", "#7C3AED", "#DC2626"];
  const c = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.35,
      border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>{txt}</div>
  );
}

// ── Modal détail transaction ──────────────────────────────────────────────────
function DetailModal({ transaction: t, onClose }) {
  const cfg = TYPE_CONFIG[t.type_transaction] || { color: "#64748B", bg: "#F8FAFF", icon: "🔁" };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 520,
        boxShadow: "0 40px 100px rgba(15,23,42,.3)",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, #0F172A, #1E3A5F)`, padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                TRANSACTION N° {String(t.id_transaction).padStart(5, "0")}
              </p>
              <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {t.bien?.titre || "—"}
              </h2>
              <TypeBadge type={t.type_transaction} />
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10, color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px" }}>

          {/* Montant */}
          <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "16px 20px", marginBottom: 16, border: "1px solid #BBF7D0", textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#059669", fontWeight: 700 }}>MONTANT</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#064E3B" }}>{fmt(t.montant)}</p>
          </div>

          {/* Infos grille */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>📅 DATE</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{fmtDate(t.date_transaction)}</p>
            </div>
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>🏠 BIEN</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{t.bien?.titre || "—"}</p>
            </div>
          </div>

          {/* Client */}
          {t.client && (
            <div style={{ background: "#F8FAFF", borderRadius: 13, padding: "12px 14px", border: "1px solid #E2E8F0", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar nom={t.client?.nom} prenom={t.client?.prenom} size={36} />
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>CLIENT</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{t.client?.prenom} {t.client?.nom}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{t.client?.email}</p>
              </div>
            </div>
          )}

          {/* Description */}
          {t.description && (
            <div style={{ background: "#FFFBEB", borderRadius: 13, padding: "12px 14px", border: "1px solid #FCD34D" }}>
              <p style={{ margin: "0 0 4px", fontSize: 10, color: "#D97706", fontWeight: 700 }}>📝 DESCRIPTION</p>
              <p style={{ margin: 0, fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>{t.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesTransactions() {
  const userId = getUserId();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [errLoad, setErrLoad]           = useState("");
  const [search, setSearch]             = useState("");
  const [filtType, setFiltType]         = useState("tous");
  const [selected, setSelected]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get("/transactions");
      const all = Array.isArray(data) ? data : [];
      // Filtrer les transactions du propriétaire connecté
      setTransactions(
        all.filter((t) => t.id_proprietaire === userId || t.proprietaire?.id_user === userId)
      );
    } catch {
      setErrLoad("Impossible de charger les transactions.");
    } finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filtered = transactions.filter((t) => {
    const q  = search.toLowerCase();
    const ok = t.bien?.titre?.toLowerCase().includes(q)
      || t.client?.nom?.toLowerCase().includes(q)
      || t.client?.prenom?.toLowerCase().includes(q)
      || t.description?.toLowerCase().includes(q);
    return ok && (filtType === "tous" || t.type_transaction === filtType);
  });

  // Stats
  const stats = {
    total:      transactions.length,
    ventes:     transactions.filter((t) => t.type_transaction === "vente").length,
    locations:  transactions.filter((t) => t.type_transaction === "location").length,
    paiements:  transactions.filter((t) => t.type_transaction === "paiement").length,
    annulations:transactions.filter((t) => t.type_transaction === "annulation").length,
    volume:     transactions.filter((t) => ["vente","location"].includes(t.type_transaction))
                            .reduce((s, t) => s + parseFloat(t.montant || 0), 0),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: 260 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        .rh:hover { background:#EEF2FF !important; cursor:pointer; }
        .rh { transition:background .12s; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>ESPACE VENDEUR</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Mes Transactions</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Historique complet de toutes vos transactions immobilières</p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 26 }}>
          {[
            { icon: "🔁", label: "Total",       value: stats.total,       color: "#4F46E5" },
            { icon: "🏠", label: "Ventes",      value: stats.ventes,      color: "#4F46E5" },
            { icon: "🔑", label: "Locations",   value: stats.locations,   color: "#059669" },
            { icon: "💳", label: "Paiements",   value: stats.paiements,   color: "#0891B2" },
            { icon: "❌", label: "Annulations", value: stats.annulations, color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "18px 20px",
              boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Volume total */}
        <div style={{ background: "linear-gradient(135deg,#4F46E5,#0891B2)", borderRadius: 18, padding: "20px 28px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>VOLUME TOTAL (VENTES + LOCATIONS)</p>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#fff" }}>{fmt(stats.volume)}</p>
          </div>
          <div style={{ fontSize: 48, opacity: .4 }}>💰</div>
        </div>

        {/* Filtres */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 10px rgba(15,23,42,.06)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par bien, client, description…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", background: "#F8FAFF", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ["tous",       "Tous"],
              ["vente",      "🏠 Ventes"],
              ["location",   "🔑 Locations"],
              ["paiement",   "💳 Paiements"],
              ["annulation", "❌ Annulations"],
            ].map(([v, l]) => (
              <button key={v} onClick={() => setFiltType(v)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${filtType === v ? "#4F46E5" : "#E2E8F0"}`,
                background: filtType === v ? "#EEF2FF" : "transparent",
                color: filtType === v ? "#4F46E5" : "#94A3B8", transition: "all .14s",
              }}>{l}</button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", cursor: "pointer", fontSize: 15 }}>🔄</button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 160px 150px 140px 120px", padding: "12px 24px", background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F0", fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
            <div>N°</div><div>BIEN</div><div>CLIENT</div><div>TYPE</div><div>MONTANT</div><div>DATE</div>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Chargement…</p>
            </div>
          )}

          {!loading && errLoad && (
            <div style={{ padding: "20px 24px", background: "#FEF2F2", color: "#DC2626", fontWeight: 600 }}>
              ⚠️ {errLoad}
              <button onClick={load} style={{ background: "none", border: "none", color: "#DC2626", textDecoration: "underline", cursor: "pointer", marginLeft: 8 }}>Réessayer</button>
            </div>
          )}

          {!loading && !errLoad && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "64px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📭</div>
              <p style={{ fontWeight: 600, margin: 0 }}>Aucune transaction trouvée</p>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Les transactions apparaîtront ici après chaque vente ou location</p>
            </div>
          )}

          {!loading && filtered.map((t, i) => {
            const img = t.bien?.images?.[0]?.url_image;
            const cfg = TYPE_CONFIG[t.type_transaction] || { color: "#64748B", icon: "🔁" };
            return (
              <div key={t.id_transaction} className="rh" onClick={() => setSelected(t)} style={{
                display: "grid", gridTemplateColumns: "60px 1fr 160px 150px 140px 120px",
                padding: "15px 24px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#CBD5E1" }}>
                  #{String(t.id_transaction).padStart(4, "0")}
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 44, height: 36, borderRadius: 9, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>🏠</div>
                    }
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{t.bien?.titre || "—"}</p>
                    {t.description && (
                      <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{t.description}</p>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {t.client ? (
                    <>
                      <Avatar nom={t.client?.nom} prenom={t.client?.prenom} size={26} />
                      <span style={{ fontSize: 12, color: "#1E293B", fontWeight: 600 }}>{t.client?.prenom} {t.client?.nom}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: "#94A3B8" }}>—</span>
                  )}
                </div>

                <div><TypeBadge type={t.type_transaction} /></div>

                <div style={{ fontSize: 14, fontWeight: 800, color: cfg.color }}>
                  {t.montant ? fmt(t.montant) : "—"}
                </div>

                <div style={{ fontSize: 12, color: "#64748B" }}>{fmtDate(t.date_transaction)}</div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== transactions.length && ` sur ${transactions.length}`} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {selected && <DetailModal transaction={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}