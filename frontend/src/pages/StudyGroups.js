import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStudyGroups,
  getStudyGroup,
  createStudyGroup,
  inviteToGroup,
  leaveStudyGroup,
} from '../services/api';
import Navbar from '../components/Navbar';

const StudyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadGroups();
  }, [user, navigate]);

  const loadGroups = async () => {
    try {
      const data = await getStudyGroups();
      setGroups(data);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setSuccess('');
    try {
      await createStudyGroup(newName.trim(), newDesc.trim());
      setSuccess('Group created!');
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    }
  };

  const handleSelectGroup = async (id) => {
    try {
      const g = await getStudyGroup(id);
      setSelectedGroup(g);
      setInviteEmail('');
    } catch (err) {
      setError('Failed to load group');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedGroup) return;
    setError('');
    setSuccess('');
    try {
      await inviteToGroup(selectedGroup._id, inviteEmail.trim());
      setSuccess('Invitation sent!');
      setInviteEmail('');
      handleSelectGroup(selectedGroup._id);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to invite');
    }
  };

  const handleLeave = async () => {
    if (!selectedGroup || !window.confirm('Leave this group?')) return;
    try {
      await leaveStudyGroup(selectedGroup._id);
      setSelectedGroup(null);
      loadGroups();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave');
    }
  };

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1 style={{ marginBottom: '24px', color: '#333' }}>Study Groups</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading ? (
          <div className="card"><p>Loading...</p></div>
        ) : (
          <>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0 }}>My Groups</h2>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                  {showCreate ? 'Cancel' : 'Create Group'}
                </button>
              </div>

              {showCreate && (
                <form onSubmit={handleCreate} style={{ marginBottom: 24, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
                  <div className="form-group">
                    <label>Group Name *</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g., CS Study Group"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                      type="text"
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Brief description"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Create</button>
                </form>
              )}

              {groups.length === 0 ? (
                <p style={{ color: '#666' }}>No groups yet. Create one or get invited!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {groups.map((g) => (
                    <div
                      key={g._id}
                      className="group-item"
                      onClick={() => handleSelectGroup(g._id)}
                      style={{
                        padding: 16,
                        border: selectedGroup?._id === g._id ? '2px solid #667eea' : '1px solid #ddd',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selectedGroup?._id === g._id ? '#f5f3ff' : 'white',
                      }}
                    >
                      <strong>{g.name}</strong>
                      {g.description && <p style={{ margin: '4px 0 0', color: '#666', fontSize: 14 }}>{g.description}</p>}
                      <small style={{ color: '#999' }}>{g.members?.length || 0} members</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedGroup && (
              <div className="card">
                <h2>{selectedGroup.name}</h2>
                {selectedGroup.description && <p style={{ color: '#666' }}>{selectedGroup.description}</p>}

                <h3 style={{ marginTop: 20 }}>Members & Progress</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Sessions (7d)</th>
                      <th style={{ padding: 8, textAlign: 'left' }}>Minutes (7d)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGroup.members?.map((m) => (
                      <tr key={m.user?._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: 8 }}>
                          {m.user?.name} {String(m.user?._id) === String(user?.id) && '(you)'}
                        </td>
                        <td style={{ padding: 8 }}>{m.progress?.totalSessions ?? 0}</td>
                        <td style={{ padding: 8 }}>{m.progress?.totalMinutes ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <form onSubmit={handleInvite} style={{ marginTop: 24 }}>
                  <label>Invite by email</label>
                  <div className="tag-input-row">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="friend@example.com"
                    />
                    <button type="submit" className="btn btn-secondary">Invite</button>
                  </div>
                </form>

                <button className="btn btn-danger" style={{ marginTop: 16 }} onClick={handleLeave}>
                  Leave Group
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;
