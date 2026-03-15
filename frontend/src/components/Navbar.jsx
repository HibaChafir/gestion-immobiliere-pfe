import { Link, useNavigate, useLocation } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token    = localStorage.getItem('token')
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const isVendeur = token && user?.id_role === 2
  const isAdmin   = token && user?.id_role === 1
  const isClient  = token && user?.id_role === 3

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const linkStyle = (path) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#b8860b' : '#4a6fa5',
    fontWeight: isActive(path) ? '700' : '500',
    fontSize: '13px',
    padding: '6px 12px',
    borderRadius: '4px',
    background: isActive(path) ? 'rgba(184,134,11,0.08)' : 'transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.3px',
    borderBottom: isActive(path) ? '2px solid #b8860b' : '2px solid transparent',
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .nav-link:hover { color: #b8860b !important; background: rgba(184,134,11,0.06) !important; }
        .btn-logout:hover { background: #ef4444 !important; color: white !important; }
        .btn-login:hover { background: #1a3a5e !important; }
        .btn-register:hover { background: rgba(26,58,94,0.06) !important; }
        .nav-scroll { backdrop-filter: blur(12px); }
      `}</style>

      <nav style={{
        background: 'rgba(255,255,255,0.97)',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '68px',
        boxShadow: '0 1px 0 rgba(26,58,94,0.08), 0 4px 20px rgba(26,58,94,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #1a3a5e, #4a7fb5)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <polygon points="18,2 34,20 2,20" fill="white" opacity="0.9" />
              <rect x="6" y="20" width="24" height="14" fill="white" rx="1" />
              <rect x="14" y="26" width="8" height="8" fill="#1a3a5e" rx="1" />
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: '700', fontSize: '20px', color: '#1a3a5e', letterSpacing: '0.5px' }}>ImmoExpert</span>
            <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '9px', color: '#b8860b', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600', marginTop: '-3px' }}>Maroc</span>
          </div>
        </Link>

        {/* ── Liens navigation ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>

          {!token && (
            <>
              <Link to="/"                className="nav-link" style={linkStyle('/__home__')}>Accueil</Link>
              <Link to="/biens"           className="nav-link" style={linkStyle('/biens')}>Tendances</Link>
              <Link to="/Actualitesmarche" className="nav-link" style={linkStyle('/Actualitesmarche')}>Actualités</Link>
            </>
          )}

          {isVendeur && (
            <>
              <Link to="/"                         className="nav-link" style={linkStyle('/__home__')}>Accueil</Link>
              <Link to="/vendeur/dashboard"        className="nav-link" style={linkStyle('/vendeur/dashboard')}>Dashboard</Link>
              <Link to="/vendeur/mes-biens"        className="nav-link" style={linkStyle('/vendeur/mes-biens')}>Mes Biens</Link>
              <Link to="/vendeur/mes-demandes"     className="nav-link" style={linkStyle('/vendeur/mes-demandes')}>Demandes</Link>
              <Link to="/vendeur/contrats"         className="nav-link" style={linkStyle('/vendeur/contrats')}>Contrats</Link>
              <Link to="/vendeur/mes-paiements"    className="nav-link" style={linkStyle('/vendeur/mes-paiements')}>Paiements</Link>
              <Link to="/vendeur/mes-transactions" className="nav-link" style={linkStyle('/vendeur/mes-transactions')}>Transactions</Link>
              <Link to="/vendeur/prediction-prix"  className="nav-link" style={linkStyle('/vendeur/prediction-prix')}>Prédiction</Link>
              <Link to="/Actualitesmarche"          className="nav-link" style={linkStyle('/Actualitesmarche')}>Actualités</Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link to="/admin/dashboard"    className="nav-link" style={linkStyle('/admin/dashboard')}>Dashboard</Link>
              <Link to="/admin/utilisateurs" className="nav-link" style={linkStyle('/admin/utilisateurs')}>Utilisateurs</Link>
              <Link to="/admin/biens"        className="nav-link" style={linkStyle('/admin/biens')}>Biens</Link>
              <Link to="/admin/contrats"     className="nav-link" style={linkStyle('/admin/contrats')}>Contrats</Link>
              <Link to="/admin/transactions" className="nav-link" style={linkStyle('/admin/transactions')}>Paiements</Link>
              <Link to="/admin/contacts"     className="nav-link" style={linkStyle('/admin/contacts')}>Contacts</Link>
        
              <Link to="/Actualitesmarche"   className="nav-link" style={linkStyle('/Actualitesmarche')}>Actualités</Link>
            </>
          )}

          {isClient && (
            <>
              <Link to="/"                     className="nav-link" style={linkStyle('/__home__')}>Accueil</Link>
              <Link to="/biens"                className="nav-link" style={linkStyle('/biens')}>Tendances</Link>
              <Link to="/client/favoris"       className="nav-link" style={linkStyle('/client/favoris')}>❤️ Favoris</Link>
              <Link to="/client/mes-contrats"  className="nav-link" style={linkStyle('/client/mes-contrats')}>Contrats</Link>
              <Link to="/client/mes-paiements" className="nav-link" style={linkStyle('/client/mes-paiements')}>Paiements</Link>
              <Link to="/carte" style={linkStyle('/carte')}>🗺️ Carte</Link>
              <Link to="/Actualitesmarche"     className="nav-link" style={linkStyle('/Actualitesmarche')}>Actualités</Link>
            </>
          )}
        </div>

        {/* ── Profil / Connexion ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {!token ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn-login" onClick={() => navigate('/login')} style={{
                background: '#1a3a5e', color: 'white', border: 'none',
                padding: '9px 22px', borderRadius: '4px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.5px', transition: 'all 0.2s'
              }}>
                Connexion
              </button>
              <button className="btn-register" onClick={() => navigate('/register')} style={{
                background: 'white', color: '#1a3a5e',
                border: '1.5px solid #1a3a5e',
                padding: '9px 18px', borderRadius: '4px', cursor: 'pointer',
                fontWeight: '600', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.5px', transition: 'all 0.2s'
              }}>
                S'inscrire
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {/* Badge rôle */}
              <span style={{
                fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.5px',
                background: isAdmin ? '#fef9ec' : isVendeur ? '#eef4fb' : '#ecfdf5',
                color: isAdmin ? '#b8860b' : isVendeur ? '#1a3a5e' : '#059669',
                border: `1px solid ${isAdmin ? '#f0c060' : isVendeur ? '#b8d0e8' : '#6ee7b7'}`,
              }}>
                {isAdmin ? '👑 Admin' : isVendeur ? '🏠 Vendeur' : '🤝 Client'}
              </span>

              {/* Avatar + Nom */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: '#f0f6ff', borderRadius: '20px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a3a5e, #4a7fb5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: 'white', fontWeight: '700', fontFamily: "'DM Sans', sans-serif"
                }}>
                  {(user?.prenom?.[0] || user?.nom?.[0] || 'U').toUpperCase()}
                </div>
                <span style={{ color: '#1a3a5e', fontWeight: '600', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
                  {user?.prenom || user?.nom || 'Profil'}
                </span>
              </div>

              {/* Bouton déconnexion */}
              <button className="btn-logout" onClick={handleLogout} style={{
                background: 'white', color: '#ef4444',
                border: '1.5px solid #ef4444',
                padding: '7px 14px', borderRadius: '4px', cursor: 'pointer',
                fontWeight: '600', fontSize: '12px', fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.3px', transition: 'all 0.2s'
              }}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}

export default Navbar