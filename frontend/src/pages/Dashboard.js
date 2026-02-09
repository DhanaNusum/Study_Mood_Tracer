import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudyLogs, getAnalytics, deleteStudyLog } from '../services/api';
import Navbar from '../components/Navbar';
import SmartSuggestions from '../components/SmartSuggestions';
import { gsap } from 'gsap';

const EMOTIONS = [
  { name: 'Happy', emoji: '😄', color: '#FFD700' },
  { name: 'Tired', emoji: '😴', color: '#87CEEB' },
  { name: 'Stressed', emoji: '😣', color: '#FF6B6B' },
  { name: 'Excited', emoji: '🤩', color: '#FF69B4' },
  { name: 'Anxious', emoji: '😰', color: '#DDA0DD' },
  { name: 'Focused', emoji: '🎯', color: '#98FB98' },
  { name: 'Bored', emoji: '😑', color: '#D3D3D3' },
  { name: 'Confident', emoji: '💪', color: '#FFA500' },
  { name: 'Frustrated', emoji: '😤', color: '#DC143C' },
  { name: 'Calm', emoji: '😌', color: '#40E0D0' }
];

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // GSAP refs
  const containerRef = useRef(null);
  const statCardRefs = useRef([]);
  const tableRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  // GSAP Animations
  useEffect(() => {
    // Animate container entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }

    // Animate stat cards
    statCardRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(ref,
          { opacity: 0, scale: 0.9, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.4, delay: index * 0.1, ease: "back.out(1.7)" }
        );
      }
    });

    // Animate table
    if (tableRef.current) {
      gsap.fromTo(tableRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" }
      );
    }

    // Animate suggestions
    if (suggestionsRef.current) {
      gsap.fromTo(suggestionsRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
      );
    }
  }, [analytics, logs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsData, analyticsData] = await Promise.all([
        getStudyLogs(),
        getAnalytics(),
      ]);
      setLogs(logsData);
      setAnalytics(analyticsData);
      console.log('Analytics data:', analyticsData); // Debug log
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteStudyLog(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const getEmotionEmoji = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.emoji : '';
  };

  const getEmotionColor = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.color : '#666';
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container" ref={containerRef}>
        <div className="card">
          <h1 style={{ marginBottom: '32px', color: '#333' }}>📚 Study Dashboard</h1>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" ref={el => statCardRefs.current[0] = el}>
              <h3 style={{ color: 'white' }}>{analytics?.totalSessions || 0}</h3>
              <p style={{ color: 'white' }}>Total Sessions</p>
            </div>
            <div className="stat-card" ref={el => statCardRefs.current[1] = el}>
              <h3 style={{ color: 'white' }}>{analytics?.streak || analytics?.currentStreak || 0}</h3>
              <p style={{ color: 'white' }}>Day Streak 🔥</p>
            </div>
            <div className="stat-card" ref={el => statCardRefs.current[2] = el}>
              <h3 style={{ color: 'white' }}>{logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + (log.duration || 0), 0) / logs.length) : 0}</h3>
              <p style={{ color: 'white' }}>Avg Duration (min)</p>
            </div>
          </div>

          {/* Recent Entries */}
          <div className="recent-entries" ref={tableRef}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Recent Study Entries</h2>
            {logs.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                No study entries yet. <a href="/add-entry" style={{ color: '#667eea' }}>Add your first entry!</a>
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Emotions</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Study Time</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Notes</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Tags</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 10).map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '12px' }}>{log.subject}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {log.emotions?.map((emotion) => (
                              <span key={emotion.emotion} className="emotion-chip">
                                {getEmotionEmoji(emotion.emotion)} {emotion.emotion} ({emotion.score}/10)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {new Date(log.study_time).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>{log.duration || '-'}</td>
                        <td style={{ padding: '12px' }}>{log.notes || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {log.tags?.map((tag) => (
                              <span key={tag} className="chip">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(log.id)}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Smart Suggestions */}
          <div ref={suggestionsRef}>
            <SmartSuggestions analytics={analytics} logs={logs} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
