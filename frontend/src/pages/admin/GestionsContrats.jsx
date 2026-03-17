import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUT_CONFIG = {
  signe_complet: { label: "Signé complet",  color: "#065f46", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.25)"  },
  signe:         { label: "Signé",          color: "#c8a96e", bg: "rgba(200,169,110,0.1)",  border: "rgba(200,169,110,0.3)" },
  signe_vendeur: { label: "Signé vendeur",  color: "#b45309", bg: "rgba(180,83,9,0.08)",    border: "rgba(180,83,9,0.2)"   },
  en_attente:    { label: "En attente",     color: "#6d28d9", bg: "rgba(109,40,217,0.08)",  border: "rgba(109,40,217,0.2)" },
};

// ✅ Largeur totale calculée : 45+120+90+125+110+110+160+150+150+75 = 1135px — tient dans 1200px
const GRID = "45px 120px 90px 125px 110px 110px 160px 150px 150px 75px";

function StatutBadge({ statut }) {
  const c = STATUT_CONFIG[statut] || { label: statut || "—", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 99, fontSize: 9, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.6px", color: c.color, background: c.bg, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 26 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

function SigCell({ src }) {
  if (!src) return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#e5e7eb", flexShrink: 0 }} />
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, color: "#c4bfb8", fontWeight: 600, whiteSpace: "nowrap" }}>Non signé</span>
    </div>
  );
  return (
    <div style={{ background: "#fdfcfa", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 8, padding: "3px 6px", display: "inline-flex", alignItems: "center" }}>
      <img src={src} alt="signature" style={{ width: 80, height: 30, objectFit: "contain" }} />
    </div>
  );
}

