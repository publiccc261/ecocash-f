import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './Summary.css';

export default function Summary() {
  const navigate = useNavigate();
  
  // Get context data and functions
  const { 
    loanApplicationData,
    personalDetailsData,
    financialData,
    updateFinancialData,
    processLoanApplication 
  } = useLoanApplication();
  
  // Form state for Step 3 - initialize with context data
  const [formData, setFormData] = useState({
    employmentStatus: financialData.employmentStatus || 'Employed',
    annualIncome: financialData.annualIncome || ''
  });

  // Success page state
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Countdown timer for success page
  useEffect(() => {
    if (showSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showSuccess, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save financial data to context
    updateFinancialData(formData);
    
    // Process the loan application and calculate approval
    const approvalData = processLoanApplication();
    
    // Show success screen
    setShowSuccess(true);
  };

  // Handle previous button
  const handlePrevious = () => {
    // Save current data before going back
    updateFinancialData(formData);
    navigate(-1);
  };

  // Handle back button
  const handleBack = () => {
    navigate('/');
  };

  // Success Page View
  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        padding: '20px'
      }}>
        {/* Success Toast */}
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="10" cy="10" r="9" fill="#10b981" stroke="#10b981" strokeWidth="2"/>
            <path d="M6 10l2.5 2.5L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            🎉 Application submitted successfully!
          </span>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px 40px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path 
                d="M14 24l8 8 12-16" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#10b981',
            marginBottom: '16px',
            letterSpacing: '-0.5px'
          }}>
            Loan Application Submitted
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '12px'
          }}>
            Your loan application has been submitted. Please wait for approval.
          </p>

          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            You will receive a confirmation message. For now, proceed to EcoCash.
          </p>

          {/* Redirect Message */}
          <div style={{
            backgroundColor: '#f3f4f6',
            padding: '20px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            {/* Spinner */}
            <div style={{
              width: '20px',
              height: '20px',
              border: '3px solid #e5e7eb',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            
            <span style={{
              fontSize: '15px',
              color: '#3b82f6',
              fontWeight: '500'
            }}>
              Redirecting to EcoCash login in {countdown}s...
            </span>
          </div>

          {/* Manual Redirect Button */}
          <button
            onClick={() => navigate('/login')}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.color = '#6b7280';
            }}
          >
            Go to Login Now
          </button>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Main Form View (Step 3)
  return (
    <div className="app-container">
      
      {/* ==================== HEADER ==================== */}
      <header className="header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        <div className="logo">
          <span className="logo-eco">Eco</span>
          <span className="logo-cash">Cash</span>
        </div>
        <button className="menu-btn" aria-label="Menu">
          <div className="menu-line"></div>
          <div className="menu-line"></div>
          <div className="menu-line"></div>
        </button>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="main-content">
        <div className="container">
          
          {/* Title Section */}
          <h1 className="form-title">Loan Application</h1>
          <p className="form-subtitle">Step 3 of 3</p>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
            <div className="progress-dot active"></div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Employment Status */}
            <div className="form-group">
              <label className="form-label">Employment Status</label>
              <select 
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* Annual Income */}
            <div className="form-group">
              <label className="form-label">Annual Income ($)</label>
              <input 
                type="number"
                name="annualIncome"
                value={formData.annualIncome}
                onChange={handleChange}
                placeholder="50,000"
                className="form-input"
                required
              />
            </div>

            {/* Application Summary */}
            <div className="summary-section">
              <h3 className="summary-title">Application Summary</h3>
              
              <div className="summary-item">
                <span className="summary-label">Loan Amount:</span>
                <span className="summary-value">
                  ${loanApplicationData.loanAmount ? Number(loanApplicationData.loanAmount).toLocaleString() : '0'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Loan Term:</span>
                <span className="summary-value">
                  {loanApplicationData.loanTerm || 'N/A'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Purpose:</span>
                <span className="summary-value">
                  {loanApplicationData.purpose || 'N/A'}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Applicant:</span>
                <span className="summary-value">
                  {personalDetailsData.firstName && personalDetailsData.lastName 
                    ? `${personalDetailsData.firstName} ${personalDetailsData.lastName}`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Button Container */}
            <div className="button-container">
              <button 
                type="button" 
                className="previous-btn"
                onClick={handlePrevious}
              >
                PREVIOUS
              </button>
              <button type="submit" className="submit-btn">
                SUBMIT APPLICATION
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        © 2026 Ecocash
      </footer>
    </div>
  );
}
