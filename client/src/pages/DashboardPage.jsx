import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";

const DashboardPage = () => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const actions = [
    { number: "01", title: "Mock interview", copy: "Practice role-specific questions in a structured text or voice session.", action: "Set up interview", path: "/interview/setup" },
    { number: "02", title: "DSA assessment", copy: "Solve three timed problems across easy, medium, and hard difficulty.", action: "Start assessment", path: "/dsa/setup" },
    { number: "03", title: "Resume desk", copy: "Upload your latest resume so your preparation stays aligned with your profile.", action: "Upload resume", path: "/resume" },
  ];
  return <AppShell><main className="page-container"><div className="page-header"><div><p className="eyebrow">Practice dashboard</p><h1 className="page-title">What will you work on today?</h1><p className="page-copy">Choose a focused exercise. Each completed session adds another useful signal to your preparation.</p></div><button className="btn btn-danger" onClick={handleLogout}>Sign out</button></div>
    <section className="grid gap-4 lg:grid-cols-3">{actions.map((item) => <article key={item.number} className="card group flex min-h-64 flex-col"><div className="mb-8 flex items-start justify-between"><span className="font-display text-4xl text-slate-200">{item.number}</span><span className="h-px w-12 bg-rust transition-all group-hover:w-16" /></div><h2 className="section-title">{item.title}</h2><p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{item.copy}</p><button className="mt-7 flex items-center gap-2 text-sm font-bold text-navy" onClick={() => navigate(item.path)}>{item.action}<span aria-hidden="true">→</span></button></article>)}</section>
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Review and improve</p><h2 className="section-title">Your past work</h2></div></div><div className="grid gap-4 sm:grid-cols-2"><button className="card flex items-center justify-between text-left hover:border-slate-400" onClick={() => navigate("/interview/history")}><span><strong className="block text-base text-ink">Interview history</strong><span className="mt-1 block text-sm text-slate-500">Review feedback and previous scores</span></span><span className="font-display text-2xl text-slate-400">→</span></button><button className="card flex items-center justify-between text-left hover:border-slate-400" onClick={() => navigate("/dsa/history")}><span><strong className="block text-base text-ink">Assessment history</strong><span className="mt-1 block text-sm text-slate-500">Revisit coding performance reports</span></span><span className="font-display text-2xl text-slate-400">→</span></button></div></section>
  </main></AppShell>;
};
export default DashboardPage;
