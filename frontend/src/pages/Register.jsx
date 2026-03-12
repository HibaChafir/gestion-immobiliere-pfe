import { useState } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    confirmer_mot_de_passe: '',
    telephone: '',
    id_role: '3' // 3 = client par défaut
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.mot_de_passe !== formData.confirmer_mot_de_passe) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      const response = await axiosInstance.post('/register', formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '40px' }}>🏠</span>
          <h2 style={{ color: '#2563eb', margin: '8px 0 4px', fontSize: '24px' }}>
            ImmoExpert
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Créez votre compte
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: '#fee2e2', color: '#ef4444',
            padding: '10px 16px', borderRadius: '8px',
            marginBottom: '20px', fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>

          {/* Nom + Prénom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Dupont"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Marie"
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              required
              style={inputStyle}
            />
          </div>

          {/* Téléphone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+212 6XX XXX XXX"
              style={inputStyle}
            />
          </div>

          {/* Rôle */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Je suis</label>
            <select
              name="id_role"
              value={formData.id_role}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="3">Client (Acheteur / Locataire)</option>
              <option value="2">Propriétaire (Vendeur)</option>
            </select>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Mot de passe</label>
            <input
              type="password"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          {/* Confirmer mot de passe */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Confirmer le mot de passe</label>
            <input
              type="password"
              name="confirmer_mot_de_passe"
              value={formData.confirmer_mot_de_passe}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            {loading ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien connexion */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Se connecter
          </Link>
        </p>

        {/* Mot de passe oublié */}
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '14px' }}>
          <Link to="/reset-password" style={{ color: '#6b7280', textDecoration: 'none' }}>
            Mot de passe oublié ?
          </Link>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151'
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box'
}

export default Register