import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/apiUtils';



export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('http://localhost:8081/users/admin');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (email, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`${email} kullanıcısının rolü ${newRole} olarak değiştirilsin mi?`)) return;

    try {
      await fetchWithAuth(`http://localhost:8081/users/${email}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      loadUsers();
    } catch (err) {
      alert('Rol güncellenirken hata: ' + err.message);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await fetchWithAuth(`http://localhost:8081/users/${email}`, {
        method: 'DELETE'
      });
      loadUsers();
    } catch (err) {
      alert('Kullanıcı silinirken hata: ' + err.message);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div className="admin-content-section">
      <div className="admin-header">
        <h3>User Management</h3>
        <div className="order-stats">Active Users: {users.length}</div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Segment</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.email} className={user.status === 'DELETED' ? 'row-deleted-product' : ''}>
              <td>{user.email}</td>
              <td>{[user.name, user.surname].filter(Boolean).join(' ') || 'N/A'}</td>
              <td>
                <span className={`segment-badge ${user.segment}`}>
                  {user.segment}
                </span>
              </td>
              <td>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td>
                <span className={`product-status-badge ${user.status || 'ACTIVE'}`}>
                  {user.status || 'ACTIVE'}
                </span>
              </td>
              <td className="admin-table-actions">
                <button 
                  className="secondary-btn btn-xs" 
                  onClick={() => handleRoleToggle(user.email, user.role)}
                  disabled={user.status === 'DELETED'}
                >
                   Toggle Role
                </button>
                <button 
                  className="delete-mini" 
                  onClick={() => handleDeleteUser(user.email)}
                  title="Delete User"
                  disabled={user.status === 'DELETED'}
                  style={{ opacity: user.status === 'DELETED' ? 0.3 : 1 }}
                >
                   🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
