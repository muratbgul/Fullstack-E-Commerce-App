import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LOGIN_API = 'http://localhost:8081/auth/login';



function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(LOGIN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const receivedToken = data?.token || '';
        if (receivedToken) {
          localStorage.setItem('token', receivedToken);
        }
        navigate('/products');
        return;
      }

      let message = `Hata ${response.status}`;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          message = data?.message || data?.detail || JSON.stringify(data) || message;
        } else {
          const text = await response.text();
          message = text || message;
        }
      } catch {
      }
      setError(message);
    } catch (err) {
      setError('Sunucuya bağlanılamadı. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card">
        <h2>Login</h2>
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

          {error && (
            <div style={{
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '0.875rem',
              marginBottom: '12px'
            }}>
              ❌ {error}
            </div>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
