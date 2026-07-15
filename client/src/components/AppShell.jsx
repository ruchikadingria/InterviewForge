import { useNavigate } from "react-router-dom";

const AppShell = ({ children, compact = false }) => {
  const navigate = useNavigate();
  const authenticated = Boolean(localStorage.getItem("token"));

  return (
    <div className="page-shell">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:h-24 sm:px-8 lg:px-10">
          <button className="group text-left" onClick={() => navigate(authenticated ? "/dashboard" : "/login")}>
            <span>
              <span className="block font-display text-2xl leading-6 text-ink sm:text-[1.7rem]">InterviewForge</span>
              <span className="mt-1.5 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">Practice with purpose</span>
            </span>
          </button>
          {authenticated && !compact && (
            <nav className="flex items-center gap-1">
              <button className="hidden px-3 py-2 text-sm font-medium text-slate-600 hover:text-ink sm:block" onClick={() => navigate("/interview/history")}>Interviews</button>
              <button className="hidden px-3 py-2 text-sm font-medium text-slate-600 hover:text-ink sm:block" onClick={() => navigate("/dsa/history")}>Assessments</button>
              <button className="ml-1 rounded-sm border border-line px-3 py-2 text-sm font-semibold text-ink hover:bg-slate-50" onClick={() => navigate("/dashboard")}>Dashboard</button>
            </nav>
          )}
        </div>
      </header>
      {children}
      <footer className="border-t border-line py-6 text-center text-xs text-slate-500">InterviewForge · Deliberate practice for better interviews</footer>
    </div>
  );
};

export const LoadingState = ({ label = "Loading..." }) => (
  <AppShell><main className="page-container"><div className="card flex items-center gap-3 text-sm text-slate-600"><span className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-navy" />{label}</div></main></AppShell>
);

export const ErrorState = ({ message }) => (
  <AppShell><main className="page-container"><div className="notice notice-error">{message}</div></main></AppShell>
);

export default AppShell;
