import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';


export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role to student
  const [branch, setBranch] = useState(''); // Added branch state
  const [ccpdCode, setCcpdCode] = useState(''); // Optional: for CCPD verification
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Placeholder for CCPD verification code
  const VALID_CCPD_CODE = "nitw-ccpd-2025"; // Matches MOCK_CCPD_VERIFICATION_CODE

  const engineeringBranches = [
    { value: "", label: "Select your branch", disabled: true },
    { value: "BT", label: "Biotechnology (BT)" },
    { value: "CH", label: "Chemical Engineering (CHE)" },
    { value: "CE", label: "Civil Engineering (CE)" },
    { value: "CS", label: "Computer Science Engineering (CSE)" },
    { value: "EE", label: "Electrical and Electronics Engineering (EEE)" }, // Corrected from EEE for simplicity, adjust if needed
    { value: "EC", label: "Electronics and Communication Engineering (ECE)" },
    { value: "ME", label: "Mechanical Engineering (ME)" },
    { value: "MM", label: "Metallurgical and Materials Engineering (MME)" },
    { value: "Other", label: "Other" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (role === 'student' && !branch) {
      setError("Please select your branch.");
      return;
    }
    // Remove this client-side validation since we'll let the server handle it
    // if (role === 'ccpd' && ccpdCode !== VALID_CCPD_CODE) {
    //   setError("Invalid CCPD verification code.");
    //   return;
    // }

    setLoading(true);
    try {
      const registrationData = { name, email, password, role };
      if (role === 'student') {
        registrationData.branch = branch;
      }
      if (role === 'ccpd') {
        registrationData.ccpdCode = ccpdCode;
      }
      await register(registrationData);
      console.log("Registration successful, navigating to login...");
      navigate('/login', { state: { registered: true, email: email } }); // Pass email for pre-fill
    } catch (err) {
      console.error("Register page error:", err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10">
        <div>
          <h2 className="text-center text-3xl font-bold text-text-primary">
            Join InternHub @ NITW
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-primary hover:text-brand-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && <ErrorMessage title="Registration Failed" message={error} />}

          {/* Role Selection */}
          <fieldset className="mb-4">
            <legend className="block text-sm font-medium text-text-secondary mb-1">I am a:</legend>
            <div className="mt-2 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:space-x-6">
              <div className="flex items-center">
                <input
                  id="role-student"
                  name="role"
                  type="radio"
                  value="student"
                  checked={role === 'student'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-brand-primary border-border-color focus:ring-brand-primary"
                />
                <label htmlFor="role-student" className="ml-2 block text-sm text-text-secondary">
                  NITW Student
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="role-ccpd"
                  name="role"
                  type="radio"
                  value="ccpd"
                  checked={role === 'ccpd'}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-4 w-4 text-brand-primary border-border-color focus:ring-brand-primary"
                />
                <label htmlFor="role-ccpd" className="ml-2 block text-sm text-text-secondary">
                  CCPD Member / Faculty
                </label>
              </div>
            </div>
          </fieldset>

          {role === 'ccpd' && (
            <div>
              <label htmlFor="ccpd-code" className="block text-sm font-medium text-text-secondary mb-1">CCPD Verification Code</label>
              <input
                id="ccpd-code"
                name="ccpd-code"
                type="password" // Keep it like a password field
                required={role === 'ccpd'}
              className="input-field"
                placeholder="Enter CCPD Code"
                value={ccpdCode}
                onChange={(e) => setCcpdCode(e.target.value)}
              disabled={loading}
            />
          </div>
          )}

          {/* Conditionally render Branch dropdown for students */}
          {role === 'student' && (
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-text-secondary mb-1">Branch</label>
              <select
                id="branch"
                name="branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required={role === 'student'}
                className="input-field"
                disabled={loading}
              >
                {engineeringBranches.map(b => (
                  <option key={b.value} value={b.value} disabled={b.disabled}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-text-secondary mb-1">Full name</label>
            <input
              id="full-name" name="name" type="text" autoComplete="name" required
              className="input-field" placeholder="Your Name"
              value={name} onChange={(e) => setName(e.target.value)} disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="email-address-register" className="block text-sm font-medium text-text-secondary mb-1">Email address <span className="text-xs">(Preferably NITW email)</span></label>
            <input
              id="email-address-register" name="email" type="email" autoComplete="email" required
              className="input-field" placeholder="you@student.nitw.ac.in"
              value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
            />
      </div>
          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
            <input
              id="password-register" name="password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="•••••••• (min. 8 characters)"
              value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary mb-1">Confirm password</label>
            <input
              id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
              className="input-field" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? <LoadingSpinner size="sm" message="" /> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}