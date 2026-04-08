import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<string | null>;
}

const UNVERIFIED_ERROR = 'Please verify your email before logging in.';

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError('');
    setNeedsVerification(false);
    setResendStatus('idle');
    setLoading(true);
    const err = await onLogin(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      if (err === UNVERIFIED_ERROR) setNeedsVerification(true);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await fetch('/authentication/resend-verification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CWRU Collaboration Platform</h1>
          <p className="text-gray-600">Find teammates for your next big project</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
            {needsVerification && (
              <div className="mt-2">
                {resendStatus === 'sent' ? (
                  <p className="text-green-700 font-medium">Verification email sent! Check your inbox.</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === 'sending'}
                    className="text-blue-600 hover:underline font-medium disabled:opacity-50"
                  >
                    {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
                {resendStatus === 'error' && (
                  <p className="text-red-700 mt-1">Failed to send email. Please try again.</p>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              CWRU Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.name@case.edu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {/* forgot password link */}
            <div className="text-right mt-1">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-6">
          Don't have an account?{' '}
          <Link to="/create-account" className="text-blue-600 hover:underline font-medium">
            Create an account
          </Link>
        </p>

        <p className="text-xs text-gray-500 text-center mt-4">
          This platform is restricted to current CWRU students only
        </p>
      </div>
    </div>
  );
}
