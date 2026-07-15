import { useEffect, useRef, useState } from "react";
import axios from "axios";

const SCRIPT_ID = "google-identity-services";

const loadGoogleScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) return resolve();
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    existing.addEventListener("load", resolve, { once: true });
    existing.addEventListener("error", reject, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

const GoogleAuthButton = ({ onAuthenticated, onError, context = "signin" }) => {
  const buttonRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [loading, setLoading] = useState(Boolean(clientId));

  useEffect(() => {
    if (!clientId) return undefined;
    let active = true;
    loadGoogleScript().then(() => {
      if (!active || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            const response = await axios.post("http://localhost:8000/api/auth/google", { credential });
            localStorage.setItem("token", response.data.token);
            onAuthenticated(response.data);
          } catch (error) {
            onError(error.response?.data?.message || "Google authentication failed");
          }
        },
      });
      buttonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard", theme: "outline", size: "large", shape: "rectangular",
        text: context === "signup" ? "signup_with" : "signin_with",
        logo_alignment: "left", width: Math.min(buttonRef.current.clientWidth, 400),
      });
      setLoading(false);
    }).catch(() => { if (active) { setLoading(false); onError("Unable to load Google sign-in"); } });
    return () => { active = false; };
  }, [clientId, context, onAuthenticated, onError]);

  if (!clientId) return <p className="text-center text-xs text-amber-700">Google sign-in requires a client ID.</p>;
  return <div className="flex min-h-11 items-center justify-center">{loading && <span className="text-sm text-slate-500">Loading Google sign-in...</span>}<div className={loading ? "hidden" : "w-full"} ref={buttonRef} /></div>;
};

export default GoogleAuthButton;
