import { useState, useEffect, useRef, useCallback } from "react";
import axios from "../../api/axios";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  dark:     "#0f1e35",
  gold:     "#c8a96e",
  goldSoft: "#e8c98e",
  bg:       "#f8f7f4",
  card:     "#ffffff",
  text:     "#0f1e35",
  border:   "#ece8df",
};

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const Ico = {
  Pen:      (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
  File:     (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>,
  Clock:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Check:    (s=22) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  CheckSm:  ()     => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  X:        (s=14) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Search:   ()     => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Reload:   ()     => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  Arrow:    ()     => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Cal:      ()     => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  Home:     ()     => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Ruler:    ()     => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 8.7 8.7 21.3c-1 1-2.5 1-3.4 0l-2.6-2.6c-1-1-1-2.5 0-3.4L15.3 2.7c1-1 2.5-1 3.4 0l2.6 2.6c1 1 1 2.5 0 3.4Z"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m13.5 4.5 2 2"/><path d="m4.5 13.5 2 2"/></svg>,
  Door:     ()     => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.069.998L3 20.562a2 2 0 0 1-1-3.562V5a2 2 0 0 1 2-2h9z"/></svg>,
  Bell:     ()     => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Erase:    ()     => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>,
  Download: ()     => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Loader:   ()     => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  User:     ()     => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Pin:      ()     => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ── Statuts ───────────────────────────────────────────────────────────────────
const STATUTS = {
  en_attente:    { label: "En attente",  color: "#92400E", bg: "#FFFBEB", border: "#FCD34D", dot: "#F59E0B" },
  signe_vendeur: { label: "À signer",   color: C.dark,    bg: "#f5f0e8", border: C.gold,    dot: C.gold   },
  signe:         { label: "Signé",      color: "#1e40af", bg: "#EFF6FF", border: "#93C5FD", dot: "#3B82F6" },
  signe_complet: { label: "Signé",      color: "#1e40af", bg: "#EFF6FF", border: "#93C5FD", dot: "#3B82F6" },
  annule:        { label: "Annulé",     color: "#991B1B", bg: "#FEF2F2", border: "#FCA5A5", dot: "#EF4444" },
};

function Badge({ statut }) {
  const s = STATUTS[statut] || STATUTS.en_attente;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, fontSize: 10, fontWeight: 800, color: s.color, background: s.bg, border: `1px solid ${s.border}`, letterSpacing: "0.5px", textTransform: "uppercase" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />{s.label}
    </span>
  );
}

function Avatar({ nom, prenom, size = 38 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = [C.dark, "#0891B2", "#059669", C.gold, "#7C3AED", "#DC2626"];
  const bg = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * .35, border: "2px solid #fff", boxShadow: "0 1px 4px rgba(0,0,0,.12)" }}>{txt}</div>
  );
}

// ── Canvas signature ──────────────────────────────────────────────────────────
function SignatureCanvas({ onSigned, onClear, signed }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };
  const startDraw = (e) => { e.preventDefault(); drawing.current = true; lastPos.current = getPos(e, canvasRef.current); };
  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e, canvasRef.current);
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y); ctx.strokeStyle = C.dark;
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
    lastPos.current = pos;
  };
  const stopDraw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    onSigned(canvasRef.current.toDataURL("image/png"));
  };
  const handleClear = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onClear();
  };

  return (
    <div>
      <div style={{ border: `2px dashed ${signed ? C.gold : C.border}`, borderRadius: 12, overflow: "hidden", background: "#faf9f6", position: "relative", transition: "border-color .3s" }}>
        {!signed && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", flexDirection: "column", gap: 8 }}>
            <div style={{ color: "#d4c9b0", opacity: .6 }}>{Ico.Pen(22)}</div>
            <span style={{ fontSize: 12, color: "#c8bfb0", fontWeight: 600 }}>Signez ici avec votre souris ou doigt</span>
          </div>
        )}
        <canvas ref={canvasRef} width={480} height={160}
          style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button onClick={handleClear} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "7px 14px", color: "#9ca3af", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          {Ico.Erase()} Effacer
        </button>
        {signed && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#059669", fontWeight: 700 }}>{Ico.CheckSm()} Signature capturée</span>}
      </div>
    </div>
  );
}

