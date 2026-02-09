import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addStudyLog, getFavorites, toggleFavorite } from '../services/api';
import Navbar from '../components/Navbar';
import { gsap } from 'gsap';

const SUGGESTED_TAGS = ['exam prep', 'revision', 'homework', 'project', 'lecture', 'practice'];

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

const AddStudyEntry = () => {
  const [subject, setSubject] = useState('');
  const [emotions, setEmotions] = useState([]);
  const [currentStep, setCurrentStep] = useState('subject'); // 'subject', 'emotion', 'score', 'confirm'
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [currentScore, setCurrentScore] = useState(5);
  const [duration, setDuration] = useState('');
  const [studyTime, setStudyTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // GSAP refs
  const progressRef = useRef(null);
  const stepRefs = useRef([]);
  const emotionCardRefs = useRef([]);
  const scoreSliderRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(() => setFavorites([]));
  }, []);

  // GSAP Animations
  useEffect(() => {
    // Animate progress steps
    if (progressRef.current) {
      gsap.fromTo(progressRef.current.children, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
      );
    }

    // Animate current step
    const currentStepIndex = ['subject', 'emotion', 'score', 'confirm', 'details'].indexOf(currentStep);
    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        if (index === currentStepIndex) {
          gsap.fromTo(ref, 
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
          );
        }
      }
    });

    // Animate emotion cards
    if (currentStep === 'emotion') {
      emotionCardRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(ref,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3, delay: index * 0.05, ease: "back.out(1.7)" }
          );
        }
      });
    }

    // Animate score slider
    if (currentStep === 'score' && scoreSliderRef.current) {
      gsap.fromTo(scoreSliderRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentStep]);

  const addTag = (tag) => {
    const t = (tag || tagInput).trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const handleEmotionSelect = (emotion) => {
    // Animate card selection
    const cardIndex = EMOTIONS.findIndex(e => e.name === emotion);
    if (emotionCardRefs.current[cardIndex]) {
      gsap.to(emotionCardRefs.current[cardIndex], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
    
    setTimeout(() => {
      setSelectedEmotion(emotion);
      setCurrentStep('score');
    }, 200);
  };

  const handleScoreConfirm = () => {
    if (selectedEmotion && currentScore > 0) {
      setEmotions([...emotions, { emotion: selectedEmotion, score: currentScore }]);
      setSelectedEmotion('');
      setCurrentScore(5);
      setCurrentStep('confirm');
    }
  };

  const handleAddAnotherEmotion = () => {
    setCurrentStep('emotion');
  };

  const handleFinishEmotions = () => {
    setCurrentStep('details');
  };

  const removeEmotion = (emotionToRemove) => {
    setEmotions(emotions.filter(e => e.emotion !== emotionToRemove));
  };

  const handleEmotionCardHover = (index, isEntering) => {
    if (emotionCardRefs.current[index]) {
      gsap.to(emotionCardRefs.current[index], {
        scale: isEntering ? 1.05 : 1,
        duration: 0.2,
        ease: "power2.out"
      });
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

  const handleFavoriteSelect = (s) => setSubject(s);

  const handleToggleFavorite = () => {
    if (!subject.trim()) return;
    toggleFavorite(subject.trim()).then(res => setFavorites(res.favoriteSubjects || [])).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || emotions.length === 0) {
      setError('Subject and at least one emotion are required');
      return;
    }

    setLoading(true);

    try {
      await addStudyLog({
        subject,
        emotions,
        duration: duration ? parseInt(duration) : null,
        study_time: studyTime,
        notes: notes.trim() || undefined,
        tags: tags.length ? tags : undefined,
      });

      setSuccess('Study entry added successfully!');
      setSubject('');
      setEmotions([]);
      setCurrentStep('subject');
      setSelectedEmotion('');
      setCurrentScore(5);
      setDuration('');
      setNotes('');
      setTags([]);
      setStudyTime(new Date().toISOString().slice(0, 16));

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add study entry');
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectStep = () => (
    <div className="form-group">
      <label htmlFor="subject">Subject *</label>
      <div className="subject-input-row">
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="e.g., Mathematics, Physics, Chemistry"
        />
        <button
          type="button"
          className="btn btn-secondary btn-icon"
          onClick={handleToggleFavorite}
          title={favorites.some(f => f.toLowerCase() === subject.trim().toLowerCase()) ? 'Remove from favorites' : 'Add to favorites'}
        >
          {favorites.some(f => f.toLowerCase() === subject.trim().toLowerCase()) ? '★' : '☆'}
        </button>
      </div>
      {favorites.length > 0 && (
        <div className="favorite-chips">
          {favorites.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${subject === f ? 'chip-active' : ''}`}
              onClick={() => handleFavoriteSelect(f)}
            >
              ⭐ {f}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setCurrentStep('emotion')}
        disabled={!subject.trim()}
        style={{ marginTop: '16px' }}
      >
        Next →
      </button>
    </div>
  );

  const renderEmotionStep = () => (
    <div className="form-group" ref={el => stepRefs.current[1] = el}>
      <label>How are you feeling? Select one emotion *</label>
      <div className="emotions-grid">
        {EMOTIONS.filter(e => !emotions.some(selected => selected.emotion === e.name)).map((emotion, index) => (
          <button
            key={emotion.name}
            type="button"
            className="emotion-card"
            ref={el => emotionCardRefs.current[index] = el}
            onClick={() => handleEmotionSelect(emotion.name)}
            onMouseEnter={() => handleEmotionCardHover(index, true)}
            onMouseLeave={() => handleEmotionCardHover(index, false)}
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
    </div>
  );

  const renderScoreStep = () => {
    const emotionData = EMOTIONS.find(e => e.name === selectedEmotion);
    return (
      <div className="form-group" ref={el => stepRefs.current[2] = el}>
        <label>
          How strongly are you feeling {emotionData?.emoji} {selectedEmotion}? *
        </label>
        <div className="score-step-container" ref={scoreSliderRef}>
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
    );
  };

  const renderConfirmStep = () => (
    <div className="form-group">
      <label>Emotions Added</label>
      <div className="selected-emotions">
        {emotions.map((emotion) => (
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
        ))}
      </div>
      <div className="confirm-buttons">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddAnotherEmotion}
          disabled={emotions.length >= EMOTIONS.length}
        >
          + Add Another Emotion
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleFinishEmotions}
        >
          ✓ Continue to Details
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef}>
      <Navbar />
      <div className="container">
        <div className="card">
          <h1 style={{ marginBottom: '24px', color: '#333' }}>Add Study Entry</h1>

          {/* Progress Indicator */}
          <div className="progress-indicator" ref={progressRef}>
            <div className={`progress-step ${currentStep === 'subject' ? 'active' : 'completed'}`}>
              <div className="step-number">1</div>
              <div className="step-label">Subject</div>
            </div>
            <div className={`progress-step ${currentStep === 'emotion' || currentStep === 'score' || currentStep === 'confirm' ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Emotions</div>
            </div>
            <div className={`progress-step ${currentStep === 'details' ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Details</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Subject */}
            {currentStep === 'subject' && (
              <div ref={el => stepRefs.current[0] = el}>
                {renderSubjectStep()}
              </div>
            )}

            {/* Step 2: Emotion Selection */}
            {currentStep === 'emotion' && renderEmotionStep()}

            {/* Step 3: Score Selection */}
            {currentStep === 'score' && renderScoreStep()}

            {/* Step 4: Confirm/Add More Emotions */}
            {currentStep === 'confirm' && (
              <div ref={el => stepRefs.current[3] = el}>
                {renderConfirmStep()}
              </div>
            )}

            {/* Step 5: Additional Details */}
            {currentStep === 'details' && (
              <div ref={el => stepRefs.current[4] = el}>
                {renderDetailsStep()}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

const renderDetailsStep = () => (
  <>
    <div className="form-group">
      <label htmlFor="studyTime">Study Time</label>
      <input
        type="datetime-local"
        id="studyTime"
        value={studyTime}
        onChange={(e) => setStudyTime(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label htmlFor="duration">Duration (minutes) - Optional</label>
      <input
        type="number"
        id="duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        min="1"
        placeholder="e.g., 60"
      />
    </div>

    <div className="form-group">
      <label htmlFor="notes">Notes - Optional</label>
      <textarea
        id="notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="Add a short note about this session..."
        className="form-control"
      />
      <small style={{ color: '#999' }}>{notes.length}/500</small>
    </div>

    <div className="form-group">
      <label>Tags - Optional</label>
      <div className="tag-input-row">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="e.g., exam prep, revision"
          list="suggested-tags"
        />
        <button type="button" className="btn btn-secondary" onClick={() => addTag()}>
          Add
        </button>
      </div>
      <datalist id="suggested-tags">
        {SUGGESTED_TAGS.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
      {tags.length > 0 && (
        <div className="tag-chips">
          {tags.map((t) => (
            <span key={t} className="chip">
              {t}
              <button type="button" className="chip-remove" onClick={() => removeTag(t)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>

    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Adding...' : 'Add Entry'}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setCurrentStep('confirm')}
      >
        ← Back to Emotions
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => navigate('/dashboard')}
      >
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => navigate('/timer')}
      >
        Open Timer
      </button>
    </div>
  </>
);

export default AddStudyEntry;
