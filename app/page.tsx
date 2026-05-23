"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  // ✅ ALL STATES PROPERLY ORDERED
  const [step, setStep] = useState<"login" | "register" | "otp" | "forgot" | "reset-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
// In LoginPage component


  // ✅ RESET FIELDS ON STEP CHANGE
  useEffect(() => {
    // Clear all fields when step changes
    setPassword("");
    setName("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  }, [step]);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    let body, endpoint;
    
    if (step === "register") {
      body = { email, password, name };
      endpoint = "/api/auth/register";
    } else if (step === "forgot") {
      body = { email };
      endpoint = "/api/auth/forgot-password";
    } else if (step === "reset-password") {
      body = { email, otp, newPassword, confirmPassword };
      endpoint = "/api/auth/reset-password";
    } else {
      body = { email, password };
      endpoint = "/api/auth/login";
    }

    console.log("🚀 FORM SENDING:", body);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMessage(data.message);
      if (step === "register" || step === "login") {
        setStep("otp");
      } else if (step === "forgot") {
        setStep("reset-password");
      } else if (step === "reset-password") {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          setStep("login");
          setEmail(""); // Clear email too
        }, 2000);
      }
    } else {
      setMessage(data.error);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setMessage("");
    
    console.log("🔍 VERIFYING OTP:", { email, otp });
    
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      console.log("✅ LOGIN SUCCESS - Going to dashboard!");
      localStorage.removeItem("userEmail");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } else {
      setMessage(data.error || "Invalid OTP");
    }
  };

  return (
    <>
     <div className="fixed inset-0 w-screen h-screen -z-20 overflow-hidden">
          <Image
            src="/NIT-Raipur-Aerial-view.png"
            alt="NIT Raipur Campus"
            fill
            sizes="100vw"
            className="object-cover brightness-75"
            priority
          />
        </div>
          
          {/* ✅ Dark Overlay */}
          <div className="fixed inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/30 to-slate-900/50 -z-10"></div>
    <div className="min-h-screen w-full relative z-10 flex items-center justify-center">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 border border-white/50">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-slate-700 bg-clip-text text-transparent mb-3">
            {/* ✅ FIXED: Correct header for ALL steps */}
            {step === "otp" ? "Enter OTP" : 
             step === "register" ? "Create Account" : 
             step === "reset-password" ? "Reset Password" : 
             step === "forgot" ? "Forgot Password" : "Welcome Back"}
          </h1>
          <p className="text-slate-600 text-lg">
            {/* ✅ FIXED: Correct description for ALL steps */}
            {step === "otp" ? "Check your email for the 6-digit code" : 
             step === "register" ? "Join Hira Hall & Guest House" : 
             step === "reset-password" ? "Enter OTP and new password" :
             step === "forgot" ? "Enter email to receive reset OTP" : 
             "Sign in to book venues"}
          </p>
        </div>
        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${
            message.includes("success") || message.includes("sent")
              ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
              : "bg-red-100 text-red-800 border-red-200"
          }`}>
            {message}
          </div>
        )}
        {/* Login Form */}
       {step === "login" && (
          <>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              {loading ? "..." : "Send OTP"}
            </button>
            <div className="text-center space-y-2">
              <button onClick={() => setStep("register")} className="text-indigo-600 hover:text-indigo-800 font-semibold text-lg w-full py-2 block">
                Create new account
              </button>
              <button onClick={() => setStep("forgot")} className="text-slate-600 hover:text-slate-800 font-semibold text-lg w-full py-2 block">
                Forgot password?
              </button>
            </div>
          </>
        )}
        {/* Register Form */}
        {step === "register" && (
          <>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
              placeholder="John Doe"
              required
              />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
                placeholder="your@email.com"
                required
                />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-transparent transition-all text-lg"
                  placeholder="••••••••"
                  minLength={6}
                  />
                  </div>
                  </div>
                  <button
                  onClick={handleSubmit}
                  disabled={loading || !email || !password || !name}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all"
                  >
                    {loading ? "..." : "Create Account"}
                    </button>
                    <p className="text-center">
                      <button 
                      onClick={() => setStep("login")} 
                      className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Already have account? Sign in
                        </button>
                        </p>
                        </>
                      )}
                      {/* Forgot Password Form */}
                      {step === "forgot" && (
                        <>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                            <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
                            placeholder="your@email.com"
                            required
                            />
                            </div>
                            </div>
                            <button
                            onClick={handleSubmit}
                            disabled={loading || !email}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all"
                            >
                              {loading ? "..." : "Send Reset OTP"}
                              </button>
                              <p className="text-center">
                                <button 
                                onClick={() => setStep("login")} 
                                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                                >
                                  Back to login
                                  </button>
                                  </p>
                                  </>
                                )}
                                {/* Reset Password Form */}
                                {step === "reset-password" && (
                                  <>
                                  <div className="space-y-5">
                                    <div>
                                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                      <input
                                      type="email"
                                      value={email}
                                      readOnly
                                      className="w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-lg"
                                      />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Verification OTP</label>
                                        <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                                        maxLength={6}
                                        className="w-full px-6 py-6 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-orange-500 focus:border-transparent text-2xl font-mono text-center tracking-widest transition-all"
                                        placeholder="______"
                                        />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                                          <input
                                          type="password"
                                          value={newPassword}
                                          onChange={(e) => setNewPassword(e.target.value)}
                                          className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                                          placeholder="••••••••"
                                           minLength={6}
                                           />
                                           </div>
                                           <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                                            <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:border-transparent transition-all text-lg"
                                            placeholder="••••••••"
                                            />
                                            </div>
                                            </div>
                                            <button
                                            onClick={handleSubmit}
                                            disabled={loading || otp.length !== 6 || newPassword.length < 6 || confirmPassword !== newPassword}
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all"
                                            >
                                              {loading ? "..." : "Reset Password"}
                                              </button>
                                              <p className="text-center">
                                                <button onClick={() => setStep("login")} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                                  Back to login
                                                  </button>
                                                  </p>
                                                  </>
                                                )}
                                                {/* OTP Form */}
                                                {step === "otp" && (
                                                  <>
                                                  <div className="space-y-5">
                                                    <div>
                                                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                                      <input
                                                      type="email"
                                                      value={email}
                                                      readOnly
                                                      className="w-full px-4 py-4 border border-slate-200 rounded-xl bg-slate-50 text-lg"
                                                      />
                                                      </div>
                                                      <div>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter 6-digit OTP</label>
                                                        <input
                                                        type="text"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                                                        maxLength={6}
                                                        className="w-full px-6 py-6 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent text-2xl font-mono text-center tracking-widest transition-all"
                                                        placeholder="______"
                                                        />
                                                        </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                          <button
                                                          onClick={verifyOTP}
                                                          disabled={loading || otp.length !== 6}
                                                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl hover:shadow-3xl transition-all"
                                                          >
                                                            {loading ? "Verifying..." : "Verify OTP"}
                                                            </button>
                                                            <button
                                                            onClick={handleSubmit}
                                                            disabled={loading}
                                                            className="w-full text-indigo-600 hover:text-indigo-800 font-semibold py-3 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all"
                                                            >
                                                              Resend OTP
                                                              </button>
                                                              </div>
                                                              <p className="text-center text-sm text-slate-600">
                                                                Didn&apos;t receive? Check spam folder
                                                                </p>
                                                                <p className="text-center">
                                                                  <button onClick={() => setStep("login")} className="text-slate-600 hover:text-slate-800 font-semibold">
                                                                    Back to login
                                                                    </button>
                                                                    </p>
                                                                    </>
                                                                  )}
                                                                  </div>
                                                                  </div>
                                                                  </>
                                                                  );
                                                                }
