import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { getEmailFromToken } from '../utils/authUtils';



export default function ProfilePage() {
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    segment: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token') || '';
    setEmail(getEmailFromToken(storedToken));

    fetch('http://localhost:8081/users/me', {
      headers: {
        'Authorization': `Bearer ${storedToken}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Profil bilgileri getirilemedi');
        return res.json();
      })
      .then(data => {
        setProfile({
          name: data.name || '',
          surname: data.surname || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          role: data.role || '',
          segment: data.segment || ''
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    const storedToken = localStorage.getItem('token') || '';

    fetch('http://localhost:8081/users/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${storedToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: profile.name,
        surname: profile.surname,
        phone: profile.phone,
        address: profile.address
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Profil güncellenemedi');
        return res.json();
      })
      .then(data => {
        setProfile(prev => ({
          ...prev,
          name: data.name || '',
          surname: data.surname || '',
          phone: data.phone || '',
          address: data.address || ''
        }));
        setToast('Profil başarıyla güncellendi!');
        setTimeout(() => setToast(null), 3000);
      })
      .catch(err => setError(err.message))
      .finally(() => setSaving(false));
  };

  return (
    <div>
      <Navbar email={email} />
      {toast && (
        <div className="toast-notification">
          <span>✅</span> {toast}
        </div>
      )}
      <div className="dashboard-page">
        <div className="dashboard-card shadow-lg" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="page-header-flex" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ margin: 0 }}>My Profile</h2>
            {!loading && !error && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="badge" style={{ padding: '4px 8px', backgroundColor: '#eee', borderRadius: '4px', fontSize: '0.9rem' }}>
                  Role: {profile.role || 'USER'}
                </span>
                <span className="badge" style={{ padding: '4px 8px', backgroundColor: '#FFD700', borderRadius: '4px', color: '#333', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Segment: {profile.segment || 'BRONZE'}
                </span>
              </div>
            )}
          </div>
          
          {loading && <div className="loading">Loading profile info...</div>}
          {error && <div className="error">Error: {error}</div>}

          {!loading && !error && (
            <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="auth-input"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={profile.surname}
                  onChange={handleChange}
                  placeholder="Enter your surname"
                  className="auth-input"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Email (Read-only)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="auth-input"
                  style={{ width: '100%', padding: '10px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="auth-input"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Address</label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Enter your delivery address"
                  className="auth-input"
                  rows="3"
                  style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                />
              </div>



              <button 
                type="submit" 
                className="primary-btn" 
                disabled={saving}
                style={{ width: '100%', padding: '12px' }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
