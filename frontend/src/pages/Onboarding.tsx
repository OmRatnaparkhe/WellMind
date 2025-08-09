import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { apiGet, apiPost } from '../lib/api';

type SurveyQuestion = {
  id: string;
  text: string;
  options: { value: number; label: string }[];
};

type ConsentSettings = {
  dataCollection: boolean;
  anonymizedResearch: boolean;
  marketingCommunications: boolean;
  thirdPartySharing: boolean;
};

const PHQ9Questions: SurveyQuestion[] = [
  {
    id: 'phq1',
    text: 'Little interest or pleasure in doing things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq2',
    text: 'Feeling down, depressed, or hopeless',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq4',
    text: 'Feeling tired or having little energy',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq5',
    text: 'Poor appetite or overeating',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq6',
    text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq7',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq8',
    text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'phq9',
    text: 'Thoughts that you would be better off dead or of hurting yourself in some way',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
];

const GAD7Questions: SurveyQuestion[] = [
  {
    id: 'gad1',
    text: 'Feeling nervous, anxious, or on edge',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad2',
    text: 'Not being able to stop or control worrying',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad3',
    text: 'Worrying too much about different things',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad4',
    text: 'Trouble relaxing',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad5',
    text: 'Being so restless that it is hard to sit still',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad6',
    text: 'Becoming easily annoyed or irritable',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
  {
    id: 'gad7',
    text: 'Feeling afraid, as if something awful might happen',
    options: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
  },
];

const SleepQuestions: SurveyQuestion[] = [
  {
    id: 'sleep1',
    text: 'How would you rate your sleep quality overall?',
    options: [
      { value: 0, label: 'Very good' },
      { value: 1, label: 'Fairly good' },
      { value: 2, label: 'Fairly bad' },
      { value: 3, label: 'Very bad' },
    ],
  },
  {
    id: 'sleep2',
    text: 'How long does it usually take you to fall asleep?',
    options: [
      { value: 0, label: 'Less than 15 minutes' },
      { value: 1, label: '15-30 minutes' },
      { value: 2, label: '31-60 minutes' },
      { value: 3, label: 'More than 60 minutes' },
    ],
  },
  {
    id: 'sleep3',
    text: 'How many hours of actual sleep do you get at night?',
    options: [
      { value: 0, label: 'More than 7 hours' },
      { value: 1, label: '6-7 hours' },
      { value: 2, label: '5-6 hours' },
      { value: 3, label: 'Less than 5 hours' },
    ],
  },
];

const SocialQuestions: SurveyQuestion[] = [
  {
    id: 'social1',
    text: 'How often do you feel that you lack companionship?',
    options: [
      { value: 0, label: 'Hardly ever' },
      { value: 1, label: 'Some of the time' },
      { value: 2, label: 'Often' },
    ],
  },
  {
    id: 'social2',
    text: 'How often do you feel left out?',
    options: [
      { value: 0, label: 'Hardly ever' },
      { value: 1, label: 'Some of the time' },
      { value: 2, label: 'Often' },
    ],
  },
  {
    id: 'social3',
    text: 'How often do you feel isolated from others?',
    options: [
      { value: 0, label: 'Hardly ever' },
      { value: 1, label: 'Some of the time' },
      { value: 2, label: 'Often' },
    ],
  },
];

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    dataCollection: false,
    anonymizedResearch: false,
    marketingCommunications: false,
    thirdPartySharing: false,
  });
  
  const [phq9Responses, setPHQ9Responses] = useState<Record<string, number>>({});
  const [gad7Responses, setGAD7Responses] = useState<Record<string, number>>({});
  const [sleepResponses, setSleepResponses] = useState<Record<string, number>>({});
  const [socialResponses, setSocialResponses] = useState<Record<string, number>>({});

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const response = await apiGet('/onboarding/status');
        if ((response as { baselineCompleted: boolean }).baselineCompleted) {
          navigate('/dashboard');
        }
      } catch (err) {
        // If there's an error or the user hasn't completed onboarding, stay on this page
        console.error('Error checking onboarding status:', err);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleConsentChange = (setting: keyof ConsentSettings) => {
    setConsentSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleSurveyResponse = (questionId: string, value: number, surveyType: string) => {
    switch (surveyType) {
      case 'phq9':
        setPHQ9Responses(prev => ({ ...prev, [questionId]: value }));
        break;
      case 'gad7':
        setGAD7Responses(prev => ({ ...prev, [questionId]: value }));
        break;
      case 'sleep':
        setSleepResponses(prev => ({ ...prev, [questionId]: value }));
        break;
      case 'social':
        setSocialResponses(prev => ({ ...prev, [questionId]: value }));
        break;
    }
  };

  const isStepComplete = () => {
    switch (step) {
      case 1: // Consent
        return consentSettings.dataCollection; // At minimum, data collection consent is required
      case 2: // PHQ-9
        return PHQ9Questions.every(q => phq9Responses[q.id] !== undefined);
      case 3: // GAD-7
        return GAD7Questions.every(q => gad7Responses[q.id] !== undefined);
      case 4: // Sleep
        return SleepQuestions.every(q => sleepResponses[q.id] !== undefined);
      case 5: // Social
        return SocialQuestions.every(q => socialResponses[q.id] !== undefined);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepComplete()) {
      setStep(prev => prev + 1);
      setError('');
    } else {
      setError('Please complete all questions before proceeding.');
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!isStepComplete()) {
      setError('Please complete all questions before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Submit all survey responses and consent settings
      await apiPost('/onboarding/complete', {
        consentSettings,
        surveys: {
          phq9: phq9Responses,
          gad7: gad7Responses,
          sleep: sleepResponses,
          social: socialResponses,
        },
      });

      // Redirect to dashboard after successful submission
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting onboarding data:', err);
      setError('Failed to submit your responses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSurveyQuestions = (questions: SurveyQuestion[], responses: Record<string, number>, surveyType: string) => {
    return questions.map(question => (
      <div key={question.id} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="mb-3 text-gray-800 dark:text-gray-200">{question.text}</p>
        <div className="flex flex-col space-y-2">
          {question.options.map(option => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={responses[question.id] === option.value}
                onChange={() => handleSurveyResponse(question.id, option.value, surveyType)}
                className="form-radio h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Welcome to MindfulMe</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Let's get to know you better so we can personalize your experience
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2">
            <div
              className="bg-primary h-2 transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>

          <div className="p-6">
            {/* Step 1: Consent */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Privacy & Consent</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Please review and select the options you consent to. Data collection is required for the app to function.
                </p>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentSettings.dataCollection}
                      onChange={() => handleConsentChange('dataCollection')}
                      className="form-checkbox h-5 w-5 text-primary mt-1"
                      required
                    />
                    <div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Data Collection (Required)</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        We collect your responses and app usage to provide personalized mental health support.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentSettings.anonymizedResearch}
                      onChange={() => handleConsentChange('anonymizedResearch')}
                      className="form-checkbox h-5 w-5 text-primary mt-1"
                    />
                    <div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Anonymized Research</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Allow us to use your anonymized data for research to improve mental health support.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentSettings.marketingCommunications}
                      onChange={() => handleConsentChange('marketingCommunications')}
                      className="form-checkbox h-5 w-5 text-primary mt-1"
                    />
                    <div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Marketing Communications</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Receive updates about new features, tips, and mental wellness resources.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentSettings.thirdPartySharing}
                      onChange={() => handleConsentChange('thirdPartySharing')}
                      className="form-checkbox h-5 w-5 text-primary mt-1"
                    />
                    <div>
                      <span className="text-gray-800 dark:text-gray-200 font-medium">Third-Party Sharing</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Allow sharing of anonymized data with trusted research partners.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: PHQ-9 Depression Screening */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Depression Screening (PHQ-9)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Over the last 2 weeks, how often have you been bothered by any of the following problems?
                </p>
                {renderSurveyQuestions(PHQ9Questions, phq9Responses, 'phq9')}
              </div>
            )}

            {/* Step 3: GAD-7 Anxiety Screening */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Anxiety Screening (GAD-7)</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Over the last 2 weeks, how often have you been bothered by the following problems?
                </p>
                {renderSurveyQuestions(GAD7Questions, gad7Responses, 'gad7')}
              </div>
            )}

            {/* Step 4: Sleep Assessment */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Sleep Assessment</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Please answer the following questions about your sleep habits.
                </p>
                {renderSurveyQuestions(SleepQuestions, sleepResponses, 'sleep')}
              </div>
            )}

            {/* Step 5: Social Connectedness */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Connectedness</h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Please indicate how often you feel the way described in each of the following statements.
                </p>
                {renderSurveyQuestions(SocialQuestions, socialResponses, 'social')}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className={`px-4 py-2 rounded-md ${step === 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
              >
                Back
              </button>

              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  className={`px-4 py-2 rounded-md ${!isStepComplete() ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white`}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !isStepComplete()}
                  className={`px-4 py-2 rounded-md ${loading || !isStepComplete() ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} text-white`}
                >
                  {loading ? 'Submitting...' : 'Complete'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;