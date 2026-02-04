import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // simple front-end validation for now
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/authentication/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
        credentials: "include", // Include cookies for session handling
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Login successful:", data);
          window.location.href = data.redirect_url;
        } else {
          setError(data.error || "Login failed");
        }
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.error || "Invalid email or password.");
      } else {
        setError(`Login failed with status: ${response.status}`);
      }
    } catch (error) {
      // Handle network errors or fetch failures
      setError("Login error. Please try again.");
      console.error("Login error:", error);
    }
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
