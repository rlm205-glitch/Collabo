import { useState } from "react";
import { Link } from "react-router-dom";
import "./CreateAccount.css";

export default function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // simple front-end validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/authentication/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
          }),
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log("Account created:", data);
          window.location.href = data.redirect_url || "/login";
        } else {
          setError(data.error || "Account creation failed.");
        }
      } else if (response.status === 400) {
        const errorData = await response.json();
        setError(errorData.error || "Invalid registration information.");
      } else {
        setError(`Signup failed with status: ${response.status}`);
      }
    } catch (error) {
      setError("Signup error. Please try again.");
      console.error("Signup error:", error);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Create account</h1>
        <p className="title">Join Collabo</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>First name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Last name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

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

          <div className="field">
            <label>Re-enter password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button type="submit">Create Account</button>
          {error && <div className="error">{error}</div>}
        </form>

        <div className="footer">
          <Link to="/">Home</Link>
          <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
