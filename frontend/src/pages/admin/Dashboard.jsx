import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const STATUT_CONFIG = {
  en_attente: { label: "En attente", color: "#6d28d9", bg: "rgba(109,40,217,0.08)", border: "rgba(109,40,217,0.2)" },
  disponible: { label: "Disponible", color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)" },
  vendu:      { label: "Vendu",      color: "#991b1b", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
  loué:       { label: "Loué",       color: "#b45309", bg: "rgba(180,83,9,0.08)",   border: "rgba(180,83,9,0.2)"   },
};

const ROLE_CONFIG = {
  admin:    { color: "#991b1b", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
  vendeur:  { color: "#0f1e35", bg: "rgba(15,30,53,0.08)",   border: "rgba(15,30,53,0.2)"   },
  acheteur: { color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)" },
};

const CHART_COLORS = ["#c8a96e", "#065f46", "#6d28d9", "#991b1b", "#0f1e35", "#b45309"];

function Pill({ label, config }) {
  const c = config || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: c.color, background: c.bg, border: `1px solid ${c.border}`, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

function BarRow({ label, value, max, color }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280", fontWeight: 600, textTransform: "capitalize" }}>{label}</span>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ background: "#f0ede8", borderRadius: 99, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${percent}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function KpiCard({ title, value, color, icon, sub = false }) {
  return (
    <div style={{ background: "white", padding: "22px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{title}</span>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: sub ? 20 : 36, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function SectionCard({ title, accent = false, children }) {
  return (
    <div style={{ background: accent ? "#0f1e35" : "white", borderRadius: 24, padding: "28px 32px", border: `1px solid ${accent ? "rgba(200,169,110,0.15)" : "rgba(200,169,110,0.12)"}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ width: 20, height: 1, background: "#c8a96e", marginBottom: 8 }} />
        <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: accent ? "white" : "#0f1e35", margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DashboardAdmin() {
  const [biens, setBiens]               = useState([]);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/biens'),
      axios.get('http://localhost:8000/api/utilisateurs'),
    ]).then(([biensRes, usersRes]) => {
      setBiens(biensRes.data);
      setUtilisateurs(usersRes.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement du tableau de bord...</p>
      </div>
    </div>
  );

  const totalBiens        = biens.length;
  const totalUtilisateurs = utilisateurs.length;
  const biensDisponibles  = biens.filter(b => b.statut === 'disponible').length;
  const biensEnAttente    = biens.filter(b => b.statut === 'en_attente').length;
  const biensVendus       = biens.filter(b => b.statut === 'vendu').length;
  const biensLoues        = biens.filter(b => b.statut === 'loué').length;

  const rolesCount = utilisateurs.reduce((acc, u) => {
    const role = u.role?.libelle || 'inconnu';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const vendeurCount = Object.values(
    biens.reduce((acc, b) => {
      if (b.vendeur) {
        const key = b.id_vendeur;
        if (!acc[key]) acc[key] = { name: `${b.vendeur.prenom} ${b.vendeur.nom}`, total: 0 };
        acc[key].total += 1;
      }
      return acc;
    }, {})
  );

  const statutBiens = [
    { label: 'En attente', value: biensEnAttente,   color: "#6d28d9" },
    { label: 'Disponible', value: biensDisponibles, color: "#065f46" },
    { label: 'Vendu',      value: biensVendus,      color: "#991b1b" },
    { label: 'Loué',       value: biensLoues,       color: "#b45309" },
  ];

  const KPI_ITEMS = [
    { title: "Utilisateurs", value: totalUtilisateurs, color: "#c8a96e",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { title: "Total biens", value: totalBiens, color: "#0f1e35",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
    { title: "Disponibles", value: biensDisponibles, color: "#065f46",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
    { title: "En attente", value: biensEnAttente, color: "#6d28d9",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { title: "Vendus", value: biensVendus, color: "#991b1b",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { title: "Loués", value: biensLoues, color: "#b45309",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 220, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.97) 0%, rgba(8,16,34,0.65) 55%, rgba(8,16,34,0.2) 100%)" }} />
        <div style={{ position: "absolute", left: 72, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Administration
            </span>
            <h1 style={{ color: "white", fontSize: 40, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>
              Tableau de bord
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Vue d'ensemble de la plateforme ImmoExpert
            </p>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "36px 60px 80px" }} className="fade-up">

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
          {KPI_ITEMS.map(k => <KpiCard key={k.title} {...k} />)}
        </div>

        {/* ── Volume band ── */}
        <div style={{ background: "#0f1e35", borderRadius: 20, padding: "20px 28px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(200,169,110,0.15)" }}>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Biens disponibles</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 28, fontWeight: 700, color: "#c8a96e", lineHeight: 1 }}>{biensDisponibles} <span style={{ fontSize: 14, color: "rgba(200,169,110,0.5)" }}>/ {totalBiens}</span></p>
            </div>
            <div style={{ width: 1, background: "rgba(200,169,110,0.2)" }} />
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Taux de disponibilité</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1 }}>
                {totalBiens > 0 ? ((biensDisponibles / totalBiens) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div style={{ width: 1, background: "rgba(200,169,110,0.2)" }} />
            <div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", margin: "0 0 6px", fontSize: 9, color: "rgba(200,169,110,0.7)", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Biens vendus + loués</p>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1 }}>{biensVendus + biensLoues}</p>
            </div>
          </div>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
        </div>

        {/* ── Charts row 1 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          <SectionCard title="Utilisateurs par rôle">
            {Object.entries(rolesCount).map(([role, count], i) => (
              <BarRow key={role} label={role} value={count} max={totalUtilisateurs} color={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </SectionCard>

          <SectionCard title="Biens par statut">
            {statutBiens.map(s => (
              <BarRow key={s.label} label={s.label} value={s.value} max={totalBiens || 1} color={s.color} />
            ))}
          </SectionCard>

        </div>

        {/* ── Charts row 2 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          <SectionCard title="Biens par type de transaction">
            {['vente', 'location'].map((type, i) => {
              const count = biens.filter(b => b.type_bien === type).length;
              return <BarRow key={type} label={type} value={count} max={totalBiens || 1} color={CHART_COLORS[i]} />;
            })}
          </SectionCard>

          <SectionCard title="Biens par vendeur">
            {vendeurCount.length === 0
              ? <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#9ca3af", margin: 0 }}>Aucun vendeur</p>
              : vendeurCount.map((v, i) => (
                  <BarRow key={v.name} label={v.name} value={v.total} max={totalBiens || 1} color={CHART_COLORS[i % CHART_COLORS.length]} />
                ))
            }
          </SectionCard>

        </div>

        {/* ── Summary tables ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Rôles table */}
          <SectionCard title="Résumé des rôles">
            <div style={{ background: "#0f1e35", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "10px 18px", background: "rgba(200,169,110,0.08)" }}>
                {["Rôle", "Nombre", "%"].map(h => (
                  <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
                ))}
              </div>
              {Object.entries(rolesCount).map(([role, count], i) => (
                <div key={role} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "12px 18px", borderTop: "1px solid rgba(200,169,110,0.07)", alignItems: "center" }}>
                  <Pill label={role} config={ROLE_CONFIG[role]} />
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "white" }}>{count}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(200,169,110,0.6)", fontWeight: 600 }}>
                    {((count / totalUtilisateurs) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Biens table */}
          <SectionCard title="Résumé des biens">
            <div style={{ background: "#0f1e35", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "10px 18px", background: "rgba(200,169,110,0.08)" }}>
                {["Statut", "Nombre", "%"].map(h => (
                  <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
                ))}
              </div>
              {statutBiens.map(({ label, value, color }) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", padding: "12px 18px", borderTop: "1px solid rgba(200,169,110,0.07)", alignItems: "center" }}>
                  <Pill label={label} config={STATUT_CONFIG[label === "En attente" ? "en_attente" : label === "Disponible" ? "disponible" : label === "Vendu" ? "vendu" : "loué"]} />
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "white" }}>{value}</span>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "rgba(200,169,110,0.6)", fontWeight: 600 }}>
                    {totalBiens > 0 ? ((value / totalBiens) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>
    </div>
  );
}