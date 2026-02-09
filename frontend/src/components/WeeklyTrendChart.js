import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO, startOfWeek, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

const WeeklyTrendChart = ({ data }) => {
  // Get last 7 days
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const daysOfWeek = eachDayOfInterval({
    start: weekStart,
    end: today,
  });

  // Process data for average scores
  const processedData = {};
  daysOfWeek.forEach((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    processedData[dayStr] = {};
    EMOTIONS.forEach(emotion => {
      processedData[dayStr][emotion.name] = { count: 0, avgScore: 0 };
    });
  });

  data.forEach((item) => {
    const dateStr = format(parseISO(item.date), 'yyyy-MM-dd');
    if (processedData[dateStr]) {
      processedData[dateStr][item.emotion] = {
        count: item.count,
        avgScore: item.avgScore || 0
      };
    }
  });

  const labels = daysOfWeek.map((day) => format(day, 'EEE (MMM dd)'));

  const datasets = EMOTIONS.map((emotion) => ({
    label: `${emotion.emoji} ${emotion.name}`,
    data: daysOfWeek.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      return processedData[dayStr]?.[emotion.name]?.avgScore || 0;
    }),
    borderColor: emotion.color,
    backgroundColor: emotion.color + '20',
    tension: 0.4,
  }));

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
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

  return <Line data={chartData} options={options} />;
};

export default WeeklyTrendChart;
