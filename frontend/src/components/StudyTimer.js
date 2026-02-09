import React, { useState, useEffect, useRef } from 'react';
import { addStudyLog } from '../services/api';
import { gsap } from 'gsap';
import './StudyTimer.css';

const POMODORO_WORK = 25; // minutes
const POMODORO_BREAK = 5; // minutes

const StudyTimer = ({ subject, emotions, onComplete, onCancel }) => {
  const [mode, setMode] = useState('work'); // work | break
  const [minutes, setMinutes] = useState(POMODORO_WORK);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedWork, setCompletedWork] = useState(0);
  const intervalRef = useRef(null);

  // GSAP refs
  const containerRef = useRef(null);
  const displayRef = useRef(null);
  const modeRef = useRef(null);

  const totalSeconds = minutes * 60 + seconds;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // GSAP Animations
  useEffect(() => {
    // Animate container entrance
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }

    // Animate display
    if (displayRef.current) {
      gsap.fromTo(displayRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
      );
    }

    // Animate mode change
    if (modeRef.current) {
      gsap.to(modeRef.current, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }
  }, [mode, totalSeconds]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s > 0) return s - 1;
          setMinutes(m => {
            if (m > 0) return m - 1;
            return 0;
          });
          return 59;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && minutes === 0 && seconds === 0) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      if (mode === 'work') {
        setCompletedWork(c => c + 1);
        setMode('break');
        setMinutes(POMODORO_BREAK);
        setSeconds(0);
        
        // Save study log with emotions
        const logData = {
          subject: subject || 'Study',
          emotions: emotions && emotions.length > 0 ? emotions : [
            { emotion: 'Focused', score: 7 } // Default emotion if none selected
          ],
          duration: POMODORO_WORK,
          notes: `Pomodoro session ${completedWork + 1}`,
          tags: ['pomodoro'],
        };
        
        addStudyLog(logData).catch(err => console.error('Failed to save session:', err));
      } else {
        setMode('work');
        setMinutes(POMODORO_WORK);
        setSeconds(0);
      }
    }
  }, [isRunning, minutes, seconds, mode, subject, emotions, completedWork]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setMinutes(POMODORO_WORK);
    setSeconds(0);
  };

  const getEmotionDisplay = () => {
    if (!emotions || emotions.length === 0) {
      return <span className="timer-emotions">🎯 Focused (default)</span>;
    }
    
    return (
      <div className="timer-emotions">
        {emotions.slice(0, 3).map((emotion, index) => (
          <span key={emotion.emotion} className="emotion-chip">
            {getEmotionEmoji(emotion.emotion)} {emotion.emotion} ({emotion.score}/10)
          </span>
        ))}
        {emotions.length > 3 && (
          <span className="emotion-more">+{emotions.length - 3} more</span>
        )}
      </div>
    );
  };

  const getEmotionEmoji = (emotionName) => {
    const emotionMap = {
      'Happy': '😄', 'Tired': '😴', 'Stressed': '😣',
      'Excited': '🤩', 'Anxious': '😰', 'Focused': '🎯',
      'Bored': '😑', 'Confident': '💪', 'Frustrated': '😤', 'Calm': '😌'
    };
    return emotionMap[emotionName] || '😊';
  };

  return (
    <div className="study-timer" ref={containerRef}>
      <h3>Pomodoro Timer</h3>
      <div className="timer-display" ref={displayRef}>{display}</div>
      <div className="timer-mode" ref={modeRef}>{mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}</div>
      {subject && <div className="timer-subject">Studying: {subject}</div>}
      
      {/* Display emotions */}
      <div className="timer-emotions-container">
        <div className="emotions-label">Current emotions:</div>
        {getEmotionDisplay()}
      </div>
      
      {completedWork > 0 && <p className="sessions-done">Completed {completedWork} session(s) today</p>}
      
      <div className="timer-actions">
        <button className="btn btn-primary" onClick={handleStartPause}>
          {isRunning ? '⏸️ Pause' : '▶️ Start'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>🔄 Reset</button>
      </div>
      
      {onCancel && (
        <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={onCancel}>
          ← Done
        </button>
      )}
      {onComplete && (
        <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onComplete}>
          📊 View Dashboard
        </button>
      )}
      
      {/* Timer tips based on emotions */}
      {emotions && emotions.length > 0 && (
        <div className="timer-tips">
          <div className="tips-label">💡 Study Tips:</div>
          {emotions.some(e => e.emotion === 'Tired' && e.score > 6) && (
            <div className="tip">😴 You're feeling tired - consider shorter sessions or more breaks</div>
          )}
          {emotions.some(e => e.emotion === 'Stressed' && e.score > 6) && (
            <div className="tip">😣 High stress detected - try deep breathing exercises during breaks</div>
          )}
          {emotions.some(e => e.emotion === 'Focused' && e.score > 7) && (
            <div className="tip">🎯 Great focus! This is perfect for complex topics</div>
          )}
          {emotions.some(e => e.emotion === 'Bored' && e.score > 6) && (
            <div className="tip">😑 Feeling bored? Try switching to a more engaging topic</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudyTimer;
