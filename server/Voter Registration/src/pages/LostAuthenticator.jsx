import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LostAuthenticator() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@mgits.ac.in")) {
      setError("Please use your registered MGITS email address.");
      return;
    }

    if (password.length < 8) {
      setError("Invalid password.");
      return;
    }

    sessionStorage.setItem("laEmail", email);
    navigate("/lost-authenticator-otp");
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Lost Authenticator</h1>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default LostAuthenticator;