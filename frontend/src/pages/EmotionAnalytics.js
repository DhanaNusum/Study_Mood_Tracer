import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, getStudyLogs } from '../services/api';
import Navbar from '../components/Navbar';
import WeeklyTrendChart from '../components/WeeklyTrendChart';
import SubjectMoodChart from '../components/SubjectMoodChart';
import SmartSuggestions from '../components/SmartSuggestions';
import { gsap } from 'gsap';
import './EmotionAnalytics.css';

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

const EmotionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  // GSAP refs
  const containerRef = useRef(null);
  const tabRefs = useRef([]);
  const chartRefs = useRef([]);
  const statCardRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, logsData] = await Promise.all([
          getAnalytics(),
          getStudyLogs()
        ]);
        setAnalytics(analyticsData);
        setLogs(logsData);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // GSAP Animations
  useEffect(() => {
    // Animate container entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }

    // Animate stat cards
    statCardRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(ref,
          { opacity: 0, scale: 0.8, y: 20 },
          { opacity: 1, scale: 1, y: 0, duration: 0.5, delay: index * 0.1, ease: "back.out(1.7)" }
        );
      }
    });

    // Animate charts
    chartRefs.current.forEach((ref, index) => {
      if (ref) {
        gsap.fromTo(ref,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.3 + index * 0.2, ease: "power2.out" }
        );
      }
    });
  }, [analytics, activeTab]);

  // Tab animation
  const handleTabChange = (tab) => {
    const tabIndex = ['overview', 'trends', 'subjects', 'insights'].indexOf(tab);
    
    // Animate tab content
    tabRefs.current.forEach((ref, index) => {
      if (ref) {
        if (index === tabIndex) {
          gsap.fromTo(ref,
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
          );
        }
      }
    });

    setActiveTab(tab);
  };

  const getEmotionEmoji = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.emoji : '';
  };

  const getEmotionColor = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.color : '#666';
  };

  // Calculate subject-wise emotion stats
  const getSubjectEmotionStats = () => {
    if (!analytics?.subjectEmotions) return {};

    const subjectStats = {};
    analytics.subjectEmotions.forEach(item => {
      if (!subjectStats[item.subject]) {
        subjectStats[item.subject] = {};
      }
      subjectStats[item.subject][item.emotion] = {
        count: item.count,
        avgScore: item.avgScore
      };
    });
    return subjectStats;
  };

  const subjectStats = getSubjectEmotionStats();

  const renderOverview = () => (
    <div ref={el => tabRefs.current[0] = el}>
      <div className="stats-grid">
        <div className="stat-card" ref={el => statCardRefs.current[0] = el}>
          <h3 style={{ color: 'white' }}>{analytics?.totalSessions || 0}</h3>
          <p style={{ color: 'white' }}>Total Sessions</p>
        </div>
        <div className="stat-card" ref={el => statCardRefs.current[1] = el}>
          <h3 style={{ color: 'white' }}>{Object.keys(subjectStats).length}</h3>
          <p style={{ color: 'white' }}>Subjects Tracked</p>
        </div>
        <div className="stat-card" ref={el => statCardRefs.current[2] = el}>
          <h3 style={{ color: 'white' }}>{analytics?.streak || analytics?.currentStreak || 0}</h3>
          <p style={{ color: 'white' }}>Day Streak 🔥</p>
        </div>
        <div className="stat-card" ref={el => statCardRefs.current[3] = el}>
          <h3 style={{ color: 'white' }}>{logs.length > 0 ? Math.round(logs.reduce((acc, log) => acc + (log.duration || 0), 0) / logs.length) : 0}</h3>
          <p style={{ color: 'white' }}>Avg Duration (min)</p>
        </div>
      </div>

      <div className="chart-container" ref={el => chartRefs.current[0] = el}>
        <h2>Weekly Emotion Trend</h2>
        <WeeklyTrendChart data={analytics?.weeklyTrend || []} />
      </div>

      <div className="chart-container" ref={el => chartRefs.current[1] = el}>
        <h2>Subject-wise Emotion Distribution</h2>
        <SubjectMoodChart data={analytics?.subjectEmotions || []} />
      </div>
    </div>
  );

  const renderSubjectAnalysis = () => (
    <div ref={el => tabRefs.current[2] = el}>
      <h2 style={{ color: '#333' }}>Subject-wise Emotion Analysis</h2>
      {Object.keys(subjectStats).length > 0 ? (
        Object.entries(subjectStats).map(([subject, emotions]) => (
          <div key={subject} className="subject-analysis-card">
            <h3 style={{ color: '#667eea', marginBottom: '16px' }}>{subject}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {Object.entries(emotions).map(([emotion, data]) => (
                <div key={emotion} className="emotion-stat">
                  <div className="emotion-header">
                    <span className="emotion-emoji">{getEmotionEmoji(emotion)}</span>
                    <span className="emotion-name" style={{ color: 'black', fontSize: '14px', fontWeight: 'bold' }}>{emotion}</span>
                  </div>
                  <div className="emotion-metrics">
                    <div className="metric">
                      <span className="metric-value" style={{ color: 'black', fontSize: '16px', fontWeight: 'bold' }}>{data.count}</span>
                      <span className="metric-label" style={{ color: 'black', fontSize: '12px' }}>Sessions</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value" style={{ color: getEmotionColor(emotion), fontSize: '16px', fontWeight: 'bold' }}>
                        {data.avgScore?.toFixed(1) || '0.0'}/10
                      </span>
                      <span className="metric-label" style={{ color: 'black', fontSize: '12px' }}>Avg Score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No subject data available</p>
      )}
    </div>
  );

  const renderInsights = () => (
    <div ref={el => tabRefs.current[3] = el}>
      <SmartSuggestions analytics={analytics} logs={logs} />
    </div>
  );

  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container" ref={containerRef}>
        <div className="card">
          <h1 style={{ marginBottom: '32px', color: '#333' }}>📊 Emotion Analytics</h1>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              📈 Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => handleTabChange('trends')}
            >
              📈 Trends
            </button>
            <button
              className={`tab-button ${activeTab === 'subjects' ? 'active' : ''}`}
              onClick={() => handleTabChange('subjects')}
            >
              📚 Subjects
            </button>
            <button
              className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => handleTabChange('insights')}
            >
              💡 Insights
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'trends' && (
              <div ref={el => tabRefs.current[1] = el}>
                <div className="chart-container" ref={el => chartRefs.current[2] = el}>
                  <h2>Weekly Emotion Trend</h2>
                  <WeeklyTrendChart data={analytics?.weeklyTrend || []} />
                </div>
              </div>
            )}
            {activeTab === 'subjects' && renderSubjectAnalysis()}
            {activeTab === 'insights' && renderInsights()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalytics;
