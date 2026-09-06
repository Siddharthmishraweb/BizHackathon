import React from 'react';
import { AnalysisResponse } from '../types';

interface ResultsProps {
  analysis: AnalysisResponse;
}

export const Results: React.FC<ResultsProps> = ({ analysis }) => {
  const { riskPrediction, recommendation } = analysis;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return '#28a745';
      case 'MEDIUM':
        return '#ffc107';
      case 'HIGH':
        return '#dc3545';
      default:
        return '#97144d';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return '🛡️';
      case 'MEDIUM':
        return '⚖️';
      case 'HIGH':
        return '🚀';
      default:
        return '📊';
    }
  };

  const getProductIcon = (product: string) => {
    switch (product) {
      case 'FD':
        return '🏦';
      case 'PPF':
        return '🏛️';
      case 'NPS':
        return '💼';
      case 'MUTUAL_FUND':
        return '📈';
      default:
        return '💰';
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div>
      <h2>Your Investment Analysis</h2>

      {/* Risk Profile Card */}
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: `5px solid ${getRiskColor(riskPrediction.riskProfile)}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '48px' }}>
            {getRiskIcon(riskPrediction.riskProfile)}
          </div>
          <div>
            <h3 style={{ margin: '0 0 10px 0' }}>Your Risk Profile</h3>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: getRiskColor(riskPrediction.riskProfile),
                marginBottom: '10px',
              }}
            >
              {riskPrediction.riskProfile}
            </div>
            <p style={{ color: '#666', margin: 0 }}>
              Based on your financial profile and behavioral assessment
            </p>
          </div>
        </div>

        {/* Probability Breakdown */}
        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '15px',
          }}
        >
          {Object.entries(riskPrediction.probabilities).map(([risk, prob]) => (
            <div key={risk} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                {risk}
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: getRiskColor(risk),
                }}
              >
                {(prob * 100).toFixed(1)}%
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#eee',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: getRiskColor(risk),
                    width: `${prob * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Recommendations */}
    <div>
        <h3 style={{ marginBottom: '4px', color: '#6e0e3a' }}>
          Investment Product Recommendations
        </h3>
        <p style={{ marginTop: 0, marginBottom: '20px', fontSize: '13px', color: '#666' }}>
          These insights are generated based on your financial profile, goals, and risk
          preferences to help you explore suitable investment options. They are for informational
          purposes only and are not a guarantee of returns or a substitute for professional
          financial advice. <strong>The final investment decision is always yours.</strong>
        </p>

        {recommendation.products.map((product, index) => (
          <div
            key={product.product}
            style={{
              background: index === 0 ? '#fbeaf1' : 'white',
              border:
                index === 0 ? '2px solid #97144d' : '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '15px',
              boxShadow: index === 0 ? '0 2px 8px rgba(151,20,77,0.2)' : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '15px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#97144d',
                    marginBottom: '5px',
                  }}
                >
                  {getProductIcon(product.product)} {product.product}
                  {index === 0 && (
                    <span
                      style={{
                        marginLeft: '10px',
                        fontSize: '14px',
                        background: '#97144d',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                      }}
                    >
                      Top Recommendation
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#97144d',
                  }}
                >
                  {product.allocationPercentage}%
                </div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                  {formatCurrency(product.allocationAmount)}/mo
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  suggested allocation · score {product.score}/100
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, #97144d, #6e0e3a)`,
                  width: `${product.score}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Reasons */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#6e0e3a', marginBottom: '8px' }}>
                Why this recommendation:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                {product.reasons.map((reason, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: '#555',
                      marginBottom: '6px',
                      lineHeight: '1.5',
                    }}
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          padding: '15px',
          marginTop: '30px',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.6',
        }}
      >
        <strong>Important Disclaimer:</strong> This investment recommendation is
        not a substitute for professional financial advice.
        Past performance is not indicative of future results. All investments carry risk,
        including potential loss of principal. Please consult with a qualified financial
        advisor before making any investment decisions.
      </div>
    </div>
  );
};
