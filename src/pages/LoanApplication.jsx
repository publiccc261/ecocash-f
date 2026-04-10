import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './LoanApplication.css';

export default function LoanApplication() {
  const navigate = useNavigate();
  
  // Get context data and functions
  const { loanApplicationData, updateLoanApplicationData } = useLoanApplication();
  
  // Form state - initialize with data from context
  const [formData, setFormData] = useState({
    loanType: loanApplicationData.loanType || 'Personal Loan',
    loanAmount: loanApplicationData.loanAmount || '',
    loanTerm: loanApplicationData.loanTerm || '12 Months',
    purpose: loanApplicationData.purpose || ''
  });

  // Update form if context data changes (e.g., from calculator)
  useEffect(() => {
    if (loanApplicationData.loanAmount) {
      setFormData(prev => ({
        ...prev,
        loanAmount: loanApplicationData.loanAmount,
        loanTerm: loanApplicationData.loanTerm
      }));
    }
  }, [loanApplicationData]);

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
    
    // Save form data to context
    updateLoanApplicationData(formData);
    
    // Navigate to next step
    navigate('/details');
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

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
          <p className="form-subtitle">Step 1 of 3</p>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className="progress-dot active"></div>
            <div className="progress-dot"></div>
            <div className="progress-dot"></div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit}>
            
            {/* Loan Type */}
            <div className="form-group">
              <label className="form-label">Loan Type</label>
              <select 
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Personal Loan">Personal Loan</option>
                <option value="Business Loan">Business Loan</option>
                <option value="Home Loan">Home Loan</option>
                <option value="Car Loan">Car Loan</option>
                <option value="Education Loan">Education Loan</option>
              </select>
            </div>

            {/* Loan Amount */}
            <div className="form-group">
              <label className="form-label">Loan Amount ($)</label>
              <input 
                type="number"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="form-input"
                required
              />
            </div>

            {/* Loan Term */}
            <div className="form-group">
              <label className="form-label">Loan Term</label>
              <select 
                name="loanTerm"
                value={formData.loanTerm}
                onChange={handleChange}
                className="form-select"
              >
                <option value="6 Months">6 Months</option>
                <option value="12 Months">12 Months</option>
                <option value="18 Months">18 Months</option>
                <option value="24 Months">24 Months</option>
                <option value="36 Months">36 Months</option>
                <option value="48 Months">48 Months</option>
                <option value="60 Months">60 Months</option>
              </select>
            </div>

            {/* Purpose of Loan */}
            <div className="form-group">
              <label className="form-label">Purpose of Loan</label>
              <textarea 
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="What will you use the loan for?"
                className="form-textarea"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="next-btn">
              NEXT STEP
            </button>
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
