import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StudyTimer from '../components/StudyTimer';
import Navbar from '../components/Navbar';

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

const StudyTimerPage = () => {
  const [subject, setSubject] = useState('');
  const [emotions, setEmotions] = useState([]);
  const [currentStep, setCurrentStep] = useState('setup'); // 'setup', 'emotion', 'score', 'timer'
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [currentScore, setCurrentScore] = useState(5);
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setCurrentStep('score');
  };

  const handleScoreConfirm = () => {
    if (selectedEmotion && currentScore > 0) {
      setEmotions([...emotions, { emotion: selectedEmotion, score: currentScore }]);
      setSelectedEmotion('');
      setCurrentScore(5);
      setCurrentStep('setup');
    }
  };

  const handleStart = () => {
    setShowForm(false);
    setCurrentStep('timer');
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  const removeEmotion = (emotionToRemove) => {
    setEmotions(emotions.filter(e => e.emotion !== emotionToRemove));
  };

  const getEmotionEmoji = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.emoji : '';
  };

  const getEmotionColor = (emotionName) => {
    const emotionData = EMOTIONS.find(e => e.name === emotionName);
    return emotionData ? emotionData.color : '#666';
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (currentStep === 'timer' && !showForm) {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <StudyTimer
              subject={subject || undefined}
              emotions={emotions}
              onComplete={handleComplete}
              onCancel={() => {
                setShowForm(true);
                setCurrentStep('setup');
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'emotion') {
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h1 style={{ marginBottom: '24px', color: '#333' }}>Select Emotion for Timer</h1>
            <div className="emotions-grid">
              {EMOTIONS.filter(e => !emotions.some(selected => selected.emotion === e.name)).map((emotion) => (
                <button
                  key={emotion.name}
                  type="button"
                  className="emotion-card"
                  onClick={() => handleEmotionSelect(emotion.name)}
                  style={{
                    borderColor: getEmotionColor(emotion.name),
                    backgroundColor: getEmotionColor(emotion.name) + '10'
                  }}
                >
                  <div className="emotion-emoji-large">{emotion.emoji}</div>
                  <div className="emotion-name">{emotion.name}</div>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep('setup')}
              style={{ marginTop: '20px' }}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'score') {
    const emotionData = EMOTIONS.find(e => e.name === selectedEmotion);
    return (
      <div>
        <Navbar />
        <div className="container">
          <div className="card">
            <h1 style={{ marginBottom: '24px', color: '#333' }}>Rate Your Emotion</h1>
            <div className="score-step-container">
              <div className="emotion-display" style={{ borderColor: getEmotionColor(selectedEmotion) }}>
                <span className="emotion-emoji-large">{emotionData?.emoji}</span>
                <span className="emotion-name-large">{selectedEmotion}</span>
              </div>
              <div className="score-slider-container">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentScore}
                  onChange={(e) => setCurrentScore(parseInt(e.target.value))}
                  className="emotion-range-slider"
                  style={{
                    background: `linear-gradient(to right, ${getEmotionColor(selectedEmotion)} 0%, ${getEmotionColor(selectedEmotion)} ${currentScore * 10}%, #ddd ${currentScore * 10}%, #ddd 100%)`
                  }}
                />
                <div className="score-display">
                  <span className="score-number">{currentScore}</span>
                  <span className="score-label">out of 10</span>
                </div>
                <div className="score-labels">
                  <span>Very Mild</span>
                  <span>Moderate</span>
                  <span>Very Strong</span>
                </div>
              </div>
              <div className="score-buttons">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep('emotion')}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleScoreConfirm}
                >
                  Confirm Score →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: '24px', color: '#333' }}>Study Timer (Pomodoro)</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            25 min focus / 5 min break. Sessions are auto-logged when each Pomodoro completes.
          </p>
          
          <div className="form-group">
            <label htmlFor="timer-subject">Subject (optional)</label>
            <input
              type="text"
              id="timer-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
            />
          </div>

          <div className="form-group">
            <label>How are you feeling? (Optional)</label>
            <div className="selected-emotions" style={{ minHeight: '60px', padding: '16px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #dee2e6', marginBottom: '16px' }}>
              {emotions.length === 0 ? (
                <span style={{ color: '#999' }}>No emotions selected. Timer will use default settings.</span>
              ) : (
                emotions.map((emotion) => (
                  <div key={emotion.emotion} className="selected-emotion-chip">
                    <span className="emotion-emoji">{getEmotionEmoji(emotion.emotion)}</span>
                    <span className="emotion-name">{emotion.emotion}</span>
                    <span className="emotion-score" style={{ color: getEmotionColor(emotion.emotion) }}>
                      {emotion.score}/10
                    </span>
                    <button
                      type="button"
                      className="remove-emotion"
                      onClick={() => removeEmotion(emotion.emotion)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCurrentStep('emotion')}
              disabled={emotions.length >= EMOTIONS.length}
            >
              + Add Emotion
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn btn-primary" onClick={handleStart}>
              Start Timer
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimerPage;
