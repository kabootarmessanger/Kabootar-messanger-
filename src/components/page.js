"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ensureUserDoc, normalizePhone } from "@/lib/realChat";
import {
  signInAnonymously, updateProfile, EmailAuthProvider, linkWithCredential,
  sendPasswordResetEmail, signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";

// ── EmailJS setup (free, no backend needed) ──────────────────────────────
// 1. Sign up free at https://www.emailjs.com
// 2. Email Services → Add New Service → connect your Gmail → copy the
//    "Service ID"
// 3. Email Templates → Create New Template. Body must include these
//    variables so the OTP actually shows up in the email:
//      To: {{to_email}}
//      Subject: Your Kabootar login code
//      Body: Hi {{to_name}}, your Kabootar code is {{otp_code}}. It expires
//            in 10 minutes.
//    Copy the "Template ID".
// 4. Account → General → copy your "Public Key".
// 5. Account → Security → Allowed origins → add your GitHub Pages domain
//    (e.g. kabootarmessanger.github.io) so the request isn't blocked.
// 6. Paste all three below.
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(toEmail, toName, code) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: { to_email: toEmail, to_name: toName, otp_code: code }
    })
  });
  if (!res.ok) throw new Error("Email bhejne mein problem hui");
}

export default function LoginPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [recoverPassword, setRecoverPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | otp | recover-email | recover-password

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Already signed in (this device already completed OTP before)? Skip
  // straight into the app — this is what makes returning to the SAME
  // device feel instant, no OTP needed again.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Anonymous session first — this is what makes this device "this
      // account" going forward, and lets us securely store the OTP under
      // this uid (Firestore rules only let a uid touch its own OTP doc).
      const cred = await signInAnonymously(auth);
      const code = genOtp();
      await setDoc(doc(db, "otp_requests", cred.user.uid), {
        code,
        name: name.trim(),
        phoneNumber: normalizePhone(phone),
        email: email.trim().toLowerCase(),
        expiresAt: Date.now() + 10 * 60 * 1000
      });
      await sendOtpEmail(email.trim(), name.trim(), code);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      const snap = await getDoc(doc(db, "otp_requests", uid));
      if (!snap.exists()) {
        setError("Session expire ho gaya, dobara number/email daalo");
        setStep("form");
        return;
      }
      const data = snap.data();
      if (Date.now() > data.expiresAt) {
        setError("OTP expire ho gaya, naya bhejo");
        return;
      }
      if (data.code !== otp.trim()) {
        setError("Galat OTP, dobara check karo");
        return;
      }
      await updateProfile(auth.currentUser, { displayName: data.name });
      await ensureUserDoc(auth.currentUser, { phoneNumber: data.phoneNumber, name: data.name });
      await deleteDoc(doc(db, "otp_requests", uid));

      // Attach a real email credential to this anonymous account (using the
      // OTP itself as the password, never shown as a "password" anywhere).
      // This is what makes "recover my account on a new device" possible
      // later — without this, the account is permanently tied to this
      // browser only. If the email is already linked elsewhere (this
      // person signed up before, on another device), linking fails — that's
      // fine, their identity there is unaffected; they should use "Recover
      // on a new device" instead of creating a fresh one.
      try {
        await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(data.email, otp.trim()));
      } catch {
        // best-effort — not fatal to signup
      }

      router.push("/");
    } catch (err) {
      setError("Kuch galat ho gaya, dobara try karo");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRecoveryEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo(`Reset link ${email} pe bhej diya. Gmail kholo, link pe click karo, naya password set karo, phir yahan wapas aakar niche login karo.`);
      setStep("recover-password");
    } catch (err) {
      setError("Ye email kisi account se linked nahi mili. Pehle normal signup try karo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), recoverPassword);
      router.push("/");
    } catch (err) {
      setError("Sign in nahi hua — pehle Gmail ke link se naya password set kar liya?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#C85A32]">🕊️ Kabootar</h1>
          <p className="text-gray-500 mt-2">
            {step === "otp" && "Gmail mein aaya code daalo"}
            {step === "form" && "Mobile number se sign in karo"}
            {step === "recover-email" && "Naye device pe purana account lao"}
            {step === "recover-password" && "Password set karne ke baad login karo"}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        {info && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-4 text-sm text-center">{info}</div>}

        {step === "form" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="Aapka naam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number (aapki identity)</label>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
              <p className="text-xs text-gray-400 mt-1">Dusre log isi number se aapko dhoondh kar message karenge.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail / Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="you@gmail.com"
              />
              <p className="text-xs text-gray-400 mt-1">6-digit code isi Gmail pe aayega.</p>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Bhej rahe hain…" : "OTP Bhejo"}
            </button>
            <button
              type="button"
              onClick={() => { setError(""); setInfo(""); setStep("recover-email"); }}
              className="w-full text-gray-500 text-sm"
            >
              Pehle se account hai (naye device pe)?
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <p className="text-sm text-gray-600 text-center">
              <strong>{email}</strong> pe 6-digit code bheja hai
            </p>
            <input
              type="text" inputMode="numeric" maxLength={6} required
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
            />
            <button
              type="submit" disabled={loading || otp.length !== 6}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Check kar rahe hain…" : "Verify aur Login"}
            </button>
            <button type="button" onClick={() => setStep("form")} className="w-full text-[#C85A32] text-sm font-semibold">
              Number ya email badalna hai?
            </button>
          </form>
        )}

        {step === "recover-email" && (
          <form onSubmit={handleSendRecoveryEmail} className="space-y-5">
            <p className="text-sm text-gray-600 text-center">
              Jis Gmail se pehle signup kiya tha wahi daalo — ek reset-link jayega.
            </p>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
              placeholder="you@gmail.com"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Bhej rahe hain…" : "Reset Link Bhejo"}
            </button>
            <button type="button" onClick={() => { setError(""); setStep("form"); }} className="w-full text-[#C85A32] text-sm font-semibold">
              Wapas jao
            </button>
          </form>
        )}

        {step === "recover-password" && (
          <form onSubmit={handleRecoverySignIn} className="space-y-5">
            <input
              type="password" required value={recoverPassword} onChange={(e) => setRecoverPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
              placeholder="Wo naya password jo Gmail link se set kiya"
            />
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Sign in ho raha hai…" : "Login"}
            </button>
            <button type="button" onClick={() => { setError(""); setInfo(""); setStep("form"); }} className="w-full text-[#C85A32] text-sm font-semibold">
              Wapas jao
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
