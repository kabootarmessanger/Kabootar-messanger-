"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("PHONE"); // PHONE या OTP
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(25);
  const router = useRouter();

  // 25 सेकंड का टाइमर
  useEffect(() => {
    let interval;
    if (step === "OTP" && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // reCAPTCHA सेटअप करना (बैकग्राउंड में चलेगा)
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  // OTP भेजने का फंक्शन
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // भारत के लिए +91 जोड़ना (अगर यूजर ने नहीं डाला है तो)
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep("OTP");
      setTimer(25); // टाइमर रीसेट
    } catch (err) {
      console.error(err);
      setError("OTP भेजने में समस्या आई। कृपया नंबर चेक करें।");
    } finally {
      setLoading(false);
    }
  };

  // OTP वेरिफाई करने का फंक्शन
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);
      // लॉगिन सफल! चैट पेज पर भेजें
      router.push("/chat");
    } catch (err) {
      console.error(err);
      setError("गलत OTP! कृपया दोबारा प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e7ebf0] p-4 font-sans">
      {/* reCAPTCHA के लिए छिपा हुआ डिब्बा */}
      <div id="recaptcha-container"></div>

      <div className="bg-[#e7ebf0] p-8 rounded-3xl shadow-[20px_20px_40px_#c5c9ce,-20px_-20px_40px_#ffffff] w-full max-w-md relative z-10">
        
        {/* लॉक आइकॉन */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#e7ebf0] rounded-full flex items-center justify-center shadow-[5px_5px_10px_#c5c9ce,-5px_-5px_10px_#ffffff]">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {step === "PHONE" ? "Verify Your Number" : "Verify Your OTP"}
        </h2>
        
        <p className="text-center text-gray-500 text-sm mb-8">
          {step === "PHONE" 
            ? "We'll send a 6-digit verification code to your phone" 
            : `We've sent a code to +91 XXXXXX${phone.slice(-4)}`}
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-xl mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {step === "PHONE" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <input
                type="tel"
                placeholder="Enter Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl bg-[#e7ebf0] border-none shadow-[inset_5px_5px_10px_#c5c9ce,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? "Sending..." : "VERIFY OTP →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {/* 6-digit OTP Input */}
            <div className="flex justify-center gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOtp((prev) => {
                      const newOtp = prev.split('');
                      newOtp[i] = val;
                      return newOtp.join('');
                    });
                    // अगले इनपुट पर ऑटो-फोकस करें
                    if (val && e.target.nextSibling) {
                      e.target.nextSibling.focus();
                    }
                  }}
                  className="w-12 h-14 text-center text-xl font-bold bg-[#e7ebf0] rounded-xl shadow-[inset_5px_5px_10px_#c5c9ce,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "VERIFY & PROCEED"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Resend OTP in <span className="font-semibold text-gray-700">{timer} seconds</span>
            </p>
          </form>
        )}
      </div>

      {/* बैकग्राउंड के गोले (Circles) - सौंदर्य के लिए */}
      <div className="absolute w-72 h-72 bg-white rounded-full blur-3xl opacity-40 top-10 left-10 -z-10 animate-pulse"></div>
      <div className="absolute w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40 bottom-10 right-10 -z-10 animate-pulse"></div>
    </div>
  );
                  }
