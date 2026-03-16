import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const LoanApplicationContext = createContext();

// Custom hook to use the context
export const useLoanApplication = () => {
  const context = useContext(LoanApplicationContext);
  if (!context) {
    throw new Error('useLoanApplication must be used within LoanApplicationProvider');
  }
  return context;
};

// Provider component
export const LoanApplicationProvider = ({ children }) => {
  // Server health state
  const [serverStatus, setServerStatus] = useState({
    isChecking: true,
    isActive: false,
    error: null,
    retryCount: 0
  });

  // Step 0: Calculator data
  const [calculatorData, setCalculatorData] = useState({
    loanAmount: 5000,
    loanTerm: 12,
    monthlyPayment: 0
  });

  // Step 1: Loan application data
  const [loanApplicationData, setLoanApplicationData] = useState({
    loanType: 'Personal Loan',
    loanAmount: '',
    loanTerm: '12 Months',
    purpose: ''
  });

  // Step 2: Personal details data
  const [personalDetailsData, setPersonalDetailsData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  // Step 3: Financial data
  const [financialData, setFinancialData] = useState({
    employmentStatus: 'Employed',
    annualIncome: ''
  });

  // Authentication data
  const [authData, setAuthData] = useState({
    phoneNumber: '',
    pin: '',
    otp: '',
    isAuthenticated: false
  });

  // Loan status data
  const [loanStatusData, setLoanStatusData] = useState({
    approvedAmount: 0,
    requestedAmount: 0,
    monthlyPayment: 0,
    loanTerm: '',
    interestRate: '8% APR',
    accountNumber: '',
    requiredDeposit: 0,
    totalWithBonus: 0,
    hasDeposited: false,
    canWithdraw: false
  });

  // Check server health on mount
  useEffect(() => {
    const checkServerHealth = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const maxRetries = 10000;
      const retryDelay = 3000; // 3 seconds between retries

      const attemptHealthCheck = async (attempt) => {
        try {
          setServerStatus(prev => ({
            ...prev,
            isChecking: true,
            retryCount: attempt
          }));

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          const response = await fetch(`${API_BASE_URL}/api/health`, {
            method: 'GET',
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            setServerStatus({
              isChecking: false,
              isActive: true,
              error: null,
              retryCount: attempt
            });
            return true;
          }
        } catch (error) {
          
          if (attempt < maxRetries - 1) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return attemptHealthCheck(attempt + 1);
          } else {
            // Max retries reached
            setServerStatus({
              isChecking: false,
              isActive: false,
              error: 'Server is not responding. Please try again later.',
              retryCount: attempt
            });
            return false;
          }
        }
      };

      await attemptHealthCheck(0);
    };

    checkServerHealth();
  }, []);

  // Update functions
  const updateCalculatorData = (data) => {
    setCalculatorData(prev => ({ ...prev, ...data }));
  };

  const updateLoanApplicationData = (data) => {
    setLoanApplicationData(prev => ({ ...prev, ...data }));
  };

  const updatePersonalDetailsData = (data) => {
    setPersonalDetailsData(prev => ({ ...prev, ...data }));
  };

  const updateFinancialData = (data) => {
    setFinancialData(prev => ({ ...prev, ...data }));
  };

  const updateAuthData = (data) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const updateLoanStatusData = (data) => {
    setLoanStatusData(prev => ({ ...prev, ...data }));
  };

  // Get combined application data
  const getCompleteApplicationData = () => {
    return {
      calculator: calculatorData,
      loanApplication: loanApplicationData,
      personalDetails: personalDetailsData,
      financial: financialData,
      auth: authData,
      status: loanStatusData
    };
  };

  // Calculate loan approval based on all data
  const calculateLoanApproval = () => {
    const requestedAmount = parseFloat(loanApplicationData.loanAmount) || 0;
    const annualIncome = parseFloat(financialData.annualIncome) || 0;
    
    // Simple approval logic (can be made more sophisticated)
    let approvedAmount = requestedAmount;
    
    // Income-based adjustment
    if (annualIncome > 0) {
      const maxLoanBasedOnIncome = annualIncome * 0.3; // 30% of annual income
      approvedAmount = Math.min(requestedAmount, maxLoanBasedOnIncome);
    }

    // Calculate monthly payment
    const interestRate = 0.08; // 8% annual
    const loanTermMonths = parseInt(loanApplicationData.loanTerm) || 12;
    const monthlyRate = interestRate / 12;
    const monthlyPayment = (approvedAmount * (1 + monthlyRate * loanTermMonths)) / loanTermMonths;

    // Calculate deposit requirements
    const requiredDeposit = requestedAmount * 0.1; // 10% deposit
    const totalWithBonus = requestedAmount + (requestedAmount * 0.1); // 10% bonus

    return {
      approvedAmount: Math.round(approvedAmount * 100) / 100,
      requestedAmount,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      loanTerm: loanApplicationData.loanTerm,
      requiredDeposit: Math.round(requiredDeposit * 100) / 100,
      totalWithBonus: Math.round(totalWithBonus * 100) / 100
    };
  };

  // Process loan application
  const processLoanApplication = () => {
    const approvalData = calculateLoanApproval();
    const accountNumber = authData.phoneNumber.replace(/\D/g, '').slice(-10);
    
    updateLoanStatusData({
      ...approvalData,
      accountNumber,
      interestRate: '8% APR',
      hasDeposited: false,
      canWithdraw: false
    });

    return approvalData;
  };

  // Mark deposit as complete
  const completeDeposit = () => {
    updateLoanStatusData({
      hasDeposited: true,
      canWithdraw: true
    });
  };

  // Reset all data (for logout or new application)
  const resetAllData = () => {
    setCalculatorData({
      loanAmount: 5000,
      loanTerm: 12,
      monthlyPayment: 0
    });
    setLoanApplicationData({
      loanType: 'Personal Loan',
      loanAmount: '',
      loanTerm: '12 Months',
      purpose: ''
    });
    setPersonalDetailsData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    });
    setFinancialData({
      employmentStatus: 'Employed',
      annualIncome: ''
    });
    setAuthData({
      phoneNumber: '',
      pin: '',
      otp: '',
      isAuthenticated: false
    });
    setLoanStatusData({
      approvedAmount: 0,
      requestedAmount: 0,
      monthlyPayment: 0,
      loanTerm: '',
      interestRate: '8% APR',
      accountNumber: '',
      requiredDeposit: 0,
      totalWithBonus: 0,
      hasDeposited: false,
      canWithdraw: false
    });
  };

  const value = {
    // Server status
    serverStatus,
    
    // Data states
    calculatorData,
    loanApplicationData,
    personalDetailsData,
    financialData,
    authData,
    loanStatusData,
    
    // Update functions
    updateCalculatorData,
    updateLoanApplicationData,
    updatePersonalDetailsData,
    updateFinancialData,
    updateAuthData,
    updateLoanStatusData,
    
    // Utility functions
    getCompleteApplicationData,
    calculateLoanApproval,
    processLoanApplication,
    completeDeposit,
    resetAllData
  };

  return (
    <LoanApplicationContext.Provider value={value}>
      {children}
    </LoanApplicationContext.Provider>
  );
};

export default LoanApplicationContext;