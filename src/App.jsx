import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoanApplicationProvider } from './LoanApplicationContext';
import LoanCalculator from './pages/LoanCalculator.jsx';
import LoanApplication from './pages/LoanApplication.jsx';
import Details from './pages/Details.jsx';
import Summary from './pages/Summary.jsx';
import Login from './pages/Login.jsx';
import Otp from './pages/Otp.jsx';
import Status from './pages/Status.jsx';

function App() {
  return (
    <LoanApplicationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoanCalculator />} />
          <Route path="/check-rate" element={<LoanCalculator />} />
          <Route path="/loan-application" element={<LoanApplication />}/>
          <Route path="/details" element={<Details />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Otp />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </Router>
    </LoanApplicationProvider>
  );
}

export default App;