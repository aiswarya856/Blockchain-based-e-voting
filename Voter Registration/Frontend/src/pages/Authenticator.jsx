import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Authenticator() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError("Authenticator code must be a 6-digit number.");
      return;
    }

    // Backend responsibility:
    // - Verify TOTP
    // - Save authenticator secret

    setShowSuccess(true);
  };

  const handleSuccess = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Set Up Authenticator</h1>

        <p className="hero-subtitle">
          Scan the QR code below using Microsoft Authenticator.
        </p>

        <div style={{ marginTop: "30px" }}>
          <div
            style={{
              width: "160px",
              height: "160px",
              backgroundColor: "white",
              margin: "0 auto",
              borderRadius: "8px"
            }}
          >
            {/* Placeholder QR */}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Confirm
          </button>
        </form>

        {showSuccess && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Authentication Successful</h3>
              <button onClick={handleSuccess} className="primary-btn">
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Authenticator;