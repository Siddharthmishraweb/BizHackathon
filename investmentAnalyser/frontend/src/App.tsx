import React, { useEffect, useState } from 'react';
import { ProfileForm } from './components/Forms';
import { QuestionnaireForm } from './components/Questionnaire';
import { Results } from './components/Results';
import { apiClient } from './api';
import { Step, UserProfile, Questionnaire, AnalysisResponse } from './types';
import { styles } from './styles.css';

function App() {
  const [step, setStep] = useState<Step>(Step.PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  // Silently provision a guest user so the dashboard can start immediately.
  useEffect(() => {
    const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    apiClient
      .createUser(guestId, `${guestId}@guest.local`)
      .then((user) => setUserId(user.userId))
      .catch(() =>
        setError('Failed to initialize session. Please refresh the page.')
      );
  }, []);

  const handleProfileSubmit = (profileData: UserProfile) => {
    setProfile(profileData);
    setStep(Step.QUESTIONNAIRE);
  };

  const handleQuestionnaireSubmit = async (questionnaireData: Questionnaire) => {
    setLoading(true);
    setError('');
    try {
      if (!profile) throw new Error('Profile not found');
      if (!userId) throw new Error('Session not ready yet, please try again');
      const result = await apiClient.runAnalysis(
        userId,
        profile,
        questionnaireData
      );
      setQuestionnaire(questionnaireData);
      setAnalysis(result);
      setStep(Step.RESULTS);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to run analysis. Please check the backend is running on localhost:3000'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(Step.PROFILE);
    setProfile(null);
    setQuestionnaire(null);
    setAnalysis(null);
    setError('');
  };


  return (
    <>
      <style>{styles}</style>
      <div style={{ minHeight: '100vh', background: '#fdf3f7', paddingBottom: '40px' }}>
        {/* Header */}
        <header
          style={{
            background: 'linear-gradient(135deg, #97144d 0%, #6e0e3a 100%)',
            color: 'white',
            padding: '30px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '32px' }}>💼</div>
              <div>
                <h1 style={{ color: 'white', margin: 0 }}>Investment Dashboard</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', margin: '5px 0 0 0' }}>
                  Enter your financials, answer a few questions, and get an ML-predicted risk profile plus a deterministic, rule-based investment allocation
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container">
          {/* Progress Indicator */}
          {(
            <div
              style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '30px',
                alignItems: 'center',
              }}
            >
              {[Step.PROFILE, Step.QUESTIONNAIRE, Step.RESULTS].map((s) => (
                <React.Fragment key={s}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background:
                        step >= s ? '#97144d' : '#ddd',
                      color: step >= s ? 'white' : '#999',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {s === Step.PROFILE && '1'}
                    {s === Step.QUESTIONNAIRE && '2'}
                    {s === Step.RESULTS && '3'}
                  </div>
                  {s < Step.RESULTS && (
                    <div
                      style={{
                        flex: 1,
                        height: '2px',
                        background:
                          step > s ? '#97144d' : '#ddd',
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Step Content */}
          <div className="card">
            {error && (
              <div
                style={{
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                }}
              >
                {error}
              </div>
            )}

            {step === Step.PROFILE && (
              <>
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#fbeaf1',
                    borderRadius: '6px',
                    borderLeft: '4px solid #97144d',
                  }}
                >
                  Step 1 of 2: Tell us about your financial situation.
                </div>
                <ProfileForm
                  onSubmit={handleProfileSubmit}
                  loading={loading}
                  initialProfile={profile ?? undefined}
                />
              </>
            )}

            {step === Step.QUESTIONNAIRE && (
              <>
                <div
                  style={{
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#fbeaf1',
                    borderRadius: '6px',
                    borderLeft: '4px solid #97144d',
                  }}
                >
                  Step 2 of 2: Tell us about your investment preferences and goals.
                </div>
                <QuestionnaireForm
                  onSubmit={handleQuestionnaireSubmit}
                  onBack={() => setStep(Step.PROFILE)}
                  loading={loading}
                  initialQuestionnaire={questionnaire ?? undefined}
                />
              </>
            )}

            {step === Step.RESULTS && analysis && (
              <>
                <Results analysis={analysis} />
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <button className="btn btn-primary" onClick={handleReset}>
                    Start New Analysis
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep(Step.QUESTIONNAIRE)}
                    style={{ marginLeft: '10px' }}
                  >
                    Back to Edit Answers
                  </button>
                </div>
              </>
            )}

            {loading && (
              <div className="loading">
                Processing your information
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
