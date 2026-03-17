import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TYPE_CONFIG = {
  vente:    { label: "Vente",    color: "#0f1e35", bg: "rgba(15,30,53,0.08)",  border: "rgba(15,30,53,0.2)"   },
  location: { label: "Location", color: "#065f46", bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.25)" },
};

const CONTRAT_CONFIG = {
  signe_complet: { label: "Signé complet", color: "#065f46", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.25)" },
  signe:         { label: "Signé",         color: "#c8a96e", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)" },
  signe_vendeur: { label: "Signé vendeur", color: "#b45309", bg: "rgba(180,83,9,0.08)",   border: "rgba(180,83,9,0.2)"   },
  en_attente:    { label: "En attente",    color: "#6d28d9", bg: "rgba(109,40,217,0.08)", border: "rgba(109,40,217,0.2)" },
};

function Pill({ label, config }) {
  const c = config || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
      {label || "—"}
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

function UserCell({ user }) {
  if (!user) return <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#c4bfb8" }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <Avatar nom={user.nom} prenom={user.prenom} />
      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: "#0f1e35" }}>{user.prenom} {user.nom}</span>
    </div>
  );
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [paiements, setPaiements]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('transactions');
  const [searchT, setSearchT]           = useState('');
  const [searchP, setSearchP]           = useState('');

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:8000/api/transactions'),
      axios.get('http://localhost:8000/api/paiements'),
    ]).then(([tRes, pRes]) => {
      setTransactions(tRes.data);
      setPaiements(pRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalT = transactions.reduce((s, t) => s + Number(t.montant), 0);
  const totalP = paiements.reduce((s, p) => s + Number(p.montant), 0);

  const filteredT = transactions.filter(t => {
    const q = searchT.toLowerCase();
    return (
      String(t.id_transaction).includes(q) ||
      (t.type_transaction || '').toLowerCase().includes(q) ||
      (t.description      || '').toLowerCase().includes(q) ||
      (t.bien?.titre      || '').toLowerCase().includes(q) ||
      (t.client       ? `${t.client.prenom} ${t.client.nom}`.toLowerCase()       : '').includes(q) ||
      (t.proprietaire ? `${t.proprietaire.prenom} ${t.proprietaire.nom}`.toLowerCase() : '').includes(q)
    );
  });

  const filteredP = paiements.filter(p => {
    const q = searchP.toLowerCase();
    return (
      String(p.id_paiement).includes(q) ||
      (p.mode_paiement        || '').toLowerCase().includes(q) ||
      (p.contrat?.bien?.titre || '').toLowerCase().includes(q) ||
      (p.contrat?.acheteur ? `${p.contrat.acheteur.prenom} ${p.contrat.acheteur.nom}`.toLowerCase() : '').includes(q) ||
      (p.contrat?.vendeur  ? `${p.contrat.vendeur.prenom} ${p.contrat.vendeur.nom}`.toLowerCase()   : '').includes(q)
    );
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement...</p>
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
        input:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=90"
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
              Transactions & Paiements
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Suivi financier complet de la plateforme
            </p>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 60px 80px" }} className="fade-up">

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Transactions",     value: transactions.length, color: "#0f1e35",
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f1e35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
              isAmount: false },
            { label: "Volume transactions", value: fmt(totalT), color: "#065f46",
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
              isAmount: true },
            { label: "Paiements",        value: paiements.length, color: "#6d28d9",
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
              isAmount: false },
            { label: "Volume paiements", value: fmt(totalP), color: "#c8a96e",
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 6v6l4 2"/></svg>,
              isAmount: true },
          ].map(s => (
            <div key={s.label} style={{ background: "white", padding: "20px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{s.label}</span>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: s.isAmount ? "'Cormorant Garamond',serif" : "'Cormorant Garamond',serif", fontSize: s.isAmount ? 22 : 34, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { id: "transactions", label: "Transactions", count: transactions.length,
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
            { id: "paiements",    label: "Paiements",    count: paiements.length,
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: "10px 22px", borderRadius: 99, border: `1px solid ${activeTab === tab.id ? "#c8a96e" : "rgba(200,169,110,0.2)"}`, background: activeTab === tab.id ? "#0f1e35" : "white", color: activeTab === tab.id ? "#c8a96e" : "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all .14s" }}
            >
              {tab.icon}
              {tab.label}
              <span style={{ background: activeTab === tab.id ? "rgba(200,169,110,0.15)" : "#f8f7f4", color: activeTab === tab.id ? "#c8a96e" : "#9ca3af", borderRadius: 99, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── TRANSACTIONS TABLE ── */}
        {activeTab === 'transactions' && (
          <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Rechercher par type, bien, client, propriétaire, description..." value={searchT} onChange={e => setSearchT(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }} />
              </div>
            </div>

            <div style={{ background: "#0f1e35", padding: "13px 28px", display: "grid", gridTemplateColumns: "55px 120px 140px 100px 170px 160px 160px 1fr" }}>
              {["#", "Type", "Montant", "Date", "Bien", "Client", "Propriétaire", "Description"].map(h => (
                <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
              ))}
            </div>

            {filteredT.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucune transaction</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Modifiez votre recherche</p>
              </div>
            ) : filteredT.map((t, i) => (
              <div key={t.id_transaction} className="rh" style={{ display: "grid", gridTemplateColumns: "55px 120px 140px 100px 170px 160px 160px 1fr", padding: "13px 28px", alignItems: "center", borderBottom: i < filteredT.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>#{String(t.id_transaction).padStart(4,"0")}</div>
                <div><Pill label={t.type_transaction} config={TYPE_CONFIG[t.type_transaction]} /></div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "#065f46" }}>{fmt(t.montant)}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280" }}>{fmtDate(t.date_transaction)}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 700, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.bien?.titre || <span style={{ color: "#c4bfb8" }}>—</span>}</div>
                <UserCell user={t.client} />
                <UserCell user={t.proprietaire} />
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description || <span style={{ color: "#c4bfb8" }}>—</span>}</div>
              </div>
            ))}

            {filteredT.length > 0 && (
              <div style={{ padding: "14px 28px", borderTop: "1px solid rgba(200,169,110,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>{filteredT.length} transaction{filteredT.length !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>Total filtré</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#065f46" }}>
                    {fmt(filteredT.reduce((s, t) => s + Number(t.montant), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PAIEMENTS TABLE ── */}
        {activeTab === 'paiements' && (
          <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Rechercher par mode, bien, acheteur, vendeur..." value={searchP} onChange={e => setSearchP(e.target.value)}
                  style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }} />
              </div>
            </div>

            <div style={{ background: "#0f1e35", padding: "13px 28px", display: "grid", gridTemplateColumns: "55px 100px 140px 130px 180px 160px 160px 130px" }}>
              {["#", "Date", "Montant", "Mode", "Bien", "Acheteur", "Vendeur", "Contrat"].map(h => (
                <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
              ))}
            </div>

            {filteredP.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun paiement</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Modifiez votre recherche</p>
              </div>
            ) : filteredP.map((p, i) => (
              <div key={p.id_paiement} className="rh" style={{ display: "grid", gridTemplateColumns: "55px 100px 140px 130px 180px 160px 160px 130px", padding: "13px 28px", alignItems: "center", borderBottom: i < filteredP.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>#{String(p.id_paiement).padStart(4,"0")}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280" }}>{fmtDate(p.date_paiement)}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "#065f46" }}>{fmt(p.montant)}</div>
                <div>
                  <Pill
                    label={p.mode_paiement}
                    config={{ color: "#c8a96e", bg: "rgba(200,169,110,0.1)", border: "rgba(200,169,110,0.3)" }}
                  />
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 700, color: "#0f1e35", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.contrat?.bien?.titre || <span style={{ color: "#c4bfb8", fontFamily: "'DM Sans',sans-serif", fontSize: 12 }}>—</span>}</div>
                <UserCell user={p.contrat?.acheteur} />
                <UserCell user={p.contrat?.vendeur} />
                <div><Pill label={p.contrat?.statut} config={CONTRAT_CONFIG[p.contrat?.statut]} /></div>
              </div>
            ))}

            {filteredP.length > 0 && (
              <div style={{ padding: "14px 28px", borderTop: "1px solid rgba(200,169,110,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#9ca3af" }}>{filteredP.length} paiement{filteredP.length !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>Total filtré</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "#065f46" }}>
                    {fmt(filteredP.reduce((s, p) => s + Number(p.montant), 0))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>
    </div>
  );
}