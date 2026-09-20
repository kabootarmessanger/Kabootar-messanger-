"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ensureUserDoc, normalizePhone } from "@/lib/realChat";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from "firebase/auth";

// LocalStorage keys used to remember the pending login across the redirect
// to Gmail and back (Firebase's email-link flow needs the email again when
// the link is opened, and we need the phone number to attach to the account).
const LS_EMAIL = "kabootar_pending_email";
const LS_PHONE = "kabootar_pending_phone";
const LS_NAME = "kabootar_pending_name";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | sent | completing | needEmail

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Already signed in? Don't show the login form, go straight to the app.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Handle the return trip: the user clicked the link in their Gmail inbox
  // and landed back on this page — finish signing them in automatically.
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const savedEmail = window.localStorage.getItem(LS_EMAIL);
    if (!savedEmail) {
      // Link opened in a different browser/device than it was requested from.
      setStep("needEmail");
      return;
    }
    completeSignIn(savedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completeSignIn = async (emailToUse) => {
    setStep("completing");
    setError("");
    try {
      const cred = await signInWithEmailLink(auth, emailToUse, window.location.href);
      const savedPhone = window.localStorage.getItem(LS_PHONE) || "";
      const savedName = window.localStorage.getItem(LS_NAME) || "";
      await ensureUserDoc(cred.user, { phoneNumber: savedPhone, name: savedName });
      window.localStorage.removeItem(LS_EMAIL);
      window.localStorage.removeItem(LS_PHONE);
      window.localStorage.removeItem(LS_NAME);
      router.push("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
      setStep("form");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fullPhone = normalizePhone(phone);
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: window.location.href,
        handleCodeInApp: true
      });
      window.localStorage.setItem(LS_EMAIL, email.trim());
      window.localStorage.setItem(LS_PHONE, fullPhone);
      window.localStorage.setItem(LS_NAME, name.trim());
      setStep("sent");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    completeSignIn(email.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C85A32]">🕊️ Kabootar</h1>
          <p className="text-gray-500 mt-2">
            {step === "sent"
              ? "Apni Gmail check karo"
              : step === "completing"
              ? "Sign in ho raha hai…"
              : step === "needEmail"
              ? "Apni email confirm karo"
              : "Mobile number se sign in karo"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {step === "completing" && (
          <div className="text-center text-4xl py-8 animate-pulse">🕊️</div>
        )}

        {step === "sent" && (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <p className="text-sm text-gray-600">
              <strong>{email}</strong> pe login link bhej diya hai. Apni Gmail kholo aur link pe
              tap karo — is number se automatically sign in ho jaoge, koi OTP type nahi karna
              padega.
            </p>
            <p className="text-xs text-gray-400">
              (SMS OTP ki jagah Gmail link use hoti hai — isse koi cost nahi lagti.)
            </p>
            <button
              onClick={() => setStep("form")}
              className="text-[#C85A32] text-sm font-semibold hover:underline"
            >
              Number ya email badalna hai?
            </button>
          </div>
        )}

        {step === "needEmail" && (
          <form onSubmit={handleConfirmEmail} className="space-y-5">
            <p className="text-sm text-gray-600 text-center">
              Ye link kisi aur browser/device pe khula hai. Confirm karne ke liye wahi email daalo
              jispe link bheji gayi thi.
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
              placeholder="you@gmail.com"
            />
            <button
              type="submit"
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all"
            >
              Confirm aur Sign In karo
            </button>
          </form>
        )}

        {step === "form" && (
          <form onSubmit={handleSend} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="Aapka naam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number (aapki identity)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-gray-400 mt-1">
                Dusre log isi number se aapko dhoondh kar message karenge.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail / Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="you@gmail.com"
              />
              <p className="text-xs text-gray-400 mt-1">Login link isi Gmail pe aayega.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Bhej rahe hain…" : "Login Link Bhejo"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
