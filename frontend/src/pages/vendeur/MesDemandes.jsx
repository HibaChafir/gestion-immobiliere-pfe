import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

const STATUTS = {
  en_attente: { label: "En attente", color: "#B45309", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  accepte:    { label: "Accepté",    color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", dot: "#10B981" },
  refuse:     { label: "Refusé",     color: "#DC2626", bg: "#FEF2F2", border: "#FCA5A5", dot: "#EF4444" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 38 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5","#0891B2","#059669","#D97706","#7C3AED","#DC2626"];
  const c = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: c,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * 0.35, flexShrink: 0,
      border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)",
    }}>{txt}</div>
  );
}

function DemandeModal({ demande, onClose, onUpdated }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleAction = async (statut) => {
    setSaving(true); setErr("");
    try {
      const { data } = await axios.put(`/contacts/${demande.id_contact}`, { statut });
      onUpdated(data);
      onClose();
    } catch {
      setErr("Erreur lors de la mise à jour.");
    } finally { setSaving(false); }
  };

  const bien = demande.bien;
  const client = demande.client;
  const img = bien?.images?.[0]?.url_image;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(15,23,42,.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, width: "100%", maxWidth: 560,
        boxShadow: "0 40px 100px rgba(15,23,42,.3)",
        overflow: "hidden", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        animation: "pop .22s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1E3A5F)", padding: "24px 28px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(255,255,255,.5)", fontWeight: 700, letterSpacing: ".1em" }}>
                DEMANDE CLIENT
              </p>
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800, color: "#fff" }}>
                {bien?.titre || "—"}
              </h2>
              <Badge statut={demande.statut} />
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10,
              color: "#fff", width: 34, height: 34, cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 28px 28px", overflowY: "auto" }}>
          {img && (
            <div style={{ borderRadius: 14, overflow: "hidden", height: 160, marginBottom: 20 }}>
              <img src={`http://127.0.0.1:8000/storage/${img}`} alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div style={{ background: "#f8faff", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b", fontWeight: 700 }}>🏠 BIEN IMMOBILIER</p>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{bien?.titre}</p>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
              <span>📐 {bien?.surface} m²</span>
              <span>🚪 {bien?.nb_pieces} pièces</span>
              <span style={{ color: bien?.type_bien === "vente" ? "#4F46E5" : "#059669", fontWeight: 700 }}>
                {bien?.type_bien === "vente" ? "🏠 Vente" : "🔑 Location"}
              </span>
            </div>
          </div>

          <div style={{ background: "#f8faff", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, color: "#64748b", fontWeight: 700 }}>👤 CLIENT</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar nom={client?.nom} prenom={client?.prenom} size={42} />
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  {client?.prenom} {client?.nom}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{client?.email}</p>
                {client?.telephone && (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#4F46E5", fontWeight: 600 }}>
                    📞 {client?.telephone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {demande.message && (
            <div style={{ background: "#fefce8", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #fde68a" }}>
              <p style={{ margin: "0 0 6px", fontSize: 11, color: "#92400e", fontWeight: 700 }}>💬 MESSAGE</p>
              <p style={{ margin: 0, fontSize: 14, color: "#0f172a", lineHeight: 1.6 }}>{demande.message}</p>
            </div>
          )}

          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
            📅 Reçu le {new Date(demande.date_envoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>

          {err && (
            <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              ⚠️ {err}
            </div>
          )}

          {demande.statut === "en_attente" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <button onClick={() => handleAction("accepte")} disabled={saving} style={{
                padding: "13px 0", borderRadius: 13, border: "none",
                background: saving ? "#94a3b8" : "linear-gradient(135deg,#059669,#16a34a)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
              }}>✅ Accepter</button>
              <button onClick={() => handleAction("refuse")} disabled={saving} style={{
                padding: "13px 0", borderRadius: 13, border: "none",
                background: saving ? "#94a3b8" : "linear-gradient(135deg,#ef4444,#dc2626)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(239,68,68,0.3)",
              }}>❌ Refuser</button>
            </div>
          )}

          {demande.statut === "accepte" && (
            <button
              onClick={() => {
  onClose();
  navigate("/vendeur/creer-contrat", {
    state: {
      bien:     demande.bien,
      acheteur: demande.client,
    }
  });
}}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 13, border: "none",
                background: "linear-gradient(135deg,#4F46E5,#0891B2)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
              }}>
              📋 Créer un contrat pour ce client
            </button>
          )}

          {demande.statut === "refuse" && (
            <div style={{ background: "#fee2e2", borderRadius: 13, padding: "13px", textAlign: "center", color: "#dc2626", fontSize: 13, fontWeight: 600 }}>
              ❌ Cette demande a été refusée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errLoad, setErrLoad]   = useState("");
  const [search, setSearch]     = useState("");
  const [filtStatut, setFiltStatut] = useState("tous");
  const [selected, setSelected] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/contacts/vendeur/${user.id_user}`);
      setDemandes(data);
    } catch {
      setErrLoad("Impossible de charger les demandes.");
    } finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handleUpdated = (updated) => {
    setDemandes((p) => p.map((d) => d.id_contact === updated.id_contact ? updated : d));
  };

  const filtered = demandes.filter((d) => {
    const q = search.toLowerCase();
    const ok = d.bien?.titre?.toLowerCase().includes(q)
      || d.client?.nom?.toLowerCase().includes(q)
      || d.client?.prenom?.toLowerCase().includes(q);
    return ok && (filtStatut === "tous" || d.statut === filtStatut);
  });

  const stats = {
    total:   demandes.length,
    attente: demandes.filter((d) => d.statut === "en_attente").length,
    accepte: demandes.filter((d) => d.statut === "accepte").length,
    refuse:  demandes.filter((d) => d.statut === "refuse").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingLeft: 260 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes pop { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        @keyframes in  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .drow:hover { background:#EEF2FF !important; cursor:pointer; }
        .drow { transition: background .12s; }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 32px", animation: "in .35s ease" }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>ESPACE VENDEUR</p>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Mes Demandes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Clients intéressés par vos biens immobiliers</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
          {[
            { icon: "📩", label: "Total",      value: stats.total,   color: "#4F46E5" },
            { icon: "⏳", label: "En attente", value: stats.attente, color: "#D97706" },
            { icon: "✅", label: "Acceptées",  value: stats.accepte, color: "#059669" },
            { icon: "❌", label: "Refusées",   value: stats.refuse,  color: "#DC2626" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "#fff", borderRadius: 18, padding: "20px 24px",
              boxShadow: "0 2px 16px rgba(15,23,42,.07)", borderTop: `3px solid ${s.color}`,
            }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "14px 20px", marginBottom: 16,
          display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center",
          boxShadow: "0 1px 10px rgba(15,23,42,.06)" }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par bien ou client…"
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10,
                border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A",
                background: "#F8FAFF", boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["tous","Tous"],["en_attente","En attente"],["accepte","Acceptées"],["refuse","Refusées"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltStatut(v)} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                border: `1.5px solid ${filtStatut===v ? "#4F46E5" : "#E2E8F0"}`,
                background: filtStatut===v ? "#EEF2FF" : "transparent",
                color: filtStatut===v ? "#4F46E5" : "#94A3B8", transition: "all .14s",
              }}>{l}</button>
            ))}
          </div>
          <button onClick={load} style={{ padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "transparent", cursor: "pointer", fontSize: 15 }}>🔄</button>
        </div>

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 16px rgba(15,23,42,.08)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 160px 120px",
            padding: "12px 24px", background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F0",
            fontSize: 11, fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em" }}>
            <div>BIEN / CLIENT</div><div>CONTACT</div><div>DATE</div><div>STATUT</div>
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
              <p style={{ fontWeight: 600, margin: 0 }}>Aucune demande reçue</p>
              <p style={{ fontSize: 13, margin: "6px 0 0" }}>Les clients intéressés par vos biens apparaîtront ici</p>
            </div>
          )}

          {!loading && filtered.map((d, i) => {
            const img = d.bien?.images?.[0]?.url_image;
            return (
              <div key={d.id_contact} className="drow" onClick={() => setSelected(d)} style={{
                display: "grid", gridTemplateColumns: "1fr 200px 160px 120px",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 40, borderRadius: 10, overflow: "hidden", background: "#F1F5F9", flexShrink: 0 }}>
                    {img
                      ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 18 }}>🏠</div>
                    }
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      {d.bien?.titre || "—"}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar nom={d.client?.nom} prenom={d.client?.prenom} size={20} />
                      <span style={{ fontSize: 12, color: "#64748B" }}>
                        {d.client?.prenom} {d.client?.nom}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{d.client?.email}</p>
                  {d.client?.telephone && (
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>{d.client?.telephone}</p>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "#64748B" }}>
                  📅 {new Date(d.date_envoi).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div><Badge statut={d.statut} /></div>
              </div>
            );
          })}
        </div>

        {!loading && (
          <p style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#94A3B8" }}>
            {filtered.length} demande{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== demandes.length && ` sur ${demandes.length}`} · Cliquez pour voir les détails
          </p>
        )}
      </div>

      {selected && (
        <DemandeModal
          demande={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}