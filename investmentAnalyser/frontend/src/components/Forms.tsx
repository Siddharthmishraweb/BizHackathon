import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileFormProps {
  onSubmit: (profile: UserProfile) => void;
  loading: boolean;
  initialProfile?: UserProfile;
}

const DEFAULT_PROFILE: UserProfile = {
  age: 30,
  monthly_income: 35000,
  monthly_expenses: 25000,
  savings: 20000,
  existing_investments: 2500,
  monthly_emi: 3000,
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit, loading, initialProfile }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile ?? DEFAULT_PROFILE);

  const handleChange = (field: keyof UserProfile, value: number) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.age > 0 && profile.monthly_income > 0) {
      onSubmit(profile);
    }
  };

  const monthlySurplus = profile.monthly_income - profile.monthly_expenses;
  const savingsMonths =
    profile.monthly_expenses > 0
      ? Math.round((profile.savings / profile.monthly_expenses) * 10) / 10
      : 0;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Financial Profile</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Share your financial information
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            min="18"
            max="80"
            value={profile.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Monthly Income (₹)</label>
          <input
            type="number"
            min="0"
            value={profile.monthly_income}
            onChange={(e) =>
              handleChange('monthly_income', parseInt(e.target.value) || 0)
            }
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Monthly Expenses (₹)</label>
          <input
            type="number"
            min="0"
            value={profile.monthly_expenses}
            onChange={(e) =>
              handleChange('monthly_expenses', parseInt(e.target.value) || 0)
            }
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Current Savings (₹)</label>
          <input
            type="number"
            min="0"
            value={profile.savings}
            onChange={(e) => handleChange('savings', parseInt(e.target.value) || 0)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Existing Investments (₹)</label>
          <input
            type="number"
            min="0"
            value={profile.existing_investments}
            onChange={(e) =>
              handleChange('existing_investments', parseInt(e.target.value) || 0)
            }
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Monthly EMI/Loan Obligations (₹)</label>
          <input
            type="number"
            min="0"
            value={profile.monthly_emi}
            onChange={(e) => handleChange('monthly_emi', parseInt(e.target.value) || 0)}
            disabled={loading}
          />
        </div>
      </div>

      <div
        style={{
          background: 'rgba(151, 20, 77, 0.05)',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
        }}
      >
        <p>
          <strong>Monthly Surplus:</strong> ₹{monthlySurplus.toLocaleString()} |{' '}
          <strong>Emergency Fund:</strong> {savingsMonths} months
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Processing...' : 'Next: Questionnaire'}
      </button>
    </form>
  );
};
