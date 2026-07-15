import { useCallback, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import GoogleAuthButton from "../components/GoogleAuthButton";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const handleGoogleSuccess = useCallback(() => navigate("/dashboard"), [navigate]);
  const handleGoogleError = useCallback((errorMessage) => setMessage(errorMessage), []);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => { e.preventDefault(); try { setSubmitting(true); setMessage(""); const response = await axios.post("http://localhost:8000/api/auth/login", formData); localStorage.setItem("token", response.data.token); navigate("/dashboard"); } catch (error) { setMessage(error.response?.data?.message || "Something went wrong"); } finally { setSubmitting(false); } };

  return <AppShell compact><main className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:px-10"><section className="hidden lg:block"><p className="eyebrow">Your practice desk</p><h1 className="max-w-lg font-display text-5xl leading-[1.08] text-ink">Prepare thoughtfully.<br />Interview confidently.</h1><p className="mt-5 max-w-md text-base leading-7 text-slate-600">Structured mock interviews and coding assessments built to help you find the gaps before the real conversation.</p><div className="mt-10 border-l-2 border-rust pl-5"><p className="font-display text-xl italic text-slate-700">&ldquo;Confidence is built in the hours nobody sees.&rdquo;</p></div></section><section className="mx-auto w-full max-w-md"><div className="card p-6 sm:p-6"><p className="eyebrow">Welcome back</p><h1 className="page-title">Sign in to continue</h1><p className="page-copy mb-7">Return to your practice sessions and progress.</p><GoogleAuthButton onAuthenticated={handleGoogleSuccess} onError={handleGoogleError} /><div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-line" /><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or use email</span><span className="h-px flex-1 bg-line" /></div><form className="space-y-5" onSubmit={handleSubmit}><div><label className="field-label" htmlFor="email">Email address</label><input className="field" id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required /></div><div><label className="field-label" htmlFor="password">Password</label><input className="field" id="password" type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required /></div>{message && <div className="notice notice-error">{message}</div>}<button className="btn btn-primary w-full" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Sign in"}</button></form><p className="mt-6 text-center text-sm text-slate-600">New to InterviewForge? <button className="font-semibold text-navy underline underline-offset-4" onClick={() => navigate("/register")}>Create an account</button></p></div></section></main></AppShell>;
};
export default LoginPage;
