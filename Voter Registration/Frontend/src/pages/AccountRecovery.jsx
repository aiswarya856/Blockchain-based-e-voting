import { useNavigate } from "react-router-dom";

function AccountRecovery() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Account Recovery</h1>

        <div style={{ marginTop: "40px" }} className="form-box">

          <button
            className="primary-btn"
            style={{ marginBottom: "20px" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/lost-authenticator")}
          >
            Lost Authenticator
          </button>

        </div>
      </div>
    </div>
  );
}

export default AccountRecovery;