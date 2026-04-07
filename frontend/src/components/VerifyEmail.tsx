import { useEffect, useRef, useState } from "react";

export default function VerifyEmail() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying...");
  const ran = useRef(false); // prevents double-call in React StrictMode dev

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let token = new URLSearchParams(window.location.search).get("token") || "";
    token = token.replace(/\s+/g, "").replace(/=/g, ""); // sanitize

    if (!token) {
      setStatus("error");
      setMessage("Missing token.");
      return;
    }

    fetch("/authentication/verify-email/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("ok");
        setMessage(
          data.already_verified
            ? "Email already verified! You can log in."
            : "Email verified! You can now log in."
        );
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message || "Verification failed");
      });
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Email Verification</h1>
      <p>{message}</p>
      {status === "ok" && (
        <a href="/login" style={{ textDecoration: "underline" }}>
          Go to login
        </a>
      )}
    </div>
  );
}