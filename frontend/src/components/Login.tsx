import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // simple front-end validation for now
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    alert(`Logging in as ${email} (backend hook-up next)`);
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Welcome back</h1>
        <p className="title">Log in to Collabo</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc123@case.edu"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit">Log In</button>
          {error && <div className="error">{error}</div>}
        </form>

        <div className="footer">
          <Link to="/">Home</Link>
          <Link to="/signup">Create account</Link>
        </div>
      </div>
    </div>
  );
}
