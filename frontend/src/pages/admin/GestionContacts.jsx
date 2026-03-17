import { useState, useEffect } from 'react';
import axios from "../../api/axios";
const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUT_CONFIG = {
  nouveau:  { label: "Nouveau",  color: "#c8a96e", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)" },
  en_cours: { label: "En cours", color: "#b45309", bg: "rgba(180,83,9,0.08)",   border: "rgba(180,83,9,0.2)"   },
  traité:   { label: "Traité",   color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)" },
  fermé:    { label: "Fermé",    color: "#991b1b", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
};

const TYPE_CONFIG = {
  vente:    { label: "Vente",    color: "#0f1e35", bg: "rgba(15,30,53,0.08)",  border: "rgba(15,30,53,0.2)"   },
  location: { label: "Location", color: "#065f46", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.25)" },
};

function StatutBadge({ statut }) {
  const c = STATUT_CONFIG[statut] || { label: statut || "—", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const c = TYPE_CONFIG[type] || { label: type || "—", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {c.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 30 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

function BienModal({ bien, onClose }) {
  const rows = [
    { label: "Type",    value: <TypeBadge type={bien.type_bien} /> },
    { label: "Prix",    value: <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#065f46" }}>{fmt(bien.prix)}</span> },
    { label: "Surface", value: `${bien.surface} m²` },
    { label: "Pièces",  value: bien.nb_pieces },
    { label: "Adresse", value: bien.adresse || "—" },
    { label: "Statut",  value: <StatutBadge statut={bien.statut} /> },
  ];

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 480, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", overflow: "hidden", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)" }}>

        {/* Header */}
        <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative" }}>
          <div style={{ position: "absolute", left: 30, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
          <div style={{ paddingLeft: 20 }}>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Bien immobilier lié
            </span>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 20, fontWeight: 700, color: "white" }}>
              {bien.titre}
            </h2>
          </div>
          <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {rows.map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#fdfcfa", borderRadius: 12, border: "1px solid rgba(200,169,110,0.12)" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{label}</span>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#0f1e35" }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right" }}>
            <button onClick={onClose} style={{ padding: "10px 24px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", background: "white", color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GestionContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showBien, setShowBien] = useState(null);
  const [search, setSearch]     = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/contacts')
      .then(res => setContacts(res.data))
      .catch(() => setError('Erreur lors du chargement des contacts.'))
      .finally(() => setLoading(false));
  };

  const filtered = contacts.filter(c =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.message && c.message.toLowerCase().includes(search.toLowerCase()))
  );

  const STAT_ITEMS = [
    { label: "Nouveau",  statut: "nouveau",  color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
    { label: "En cours", statut: "en_cours", color: "#b45309",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "Traité",   statut: "traité",   color: "#065f46",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: "Fermé",    statut: "fermé",    color: "#991b1b",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    { label: "Total",    statut: null,       color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement des contacts...</p>
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
        .rh:hover { background: #faf8f4 !important; }
        .rh { transition: background .12s; cursor: default; }
        input:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: 72, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Administration
            </span>
            <h1 style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>
              Gestion des Contacts
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Suivez et gérez tous les messages entrants
            </p>
          </div>
          <button
            onClick={fetchData}
            style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Actualiser
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "36px 60px 80px" }} className="fade-up">

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
          {STAT_ITEMS.map(s => {
            const count = s.statut ? contacts.filter(c => c.statut === s.statut).length : contacts.length;
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

        {/* ── Table ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>

          {/* Search */}
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Rechercher par nom, email ou message..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
              />
            </div>
          </div>

          {/* Header */}
          <div style={{ background: "#0f1e35", padding: "13px 28px", display: "grid", gridTemplateColumns: "50px 140px 180px 1fr 110px 160px 100px 90px" }}>
            {["#", "Nom", "Email", "Message", "Statut", "Client", "Date", "Bien"].map(h => (
              <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun contact trouvé</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Modifiez votre recherche ou attendez de nouveaux messages</p>
            </div>
          ) : (
            filtered.map((contact, i) => (
              <div key={contact.id_contact} className="rh" style={{ display: "grid", gridTemplateColumns: "50px 140px 180px 1fr 110px 160px 100px 90px", padding: "14px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>

                {/* # */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>
                  #{String(contact.id_contact).padStart(4, "0")}
                </div>

                {/* Nom */}
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>
                  {contact.nom}
                </div>

                {/* Email */}
                <div>
                  <a href={`mailto:${contact.email}`} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c8a96e", textDecoration: "none", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {contact.email}
                  </a>
                </div>

                {/* Message */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 16 }} title={contact.message}>
                  {contact.message || <span style={{ color: "#c4bfb8" }}>—</span>}
                </div>

                {/* Statut */}
                <div>
                  {contact.statut
                    ? <StatutBadge statut={contact.statut} />
                    : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>
                  }
                </div>

                {/* Client */}
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {contact.client ? (
                    <>
                      <Avatar nom={contact.client.nom} prenom={contact.client.prenom} size={26} />
                      <div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 11, color: "#0f1e35", fontWeight: 700 }}>{contact.client.prenom} {contact.client.nom}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#9ca3af" }}>{contact.client.email}</p>
                      </div>
                    </>
                  ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>}
                </div>

                {/* Date */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280" }}>
                  {fmtDate(contact.date_envoi)}
                </div>

                {/* Bien lié */}
                <div>
                  {contact.bien ? (
                    <button
                      onClick={() => setShowBien(contact.bien)}
                      style={{ padding: "6px 12px", borderRadius: 99, background: "rgba(15,30,53,0.06)", border: "1px solid rgba(15,30,53,0.15)", color: "#0f1e35", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 5, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#0f1e35"; e.currentTarget.style.color = "#c8a96e"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,30,53,0.06)"; e.currentTarget.style.color = "#0f1e35"; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      Voir
                    </button>
                  ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>}
                </div>

              </div>
            ))
          )}
        </div>

        {!loading && (
          <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
            {filtered.length} contact{filtered.length !== 1 ? "s" : ""}{filtered.length !== contacts.length ? ` sur ${contacts.length}` : ""} · Cliquez sur un bien pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>

      {showBien && <BienModal bien={showBien} onClose={() => setShowBien(null)} />}
    </div>
  );
}