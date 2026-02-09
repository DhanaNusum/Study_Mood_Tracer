import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const SubjectMoodChart = ({ data }) => {
  const chartData = useMemo(() => {
    // Group by subject
    const subjectData = {};
    data.forEach((item) => {
      if (!subjectData[item.subject]) {
        subjectData[item.subject] = {};
        EMOTIONS.forEach(emotion => {
          subjectData[item.subject][emotion.name] = 0;
        });
      }
      subjectData[item.subject][item.emotion] = item.avgScore || 0;
    });

    const subjects = Object.keys(subjectData);
    if (subjects.length === 0) {
      return null;
    }

    const datasets = EMOTIONS.map((emotion) => ({
      label: `${emotion.emoji} ${emotion.name}`,
      data: subjects.map((subject) => subjectData[subject][emotion.name] || 0),
      backgroundColor: emotion.color + '80',
      borderColor: emotion.color,
      borderWidth: 1,
    }));

    return {
      labels: subjects,
      datasets,
    };
  }, [data]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}/10`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Average Score (0-10)'
        }
      },
    },
  };

  if (!chartData) {
    return <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No data available</p>;
  }

  return <Bar data={chartData} options={options} />;
};

export default SubjectMoodChart;