export default function GestionContrats() {
  const [contrats, setContrats] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/contrats')
      .then(res => setContrats(res.data))
      .catch(() => setError('Erreur lors du chargement des contrats.'))
      .finally(() => setLoading(false));
  };

  const handleDownloadPdf = (contrat) => {
    const html = `
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
      <title>Contrat #${contrat.id_contrat}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Georgia', serif; font-size: 13px; color: #0f1e35; padding: 50px; background: white; }
        .header { text-align: center; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #c8a96e; }
        .header h1 { font-size: 26px; color: #0f1e35; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 6px; }
        .header p { color: #9ca3af; font-size: 11px; font-family: Arial, sans-serif; letter-spacing: 2px; text-transform: uppercase; }
        .ref { display: flex; justify-content: space-between; margin-bottom: 30px; font-family: Arial, sans-serif; font-size: 11px; color: #9ca3af; letter-spacing: 1px; }
        .ref strong { color: #0f1e35; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 11px; color: #c8a96e; letter-spacing: 3px; text-transform: uppercase; font-family: Arial, sans-serif; border-left: 2px solid #c8a96e; padding-left: 10px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        table td { padding: 9px 14px; border: 1px solid rgba(200,169,110,0.15); font-family: Arial, sans-serif; font-size: 12px; }
        table td:first-child { font-weight: bold; background: #fdfcfa; width: 32%; color: #9ca3af; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
        .sig-row { display: flex; gap: 20px; margin-top: 10px; }
        .sig-box { flex: 1; border: 1px solid rgba(200,169,110,0.2); border-radius: 10px; padding: 16px; text-align: center; background: #fdfcfa; }
        .sig-box h3 { font-size: 10px; color: #9ca3af; margin-bottom: 12px; font-family: Arial,sans-serif; letter-spacing: 2px; text-transform: uppercase; }
        .sig-box img { width: 180px; height: 60px; object-fit: contain; }
        .sig-empty { color: #c4bfb8; font-size: 12px; padding: 20px 0; font-family: Arial,sans-serif; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #c4bfb8; border-top: 1px solid rgba(200,169,110,0.2); padding-top: 14px; font-family: Arial,sans-serif; letter-spacing: 1px; }
        @media print { body { padding: 24px; } }
      </style></head><body>
      <div class="header">
        <h1>Contrat Immobilier</h1>
        <p>Document officiel — généré automatiquement</p>
      </div>
      <div class="ref">
        <span>Référence : <strong>#${String(contrat.id_contrat).padStart(5,"0")}</strong></span>
        <span>Date : <strong>${fmtDate(contrat.date_contrat)}</strong></span>
        <span>Statut : <strong>${STATUT_CONFIG[contrat.statut]?.label || contrat.statut}</strong></span>
      </div>
      <div class="section"><h2>Bien Immobilier</h2>
        <table>
          <tr><td>Titre</td><td>${contrat.bien?.titre ?? "—"}</td></tr>
          <tr><td>Type</td><td>${contrat.bien?.type_bien ?? "—"}</td></tr>
          <tr><td>Surface</td><td>${contrat.bien?.surface ?? "—"} m²</td></tr>
          <tr><td>Adresse</td><td>${contrat.bien?.adresse ?? "—"}</td></tr>
          <tr><td>Montant</td><td><strong>${fmt(contrat.montant)}</strong></td></tr>
        </table>
      </div>
      <div class="section"><h2>Vendeur</h2>
        <table>
          <tr><td>Nom complet</td><td>${contrat.vendeur?.prenom ?? ""} ${contrat.vendeur?.nom ?? "—"}</td></tr>
          <tr><td>Email</td><td>${contrat.vendeur?.email ?? "—"}</td></tr>
          <tr><td>Téléphone</td><td>${contrat.vendeur?.telephone ?? "—"}</td></tr>
        </table>
      </div>
      <div class="section"><h2>Acheteur</h2>
        <table>
          <tr><td>Nom complet</td><td>${contrat.acheteur?.prenom ?? ""} ${contrat.acheteur?.nom ?? "—"}</td></tr>
          <tr><td>Email</td><td>${contrat.acheteur?.email ?? "—"}</td></tr>
          <tr><td>Téléphone</td><td>${contrat.acheteur?.telephone ?? "—"}</td></tr>
        </table>
      </div>
      <div class="section"><h2>Signatures</h2>
        <div class="sig-row">
          <div class="sig-box"><h3>Signature Vendeur</h3>
            ${contrat.signature_vendeur ? `<img src="${contrat.signature_vendeur}" alt="sig"/>` : `<div class="sig-empty">Non signé</div>`}
          </div>
          <div class="sig-box"><h3>Signature Acheteur</h3>
            ${contrat.signature_acheteur ? `<img src="${contrat.signature_acheteur}" alt="sig"/>` : `<div class="sig-empty">Non signé</div>`}
          </div>
        </div>
      </div>
      <div class="footer">ImmoExpert · Généré le ${fmtDate(new Date())} à ${new Date().toLocaleTimeString("fr-FR")}</div>
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  const STAT_ITEMS = [
    { label: "Signé complet",  statut: "signe_complet", color: "#065f46",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { label: "Signé",          statut: "signe",         color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: "Signé vendeur",  statut: "signe_vendeur", color: "#b45309",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { label: "En attente",     statut: "en_attente",    color: "#6d28d9",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "Total",          statut: null,            color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement des contrats...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .rh:hover { background: #faf8f4 !important; }
        .rh { transition: background .12s; }
        /* ✅ scrollbar horizontale stylée */
        .table-scroll::-webkit-scrollbar { height: 4px; }
        .table-scroll::-webkit-scrollbar-track { background: #f8f7f4; }
        .table-scroll::-webkit-scrollbar-thumb { background: rgba(200,169,110,0.4); border-radius: 99px; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=90"
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
              Gestion des Contrats
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Suivez les signatures et téléchargez les contrats officiels
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

      {/* ✅ padding réduit pour gagner de la largeur */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 32px 80px" }} className="fade-up">

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
            const count = s.statut ? contrats.filter(c => c.statut === s.statut).length : contrats.length;
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

        {/* ── Volume total ── */}
        <div style={{ background: "#0f1e35", borderRadius: 20, padding: "20px 28px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(200,169,110,0.15)" }}>
          <div>
            <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 10 }} />
            <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Volume total des contrats</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 34, fontWeight: 700, color: "white", lineHeight: 1 }}>
              {fmt(contrats.reduce((s, c) => s + parseFloat(c.montant || 0), 0))}
            </p>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
        </div>

        {/* ── Table avec scroll horizontal ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>

          {/* ✅ wrapper scrollable uniquement pour le contenu de la table */}
          <div className="table-scroll" style={{ overflowX: "auto" }}>

            {/* Header */}
            <div style={{ background: "#0f1e35", padding: "12px 24px", display: "grid", gridTemplateColumns: GRID, gap: 6, minWidth: 1135 }}>
              {["#", "Montant", "Date", "Statut", "Sig. Vendeur", "Sig. Acheteur", "Bien", "Vendeur", "Acheteur", "PDF"].map(h => (
                <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)", whiteSpace: "nowrap" }}>{h}</div>
              ))}
            </div>

            {contrats.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", minWidth: 1135 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun contrat</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Les contrats apparaîtront ici après leur création</p>
              </div>
            ) : (
              contrats.map((contrat, i) => (
                <div
                  key={contrat.id_contrat}
                  className="rh"
                  style={{ display: "grid", gridTemplateColumns: GRID, gap: 6, padding: "13px 24px", alignItems: "center", borderBottom: i < contrats.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none", minWidth: 1135 }}
                >
                  {/* # */}
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#c4bfb8", fontWeight: 700 }}>
                    #{String(contrat.id_contrat).padStart(4, "0")}
                  </div>

                  {/* Montant */}
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: "#065f46" }}>
                    {fmt(contrat.montant)}
                  </div>

                  {/* Date */}
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: "#6b7280" }}>
                    {fmtDate(contrat.date_contrat)}
                  </div>

                  {/* Statut */}
                  <div><StatutBadge statut={contrat.statut} /></div>

                  {/* Sig Vendeur */}
                  <div><SigCell src={contrat.signature_vendeur} /></div>

                  {/* Sig Acheteur */}
                  <div><SigCell src={contrat.signature_acheteur} /></div>

                  {/* Bien */}
                  <div>
                    {contrat.bien ? (
                      <div>
                        <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 155 }}>{contrat.bien.titre}</p>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 9, color: "#9ca3af" }}>{contrat.bien.type_bien}</p>
                      </div>
                    ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8" }}>—</span>}
                  </div>

                  {/* Vendeur */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    {contrat.vendeur ? (
                      <>
                        <Avatar nom={contrat.vendeur.nom} prenom={contrat.vendeur.prenom} size={24} />
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#0f1e35", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contrat.vendeur.prenom} {contrat.vendeur.nom}</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 9, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contrat.vendeur.email}</p>
                        </div>
                      </>
                    ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8" }}>—</span>}
                  </div>

                  {/* Acheteur */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    {contrat.acheteur ? (
                      <>
                        <Avatar nom={contrat.acheteur.nom} prenom={contrat.acheteur.prenom} size={24} />
                        <div style={{ overflow: "hidden" }}>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 10, color: "#0f1e35", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contrat.acheteur.prenom} {contrat.acheteur.nom}</p>
                          <p style={{ fontFamily: "'DM Sans',sans-serif", margin: 0, fontSize: 9, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{contrat.acheteur.email}</p>
                        </div>
                      </>
                    ) : <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8" }}>—</span>}
                  </div>

                  {/* PDF */}
                  <div>
                    <button
                      onClick={() => handleDownloadPdf(contrat)}
                      style={{ padding: "6px 11px", borderRadius: 99, background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 4, transition: "all .2s", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#0f1e35"; e.currentTarget.style.borderColor = "#c8a96e"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,169,110,0.1)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"; }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      PDF
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>{/* fin table-scroll */}
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
          {contrats.length} contrat{contrats.length !== 1 ? "s" : ""} · Cliquez sur PDF pour générer le document officiel
        </p>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>
    </div>
  );
}