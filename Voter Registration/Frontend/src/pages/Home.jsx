import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div style={{ textAlign: "center" }}>
        
        <h1 className="hero-title">
          Blockchain-Based E-Voting System
        </h1>

        <p className="hero-subtitle">
          Welcome to the institutional registration portal.
        </p>

        <div style={{ marginTop: "50px" }}>
          
          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Register
          </button>

          <p style={{ marginTop: "25px" }}>
            <Link to="/account-recovery" className="recovery-link">
              Forgot password or lost authenticator?
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Home;