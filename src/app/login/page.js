"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { ensureUserDoc } from "@/lib/realChat";
import { sendFlashCall, verifyFlashCall, toE164 } from "@/lib/flashCall";
import {
  signInWithCustomToken, updateProfile,
  sendPasswordResetEmail, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider
} from "firebase/auth";

// Phone number is the account's identity (see worker/firebaseToken.js —
// the Firebase uid is derived deterministically from it), so logging in
// again with the same verified number on any device restores the account.
// Email is optional and only used as a password-recovery path.
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
  const [challenge, setChallenge] = useState("");

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

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
      const normalizedPhone = toE164(phone);
      const ch = await sendFlashCall(normalizedPhone);
      setChallenge(ch);
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
      const { customToken } = await verifyFlashCall(challenge, otp.trim());
      const cred = await signInWithCustomToken(auth, customToken);

      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      await ensureUserDoc(cred.user, { phoneNumber: toE164(phone), name: name.trim() });

      if (email.trim()) {
        try {
          // Best-effort: lets this account also be recovered via email+password
          // later (see handleSendRecoveryEmail). Not fatal if it fails (e.g.
          // that email is already linked to a different account).
          await linkWithCredential(cred.user, EmailAuthProvider.credential(email.trim().toLowerCase(), otp.trim()));
        } catch {
          // non-fatal — phone login still succeeded
        }
      }

      router.push("/");
    } catch (err) {
      setError(err.message || "Galat OTP ya session expire ho gaya");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCall = async () => {
    setError("");
    setLoading(true);
    try {
      const normalizedPhone = toE164(phone);
      const ch = await sendFlashCall(normalizedPhone);
      setChallenge(ch);
      setInfo("Naya call bheja — phone uthao, OTP suno.");
    } catch (err) {
      setError(err.message || "Call dobara bhejne mein problem hui");
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
            {step === "otp" && "Call pe aaya code daalo"}
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
              <p className="text-xs text-gray-400 mt-1">Is number pe ek call aayega, usme OTP bola jayega.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gmail / Email (optional — sirf recovery ke liye)</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all"
                placeholder="you@gmail.com"
              />
              <p className="text-xs text-gray-400 mt-1">Naye phone pe account wapas lane ke kaam aayega.</p>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Call bhej rahe hain…" : "Verification Call Mangwao"}
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
              <strong>{phone}</strong> pe call ja raha hai — phone uthao, jo digits bole jaayen wahi yahan daalo
            </p>
            <input
              type="text" inputMode="numeric" maxLength={6} required
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C85A32] focus:ring-2 focus:ring-[#C85A32]/20 outline-none transition-all text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
            />
            <button
              type="submit" disabled={loading || otp.length < 4}
              className="w-full bg-[#C85A32] hover:bg-[#A84A28] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-70"
            >
              {loading ? "Check kar rahe hain…" : "Verify aur Login"}
            </button>
            <button
              type="button" onClick={handleResendCall} disabled={loading}
              className="w-full text-[#C85A32] text-sm font-semibold"
            >
              Call nahi aaya? Dobara mangwao
            </button>
            <button type="button" onClick={() => setStep("form")} className="w-full text-gray-400 text-sm">
              Number badalna hai?
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
