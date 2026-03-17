import { useState } from 'react'
import axios from '../api/axios'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) { setError('Veuillez saisir votre email.'); return }
    setLoading(true); setError('')
    try {
      await axios.post('/forgot-password', { email })
      setSuccess(true)
    } catch (e) {
      setError(e.response?.data?.message || 'Une erreur est survenue.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'Cormorant Garamond',serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .fp-input { width:100%; padding:13px 16px; border:1px solid rgba(200,169,110,0.25); font-family:'DM Sans',sans-serif; font-size:14px; color:#0f1e35; background:#fdfcfa; outline:none; transition:border-color .2s; }
        .fp-input:focus { border-color:#c8a96e; }
        .fp-input::placeholder { color:#c4bfb8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards; }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=90" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(8,16,34,0.95) 0%,rgba(8,16,34,0.6) 55%,rgba(8,16,34,0.15) 100%)' }} />
        <div style={{ position: 'absolute', left: '72px', top: '15%', bottom: '15%', width: '1px', background: 'linear-gradient(to bottom,transparent,#c8a96e,transparent)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 110px' }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            ImmoExpert
          </span>
          <h1 style={{ color: 'white', fontSize: 34, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
            Mot de passe oublié
          </h1>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(to top,#f8f7f4,transparent)' }} />
      </div>

      {/* Formulaire */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: '460px' }}>

          {!success ? (
            <div style={{ background: 'white', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 4px 32px rgba(10,20,40,0.07)' }}>

              {/* En-tête carte */}
              <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid rgba(200,169,110,0.1)' }}>
                <div style={{ width: 28, height: 2, background: '#c8a96e', marginBottom: 10 }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1e35', margin: '0 0 6px' }}>Réinitialisation</h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#9ca3af', margin: 0 }}>
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              <div style={{ padding: '28px 36px 32px' }}>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    Adresse email *
                  </label>
                  <input
                    className="fp-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? '#d4c4a8' : '#c8a96e', color: 'white', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s', marginBottom: 16 }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background='#b8955a')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background='#c8a96e')}>
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#c8a96e', textDecoration: 'none', fontWeight: 600 }}>
                    ← Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>

          ) : (
            <div style={{ background: 'white', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 4px 32px rgba(10,20,40,0.07)', padding: '48px 36px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid rgba(200,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
              </div>
              <div style={{ width: 28, height: 1, background: '#c8a96e', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f1e35', margin: '0 0 10px' }}>Email envoyé</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: '#9ca3af', fontSize: 13, margin: '0 0 24px', lineHeight: 1.7 }}>
                Un lien de réinitialisation a été envoyé à <br />
                <strong style={{ color: '#0f1e35' }}>{email}</strong>
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: '#c4bfb8', fontSize: 12, margin: '0 0 24px' }}>
                Vérifiez votre boîte de réception et vos spams.
              </p>
              <Link to="/login" style={{ display: 'inline-block', padding: '12px 28px', background: '#0f1e35', color: 'white', textDecoration: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Retour à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#070f1e', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '2px' }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>© 2026</span>
      </div>
    </div>
  )
}