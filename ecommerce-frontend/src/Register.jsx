import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const REGISTER_API = 'http://localhost:8081/auth/register';



function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(REGISTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        setToast({ message: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...', type: 'success' });
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      setToast({ message: 'Kayıt başarısız oldu: ' + response.status, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: 'Bağlantı hatası: ' + err.message, type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="example@mail.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
