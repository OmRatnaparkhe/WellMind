import { useState, useEffect } from 'react';
import { apiGet } from '../lib/api';

type WellnessScoreData = {
  id: string;
  userId: string;
  weekOf: string;
  overallScore: number;
  moodScore: number;
  // stressScore: number; // unused
  sleepScore: number; // repurposed as checklist score
  // socialScore: number; // unused
  cognitiveScore: number;
  recommendations: string[];
  createdAt: string;
  updatedAt: string;
};

const WellnessScore = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wellnessData, setWellnessData] = useState<WellnessScoreData | null>(null);

  useEffect(() => {
    const fetchWellnessScore = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/wellness/current');
        setWellnessData(data as WellnessScoreData);
        setError('');
      } catch (err) {
        console.error('Error fetching wellness score:', err);
        setError('Failed to load your wellness score. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWellnessScore();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const renderScoreBar = (score: number, label: string) => {
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className={`text-sm font-medium ${getScoreColor(score)}`}>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className={`h-2.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Wellness Score</h3>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!wellnessData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Wellness Score</h3>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
          No wellness data available yet. Complete your daily activities to generate your first wellness score.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Weekly Wellness Score</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Week of {new Date(wellnessData.weekOf).toLocaleDateString()}
        </div>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="3"
              strokeDasharray="100, 100"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={wellnessData.overallScore >= 80 ? '#10B981' : wellnessData.overallScore >= 60 ? '#3B82F6' : wellnessData.overallScore >= 40 ? '#F59E0B' : '#EF4444'}
              strokeWidth="3"
              strokeDasharray={`${wellnessData.overallScore}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className={`text-3xl font-bold ${getScoreColor(wellnessData.overallScore)}`}>{wellnessData.overallScore}</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm block">{getScoreLabel(wellnessData.overallScore)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        {renderScoreBar(wellnessData.moodScore, 'Mood')}
        {renderScoreBar(wellnessData.sleepScore, 'Checklist Completion')}
        {renderScoreBar(wellnessData.cognitiveScore, 'Cognitive Function')}
      </div>

      {wellnessData.recommendations && wellnessData.recommendations.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-800 dark:text-white mb-2">Recommendations</h4>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {wellnessData.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WellnessScore;