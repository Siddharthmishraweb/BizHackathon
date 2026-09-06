import React, { useState } from 'react';
import { Questionnaire } from '../types';

interface QuestionnaireFormProps {
  onSubmit: (questionnaire: Questionnaire) => void;
  onBack?: () => void;
  loading: boolean;
  initialQuestionnaire?: Questionnaire;
}

const DEFAULT_QUESTIONNAIRE: Questionnaire = {
  investment_horizon: 10,
  investment_experience: 2,
  reaction_to_market_loss: 3,
  investment_frequency: 'MONTHLY',
  liquidity_preference: 'MEDIUM',
  investment_goal: 'WEALTH_CREATION',
};

export const QuestionnaireForm: React.FC<QuestionnaireFormProps> = ({
  onSubmit,
  onBack,
  loading,
  initialQuestionnaire,
}) => {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire>(
    initialQuestionnaire ?? DEFAULT_QUESTIONNAIRE
  );
  const handleChange = (
    field: keyof Questionnaire,
    value: string | number
  ) => {
    setQuestionnaire({ ...questionnaire, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(questionnaire);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Investment Preferences</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Help us understand your investment goals and risk tolerance
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Investment Horizon (Years)</label>
          <input
            type="number"
            min="1"
            max="50"
            value={questionnaire.investment_horizon}
            onChange={(e) =>
              handleChange(
                'investment_horizon',
                parseInt(e.target.value) || 1
              )
            }
            disabled={loading}
          />
          <small style={{ color: '#666' }}>
            How many years do you plan to invest?
          </small>
        </div>

        <div className="form-group">
          <label>Investment Experience (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={questionnaire.investment_experience}
            onChange={(e) =>
              handleChange('investment_experience', parseInt(e.target.value))
            }
            disabled={loading}
            style={{ cursor: 'pointer' }}
          />
          <small style={{ color: '#666' }}>
            {questionnaire.investment_experience === 1 && 'Beginner'}
            {questionnaire.investment_experience === 2 && 'Novice'}
            {questionnaire.investment_experience === 3 && 'Intermediate'}
            {questionnaire.investment_experience === 4 && 'Experienced'}
            {questionnaire.investment_experience === 5 && 'Expert'}
          </small>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Reaction to Market Losses (1-5)</label>
          <input
            type="range"
            min="1"
            max="5"
            value={questionnaire.reaction_to_market_loss}
            onChange={(e) =>
              handleChange('reaction_to_market_loss', parseInt(e.target.value))
            }
            disabled={loading}
            style={{ cursor: 'pointer' }}
          />
          <small style={{ color: '#666' }}>
            {questionnaire.reaction_to_market_loss === 1 &&
              'Very anxious - need stability'}
            {questionnaire.reaction_to_market_loss === 2 && 'Anxious'}
            {questionnaire.reaction_to_market_loss === 3 &&
              'Neutral - can handle some volatility'}
            {questionnaire.reaction_to_market_loss === 4 &&
              'Comfortable with volatility'}
            {questionnaire.reaction_to_market_loss === 5 &&
              'Embraces risk for higher returns'}
          </small>
        </div>

        <div className="form-group">
          <label>Investment Frequency</label>
          <select
            value={questionnaire.investment_frequency}
            onChange={(e) =>
              handleChange('investment_frequency', e.target.value)
            }
            disabled={loading}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="LUMP_SUM">Lump Sum</option>
            <option value="RARELY">Rarely</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Liquidity Preference</label>
          <select
            value={questionnaire.liquidity_preference}
            onChange={(e) =>
              handleChange('liquidity_preference', e.target.value)
            }
            disabled={loading}
          >
            <option value="LOW">Low - Long-term lock-in OK</option>
            <option value="MEDIUM">Medium - Flexible timeline</option>
            <option value="HIGH">High - Quick access needed</option>
          </select>
          <small style={{ color: '#666' }}>
            How quickly do you need access to your money?
          </small>
        </div>

        <div className="form-group">
          <label>Primary Investment Goal</label>
          <select
            value={questionnaire.investment_goal}
            onChange={(e) => handleChange('investment_goal', e.target.value)}
            disabled={loading}
          >
            <option value="WEALTH_CREATION">Wealth Creation</option>
            <option value="RETIREMENT">Retirement Planning</option>
            <option value="TAX_SAVING">Tax Saving</option>
            <option value="EMERGENCY_FUND">Emergency Fund</option>
            <option value="SHORT_TERM_GOAL">Short-term Goal</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Analyzing...' : 'Get Recommendations'}
      </button>
      {onBack && (
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          Back
        </button>
      )}
    </form>
  );
};