// ── Modal contrat ─────────────────────────────────────────────────────────────
function ContratModal({ contrat, onClose, onSigned }) {
  const [signatureData, setSignatureData] = useState(null);
  const [signing,       setSigning]       = useState(false);
  const [signErr,       setSignErr]       = useState("");
  const [signed,        setSigned]        = useState(false);

  const bien    = contrat.bien;
  const vendeur = contrat.vendeur;
  const img     = bien?.images?.[0]?.url_image;

  const handleSign = async () => {
    if (!signatureData) { setSignErr("Veuillez signer avant de continuer."); return; }
    setSigning(true); setSignErr("");
    try {
      const { data } = await axios.put(`/contrats/${contrat.id_contrat}/signer`, { role: "acheteur", signature: signatureData });
      setSigned(true); onSigned(data);
    } catch { setSignErr("Erreur lors de l'enregistrement de la signature."); }
    finally { setSigning(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,12,24,.75)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.card, borderRadius: 24, width: "100%", maxWidth: 590, boxShadow: "0 40px 100px rgba(10,15,30,.4)", overflow: "hidden", maxHeight: "92vh", display: "flex", flexDirection: "column", animation: "pop .25s cubic-bezier(.34,1.56,.64,1)" }}>

        {/* Header modal */}
        <div style={{ background: "linear-gradient(135deg, #0f1e35, #1a2c4d)", padding: "26px 30px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(200,169,110,.15)" }} />
          <div style={{ position: "absolute", top: -10, right: -10, width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(200,169,110,.1)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 2, background: C.gold }} />
                <span style={{ fontSize: 10, color: "rgba(200,169,110,.7)", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase" }}>Contrat N° {String(contrat.id_contrat).padStart(5, "0")}</span>
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>{bien?.titre || "—"}</h2>
              <Badge statut={contrat.statut} />
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, color: "#fff", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ico.X()}</button>
          </div>
        </div>

        {/* Body modal */}
        <div style={{ padding: "24px 30px 30px", overflowY: "auto" }}>
          {img && <div style={{ borderRadius: 12, overflow: "hidden", height: 160, marginBottom: 20 }}><img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}

          <div style={{ background: "#faf9f6", borderRadius: 12, padding: "16px 18px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <p style={{ margin: "0 0 10px", fontSize: 10, color: C.gold, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>Bien immobilier</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "'Cormorant Garamond', serif" }}>{bien?.titre}</p>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#9ca3af" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.Ruler()} {bien?.surface} m²</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>{Ico.Door()} {bien?.nb_pieces} pièces</span>
                </div>
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: C.dark }}>{fmt(contrat.montant)}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Vendeur", user: vendeur, sig: contrat.signature_vendeur },
              { label: "Vous (Acheteur)", user: contrat.acheteur, sig: (contrat.statut === "signe_complet" || contrat.statut === "signe") ? contrat.signature_acheteur : null },
            ].map(({ label, user: u, sig }) => (
              <div key={label} style={{ background: "#faf9f6", borderRadius: 12, padding: "14px 16px", border: `1px solid ${C.border}` }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, color: "#9ca3af", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{label}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar nom={u?.nom} prenom={u?.prenom} size={32} />
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.dark }}>{u?.prenom} {u?.nom}</p><p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{u?.email}</p></div>
                </div>
                {sig && <div style={{ marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}><p style={{ margin: "0 0 4px", fontSize: 9, color: "#059669", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>{Ico.CheckSm()} Signé</p><img src={sig} alt="Signature" style={{ maxWidth: "100%", height: 36, objectFit: "contain", background: "#faf9f6", borderRadius: 6, border: `1px solid ${C.border}` }} /></div>}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 12, marginBottom: 20 }}>
            {Ico.Cal()}<span>Date du contrat : {fmtDate(contrat.date_contrat)}</span>
          </div>

          {contrat.statut === "signe_vendeur" && !signed && (
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0, boxShadow: `0 4px 14px rgba(200,169,110,.4)` }}>{Ico.Pen()}</div>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.dark, fontFamily: "'Cormorant Garamond', serif" }}>Votre signature requise</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Le vendeur a déjà signé — signez pour finaliser le contrat</p>
                </div>
              </div>
              <SignatureCanvas onSigned={setSignatureData} onClear={() => setSignatureData(null)} signed={!!signatureData} />
              {signErr && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 600, marginTop: 12 }}>{signErr}</div>}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                <button onClick={handleSign} disabled={!signatureData || signing} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14, background: !signatureData || signing ? "#f0ede8" : `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, color: !signatureData || signing ? "#c8bfb0" : C.dark, cursor: !signatureData || signing ? "not-allowed" : "pointer", boxShadow: !signatureData || signing ? "none" : `0 6px 22px rgba(200,169,110,.45)`, letterSpacing: "0.3px", transition: "all .2s" }}>
                  {Ico.Pen()} {signing ? "Enregistrement..." : "Signer le contrat"}
                </button>
              </div>
            </div>
          )}

          {signed && <div style={{ background: "#faf9f6", borderRadius: 14, border: `1px solid ${C.border}`, padding: "22px", textAlign: "center", marginTop: 12 }}><div style={{ width: 52, height: 52, borderRadius: "50%", background: "#ECFDF5", border: "1px solid #6EE7B7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#059669" }}>{Ico.CheckSm()}</div><p style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 700, color: "#065F46", fontFamily: "'Cormorant Garamond', serif" }}>Contrat finalisé !</p><p style={{ margin: 0, fontSize: 13, color: "#059669" }}>Les deux parties ont signé.</p></div>}
          {(contrat.statut === "signe_complet" || contrat.statut === "signe") && !signed && <div style={{ background: "#ECFDF5", borderRadius: 12, border: "1px solid #6EE7B7", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}><div style={{ color: "#059669" }}>{Ico.CheckSm()}</div><div><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#065F46", fontFamily: "'Cormorant Garamond', serif" }}>Contrat entièrement signé</p><p style={{ margin: 0, fontSize: 12, color: "#059669" }}>Les deux signatures sont enregistrées.</p></div></div>}
          {contrat.statut === "en_attente" && <div style={{ background: "#FFFBEB", borderRadius: 12, border: "1px solid #FCD34D", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ color: "#F59E0B" }}>{Ico.Clock()}</div><p style={{ margin: 0, fontSize: 13, color: "#92400E", fontWeight: 600 }}>En attente de la signature du vendeur.</p></div>}
          {contrat.statut === "annule" && <div style={{ background: "#FEF2F2", borderRadius: 12, border: "1px solid #FCA5A5", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}><div style={{ color: "#EF4444" }}>{Ico.X()}</div><p style={{ margin: 0, fontSize: 13, color: "#991B1B", fontWeight: 600 }}>Ce contrat a été annulé.</p></div>}

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18, marginTop: 18 }}>
            {contrat.fichier_pdf ? (
              <a href={`http://127.0.0.1:8000/storage/${contrat.fichier_pdf}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 12, textDecoration: "none", fontWeight: 700, fontSize: 13, letterSpacing: "0.5px", background: C.dark, color: "#fff", boxShadow: "0 6px 20px rgba(10,20,40,.25)" }}>
                {Ico.Download()} Télécharger le contrat PDF
              </a>
            ) : (
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 12, padding: "13px 0", textAlign: "center", color: "#92400E", fontSize: 13, fontWeight: 600 }}>
                PDF disponible après signature des deux parties
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesContrats() {
  const [contrats,   setContrats]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [errLoad,    setErrLoad]    = useState("");
  const [search,     setSearch]     = useState("");
  const [filtStatut, setFiltStatut] = useState("tous");
  const [selected,   setSelected]   = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const load = useCallback(async () => {
    setLoading(true); setErrLoad("");
    try {
      const { data } = await axios.get(`/contrats/acheteur/${user.id_user}`);
      setContrats(data);
    } catch { setErrLoad("Impossible de charger vos contrats."); }
    finally { setLoading(false); }
  }, [user.id_user]);

  useEffect(() => { load(); }, [load]);

  const handleSigned = (updated) => {
    setContrats(prev => prev.map(c => c.id_contrat === updated.id_contrat ? updated : c));
    if (selected?.id_contrat === updated.id_contrat) setSelected(updated);
  };

  const filtered = contrats.filter((c) => {
    const q = search.toLowerCase();
    const ok = c.bien?.titre?.toLowerCase().includes(q) || c.vendeur?.nom?.toLowerCase().includes(q);
    return ok && (filtStatut === "tous" || c.statut === filtStatut);
  });

  const stats = {
    total:   contrats.length,
    attente: contrats.filter(c => c.statut === "en_attente").length,
    asigner: contrats.filter(c => c.statut === "signe_vendeur").length,
    complet: contrats.filter(c => c.statut === "signe_complet" || c.statut === "signe").length,
  };

  // ── Stats items identiques au style MesPaiements vendeur ──────────────────
  const STAT_ITEMS = [
    { label: "Total contrats", value: stats.total,   color: "#c8a96e",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg> },
    { label: "En attente",     value: stats.attente, color: "#92400E",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "À signer",       value: stats.asigner, color: "#B45309",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg> },
    { label: "Signés",         value: stats.complet, color: "#065f46",
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pop    { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
        * { box-sizing: border-box; }
        .page { animation: fadeUp .5s ease; }
        .crow { transition: all .22s; cursor: pointer; }
        .crow:hover { background: #faf7f0 !important; transform: scale(1.005); }
        .filter-btn { transition: all .15s; cursor: pointer; }
        .filter-btn:hover { border-color: ${C.gold} !important; color: #92400E !important; }
        .signer-btn { transition: all .2s; }
        .signer-btn:hover { opacity: .88; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(200,169,110,.45) !important; }
      `}</style>

      {/* ══════════════ HERO — style MesPaiements vendeur ══════════════ */}
      <div style={{ position: "relative", height: "220px", overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: "72px", top: "15%", bottom: "15%", width: "1px", background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Espace client
            </span>
            <h1 style={{ color: "white", fontSize: 38, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px", fontFamily: "'Cormorant Garamond',serif" }}>
              Mes Contrats
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Consultez et signez vos contrats immobiliers
            </p>
          </div>
          <button onClick={load}
            style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#c8a96e"}
            onMouseLeave={e => e.currentTarget.style.borderColor="rgba(200,169,110,0.3)"}>
            {Ico.Reload()} Actualiser
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: `linear-gradient(to top, ${C.bg}, transparent)` }} />
      </div>

      <div className="page" style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 60px 80px" }}>

        {/* ══════════════ STATS — style MesPaiements vendeur ══════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
          {STAT_ITEMS.map(s => (
            <div key={s.label} style={{ background: "white", padding: "22px 24px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${s.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{s.label}</span>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Alerte à signer ── */}
        {stats.asigner > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.gold}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 16, padding: "16px 22px", marginBottom: 26, display: "flex", alignItems: "center", gap: 14, boxShadow: `0 4px 18px rgba(200,169,110,.12)` }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.gold }}>{Ico.Bell()}</div>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "'Cormorant Garamond', serif" }}>
                {stats.asigner} contrat{stats.asigner > 1 ? "s" : ""} en attente de votre signature
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Cliquez sur un contrat marqué "À signer" pour apposer votre signature électronique.</p>
            </div>
          </div>
        )}

        {/* ── Filtres ── */}
        <div style={{ background: C.card, borderRadius: 16, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 2px 12px rgba(10,20,40,.06)", border: `1px solid ${C.border}` }}>
          <div style={{ position: "relative", flex: "1 1 240px" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#c8bfb0" }}>{Ico.Search()}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par bien ou vendeur..."
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.dark, background: C.bg, outline: "none", transition: "border-color .2s" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["tous","Tous"],["en_attente","En attente"],["signe_vendeur","À signer"],["signe","Signés"],["annule","Annulés"]].map(([v, l]) => (
              <button key={v} className="filter-btn" onClick={() => setFiltStatut(v)} style={{
                padding: "8px 16px", borderRadius: 99, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700,
                border: `1px solid ${filtStatut === v ? C.gold : "rgba(200,169,110,0.2)"}`,
                background: filtStatut === v ? C.dark : "transparent",
                color: filtStatut === v ? C.gold : "#9ca3af",
                transition: "all .14s", letterSpacing: "0.5px",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── Tableau ── */}
        <div style={{ background: C.card, borderRadius: 22, overflow: "hidden", boxShadow: "0 12px 40px rgba(10,20,40,0.08)", border: `1px solid ${C.border}` }}>

          {/* Header tableau — fond clair */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px 130px 110px", padding: "14px 26px", background: "#f3f1ec", borderBottom: `1px solid ${C.border}`, fontSize: 10, fontWeight: 700, color: C.dark, letterSpacing: "1.2px", textTransform: "uppercase" }}>
            <div>Bien / Vendeur</div><div>Montant</div><div>Date</div><div>Statut</div><div>Action</div>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              {Ico.Loader()}
              <p style={{ color: "#9ca3af", fontWeight: 600, marginTop: 14, fontFamily: "'DM Sans',sans-serif" }}>Chargement...</p>
            </div>
          )}
          {!loading && errLoad && (
            <div style={{ padding: "20px 26px", background: "#fef2f2", color: "#dc2626", fontWeight: 600, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
              {errLoad}<button onClick={load} style={{ background: "none", border: "none", color: "#dc2626", textDecoration: "underline", cursor: "pointer" }}>Réessayer</button>
            </div>
          )}
          {!loading && !errLoad && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "70px 0", color: "#c8bfb0" }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: "#d4c9b0" }}>{Ico.File(26)}</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: C.dark, margin: "0 0 6px" }}>Aucun contrat trouvé</p>
              <p style={{ fontSize: 13, margin: 0, color: "#9ca3af", fontFamily: "'DM Sans',sans-serif" }}>Vos contrats immobiliers apparaîtront ici</p>
            </div>
          )}

          {!loading && filtered.map((c, i) => {
            const img       = c.bien?.images?.[0]?.url_image;
            const needsSign = c.statut === "signe_vendeur";
            return (
              <div key={c.id_contrat} className="crow" onClick={() => setSelected(c)} style={{
                display: "grid", gridTemplateColumns: "1fr 160px 140px 130px 110px",
                padding: "18px 26px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? `1px solid rgba(200,169,110,0.07)` : "none",
                borderLeft: needsSign ? `3px solid ${C.gold}` : "3px solid transparent",
                background: needsSign ? "rgba(200,169,110,.03)" : C.card,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 56, height: 44, borderRadius: 10, overflow: "hidden", background: "#f0ede8", flexShrink: 0, border: "1px solid rgba(200,169,110,0.15)" }}>
                    {img ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#d4c9b0" }}>{Ico.Home()}</div>}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.dark, fontFamily: "'Cormorant Garamond', serif" }}>{c.bien?.titre || "—"}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Avatar nom={c.vendeur?.nom} prenom={c.vendeur?.prenom} size={18} />
                      <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'DM Sans',sans-serif" }}>{c.vendeur?.prenom} {c.vendeur?.nom}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, color: C.dark }}>{fmt(c.montant)}</div>

                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans',sans-serif" }}>
                  {Ico.Cal()}{fmtDate(c.date_contrat)}
                </div>

                <div><Badge statut={c.statut} /></div>

                <div>
                  {needsSign ? (
                    <button className="signer-btn" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 10, fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", background: `linear-gradient(135deg, ${C.gold}, ${C.goldSoft})`, color: C.dark, border: "none", cursor: "pointer", boxShadow: `0 4px 14px rgba(200,169,110,.35)` }}>
                      {Ico.Pen()} Signer
                    </button>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.gold, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                      Voir {Ico.Arrow()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length > 0 && (
          <p style={{ textAlign: "right", marginTop: 12, fontSize: 12, color: "#c8bfb0", fontFamily: "'DM Sans',sans-serif" }}>
            {filtered.length} contrat{filtered.length !== 1 ? "s" : ""}{filtered.length !== contrats.length && ` sur ${contrats.length}`} · Cliquez sur une ligne pour voir les détails
          </p>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Espace Client</span>
      </div>

      {selected && <ContratModal contrat={selected} onClose={() => setSelected(null)} onSigned={handleSigned} />}
    </div>
  );
}