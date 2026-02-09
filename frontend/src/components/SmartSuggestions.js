import React, { useMemo } from 'react';

const SmartSuggestions = ({ analytics, logs }) => {
  const suggestions = useMemo(() => {
    const suggestionsList = [];

    if (!analytics || !logs || logs.length === 0) {
      return [
        {
          type: 'info',
          message: 'Start logging your study sessions to get personalized suggestions!',
        },
      ];
    }

    // Suggestion 1: Check for high stress levels
    if (analytics.subjectEmotions && analytics.subjectEmotions.length > 0) {
      const subjectTotals = {};
      const subjectStressed = {};

      analytics.subjectEmotions.forEach((item) => {
        if (!subjectTotals[item.subject]) {
          subjectTotals[item.subject] = 0;
          subjectStressed[item.subject] = 0;
        }
        subjectTotals[item.subject] += item.count;
        if (item.emotion === 'Stressed') {
          subjectStressed[item.subject] += item.count;
        }
      });

      Object.keys(subjectTotals).forEach((subject) => {
        const stressedPercentage = (subjectStressed[subject] / subjectTotals[subject]) * 100;
        if (stressedPercentage > 60) {
          suggestionsList.push({
            type: 'warning',
            message: `You seem stressed while studying ${subject} (${stressedPercentage.toFixed(1)}% of sessions). Consider shorter sessions or taking more breaks.`,
          });
        }
      });
    }

    // Suggestion 2: Check for high focus levels in morning
    if (analytics.timeAnalysis && analytics.timeAnalysis.length > 0) {
      const morningFocused = analytics.timeAnalysis.filter(
        (item) => item.hour >= 6 && item.hour < 12 && item.emotion === 'Focused'
      );
      const afternoonFocused = analytics.timeAnalysis.filter(
        (item) => item.hour >= 12 && item.hour < 18 && item.emotion === 'Focused'
      );
      const eveningFocused = analytics.timeAnalysis.filter(
        (item) => item.hour >= 18 && item.emotion === 'Focused'
      );

      const morningScore = morningFocused.reduce((sum, item) => sum + (item.avgScore * item.count), 0);
      const afternoonScore = afternoonFocused.reduce((sum, item) => sum + (item.avgScore * item.count), 0);
      const eveningScore = eveningFocused.reduce((sum, item) => sum + (item.avgScore * item.count), 0);

      const totalScore = morningScore + afternoonScore + eveningScore;
      if (totalScore > 0) {
        const morningPercentage = (morningScore / totalScore) * 100;
        if (morningPercentage > 50) {
          suggestionsList.push({
            type: 'success',
            message: 'You are most focused in the morning! Try scheduling difficult subjects earlier in the day.',
          });
        }
      }
    }

    // Suggestion 3: Check for late-night study sessions (11 PM - 2 AM)
    if (logs && logs.length > 0) {
      const lateNightSessions = logs.filter((log) => {
        const studyHour = new Date(log.study_time).getHours();
        return studyHour >= 23 || studyHour < 2; // 11 PM to 2 AM
      });

      if (lateNightSessions.length > 0) {
        const lateNightTiredSessions = lateNightSessions.filter((log) =>
          log.emotions.some((emotion) => emotion.emotion === 'Tired' && emotion.score > 5)
        );

        const lateNightTiredPercentage = (lateNightTiredSessions.length / lateNightSessions.length) * 100;
        
        if (lateNightTiredPercentage > 50) {
          suggestionsList.push({
            type: 'warning',
            message: 'Late-night study sessions may reduce focus. Consider studying earlier in the day for better productivity.',
          });
        }
      }
    }

    // Suggestion 4: Check overall emotional balance
    if (analytics.subjectEmotions && analytics.subjectEmotions.length > 0) {
      const positiveEmotions = ['Happy', 'Excited', 'Confident', 'Calm', 'Focused'];
      const negativeEmotions = ['Stressed', 'Anxious', 'Frustrated'];

      const totalPositive = analytics.subjectEmotions
        .filter((item) => positiveEmotions.includes(item.emotion))
        .reduce((sum, item) => sum + (item.avgScore * item.count), 0);

      const totalNegative = analytics.subjectEmotions
        .filter((item) => negativeEmotions.includes(item.emotion))
        .reduce((sum, item) => sum + (item.avgScore * item.count), 0);

      const totalSessions = analytics.totalSessions || 0;

      if (totalSessions > 0) {
        const positiveAvg = totalPositive / totalSessions;
        const negativeAvg = totalNegative / totalSessions;

        if (positiveAvg > 6) {
          suggestionsList.push({
            type: 'success',
            message: `Great emotional balance! Your average positive emotion score is ${positiveAvg.toFixed(1)}/10. Keep up the good work!`,
          });
        } else if (negativeAvg > 5) {
          suggestionsList.push({
            type: 'warning',
            message: `Your average negative emotion score is ${negativeAvg.toFixed(1)}/10. Consider stress management techniques and regular breaks.`,
          });
        }
      }
    }

    // Suggestion 5: Check for boredom patterns
    if (analytics.subjectEmotions && analytics.subjectEmotions.length > 0) {
      const boredSubjects = analytics.subjectEmotions
        .filter((item) => item.emotion === 'Bored' && item.avgScore > 5)
        .map((item) => item.subject);

      if (boredSubjects.length > 0) {
        suggestionsList.push({
          type: 'info',
          message: `You seem bored with ${boredSubjects.join(', ')}. Try new study methods or break down topics into smaller, engaging tasks.`,
        });
      }
    }

    // Default suggestion if no specific patterns found
    if (suggestionsList.length === 0 && logs.length > 0) {
      suggestionsList.push({
        type: 'info',
        message: 'Keep tracking your study sessions to discover patterns and improve your study habits!',
      });
    }

    return suggestionsList;
  }, [analytics, logs]);

  if (suggestions.length === 0) {
    return null;
  }

  const getSuggestionStyle = (type) => {
    const styles = {
      success: { borderLeft: '4px solid #28a745', background: '#d4edda' },
      warning: { borderLeft: '4px solid #ffc107', background: '#fff3cd' },
      info: { borderLeft: '4px solid #17a2b8', background: '#d1ecf1' },
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="card">
      <div className="suggestions-container">
        <h3>💡 Smart Study Suggestions</h3>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="suggestion-item"
            style={getSuggestionStyle(suggestion.type)}
          >
            <p>{suggestion.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartSuggestions;
