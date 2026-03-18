import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Authenticator from "./pages/Authenticator";

import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordOtp from "./pages/ForgotPasswordOtp";
import ResetPassword from "./pages/ResetPassword";

import LostAuthenticator from "./pages/LostAuthenticator";
import LostAuthenticatorOtp from "./pages/LostAuthenticatorOtp";
import LostAuthenticatorSetup from "./pages/LostAuthenticatorSetup";

import AccountRecovery from "./pages/AccountRecovery";

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Flow */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/authenticator" element={<Authenticator />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Lost Authenticator Flow */}
        <Route path="/lost-authenticator" element={<LostAuthenticator />} />
        <Route path="/lost-authenticator-otp" element={<LostAuthenticatorOtp />} />
        <Route path="/lost-authenticator-setup" element={<LostAuthenticatorSetup />} />

        <Route path="/account-recovery" element={<AccountRecovery />} />
      </Routes>
    </Router>
  );
}

export default App;