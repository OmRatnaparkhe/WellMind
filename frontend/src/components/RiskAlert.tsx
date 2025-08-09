import { useState, useEffect } from 'react';
import { apiGet } from '../lib/api';

type RiskAlert = {
  id: string;
  userId: string;
  type: 'journal' | 'mood' | 'mood_trend' | 'quiz' | 'other';
  source: 'journal_entry' | 'mood_entry' | 'mood_analysis' | 'quiz_result' | 'system';
  message: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
  createdAt: string;
};

const RiskAlertComponent = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const data = await apiGet('/alerts/unacknowledged');
        setAlerts(data as RiskAlert[]);
        setError('');
      } catch (err) {
        console.error('Error fetching risk alerts:', err);
        setError('Failed to load alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Poll for new alerts every 5 minutes
    const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await apiGet(`/alerts/acknowledge/${alertId}`);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-400 text-yellow-800 dark:text-yellow-300';
      case 'low':
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-400 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-400 text-gray-800 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return '📓';
      case 'mood':
        return '😔';
      case 'mood_trend':
        return '📉';
      case 'quiz':
        return '📋';
      default:
        return '⚠️';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4 rounded-md bg-gray-100 dark:bg-gray-800">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
        {error}
      </div>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't render anything if there are no alerts
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`p-4 border-l-4 rounded-md shadow-sm ${getSeverityStyles(alert.severity)}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <span className="text-2xl mr-3">{getTypeIcon(alert.type)}</span>
              <div>
                <h4 className="font-medium">
                  {alert.type === 'journal' ? 'Journal Content' :
                   alert.type === 'mood' ? 'Mood Check' :
                   alert.type === 'mood_trend' ? 'Mood Pattern' :
                   alert.type === 'quiz' ? 'Assessment Result' :
                   'Wellness'} Alert
                </h4>
                <p className="mt-1 text-sm">{alert.message}</p>
                <p className="mt-2 text-xs opacity-70">
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAcknowledge(alert.id)}
              className="text-sm px-3 py-1 bg-white dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Acknowledge
            </button>
          </div>
          
          {alert.severity === 'high' && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-md text-sm">
              <p className="font-medium">Resources:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>National Suicide Prevention Lifeline: 988 or 1-800-273-8255</li>
                <li>Crisis Text Line: Text HOME to 741741</li>
                <li>Consider speaking with a mental health professional</li>
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RiskAlertComponent;