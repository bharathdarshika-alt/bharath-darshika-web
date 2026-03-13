import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('isAdmin') === 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = () => {
    const securePassword = process.env.REACT_APP_ADMIN_PASSWORD;

    if (pass === securePassword) {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      alert('తప్పుడు పాస్‌వర్డ్ బొస్సు! మళ్ళీ ప్రయత్నించు. ❌');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <span style={{fontSize: '30px'}}>🔒</span>
        </div>
        <h2 style={styles.title}>Admin Access</h2>
        <p style={styles.subtitle}>సీక్రెట్ కోడ్ ఎంటర్ చెయ్యి బాస్!</p>
        
        <div style={styles.inputWrapper}>
          <input
            type="password"
            placeholder="Enter Secret Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.input}
            autoFocus
          />
        </div>

        <button onClick={handleLogin} style={styles.btn}>
          UNLOCK DASHBOARD 🚀
        </button>
        
        <button onClick={() => navigate('/')} style={styles.backLink}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0F4C81',
    fontFamily: "sans-serif",
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    backgroundColor: '#FFF7ED',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px',
  },
  title: { fontSize: '24px', fontWeight: '800', color: '#1E293B', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#64748B', marginBottom: '30px' },
  inputWrapper: { position: 'relative', marginBottom: '20px' },
  input: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#FF7A00',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)',
  },
  backLink: {
    marginTop: '20px',
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  }
};