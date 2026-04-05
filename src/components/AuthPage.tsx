import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/contexts/LangContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthPageProps {
  onAuth: () => void;
}

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

type AuthMode = "login" | "signup" | "forgot" | "verify" | "reset_verify" | "reset_password";

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const { t } = useLang();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score++;
    if (pw.length >= 12) score++;
    return score;
  };

  const strengthLabel = () => {
    const s = getPasswordStrength(password);
    if (s <= 1) return { text: t("auth.weak"), color: "bg-red-500" };
    if (s === 2) return { text: t("auth.medium"), color: "bg-yellow-500" };
    if (s === 3) return { text: t("auth.strong"), color: "bg-green-500" };
    return { text: t("auth.veryStrong"), color: "bg-emerald-400" };
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (error) throw error;
      toast({ title: t("auth.verifySuccess"), description: t("auth.verifySuccessDesc") });
      onAuth();
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async () => {
    if (otpCode.length !== 6) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "recovery",
      });
      if (error) throw error;
      // OTP verified, now show new password form
      setMode("reset_password");
      setOtpCode("");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: t("auth.error"), description: t("auth.passwordsNoMatch"), variant: "destructive" });
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      toast({ title: t("auth.error"), description: t("auth.passwordRequirements"), variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: t("auth.passwordUpdated"), description: t("auth.passwordUpdatedDesc") });
      setPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      if (mode === "reset_verify") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email,
        });
        if (error) throw error;
      }
      toast({ title: t("auth.otpResent"), description: t("auth.otpResentDesc") });
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast({ title: t("auth.resetSent"), description: t("auth.resetSentDesc") });
        setMode("reset_verify");
        setOtpCode("");
        setLoading(false);
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else {
        if (!PASSWORD_REGEX.test(password)) {
          toast({ title: t("auth.error"), description: t("auth.passwordRequirements"), variant: "destructive" });
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        // If auto-confirm is enabled, session is returned immediately
        if (data.session) {
          onAuth();
        } else {
          setMode("verify");
          toast({ title: t("auth.checkEmail"), description: t("auth.otpSentDesc") });
        }
      }
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Reset Password - New Password Form (after OTP verified)
  if (mode === "reset_password") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold neon-text text-primary">FUELCORE</h1>
            <p className="text-sm text-muted-foreground">{t("auth.newPassword")}</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-secondary/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Input
              type="password"
              placeholder={t("auth.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-secondary/50"
            />

            {password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= getPasswordStrength(password) ? strengthLabel().color : "bg-secondary"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {strengthLabel().text} — {t("auth.passwordRequirements")}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-cta-green hover:bg-cta-green/90 text-black font-bold"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("auth.updatePassword")}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // OTP Verification Screens (signup & reset)
  if (mode === "verify" || mode === "reset_verify") {
    const isReset = mode === "reset_verify";
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              {isReset ? <KeyRound className="w-8 h-8 text-primary" /> : <ShieldCheck className="w-8 h-8 text-primary" />}
            </div>
            <h1 className="text-2xl font-display font-bold neon-text text-primary">FUELCORE</h1>
            <p className="text-sm text-muted-foreground">
              {isReset ? t("auth.resetOtpTitle") : t("auth.otpTitle")}
            </p>
            <p className="text-xs text-muted-foreground/70">{email}</p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(value) => setOtpCode(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={isReset ? handleVerifyResetOtp : handleVerifyOtp}
            className="w-full bg-cta-green hover:bg-cta-green/90 text-black font-bold"
            disabled={loading || otpCode.length !== 6}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("auth.verifyCode")}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">{t("auth.noCodeReceived")}</p>
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-xs text-primary hover:underline"
            >
              {t("auth.resendCode")}
            </button>
            <div>
              <button
                onClick={() => { setMode(isReset ? "forgot" : "signup"); setOtpCode(""); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← {isReset ? t("auth.backToLogin") : t("auth.backToSignup")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card rounded-2xl p-8 w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold neon-text text-primary">FUELCORE</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" && t("auth.loginSubtitle")}
            {mode === "signup" && t("auth.signupSubtitle")}
            {mode === "forgot" && t("auth.forgotSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              type="text"
              placeholder={t("auth.firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="bg-secondary/50"
            />
          )}
          <Input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-secondary/50"
          />
          {mode !== "forgot" && (
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-secondary/50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {mode === "signup" && password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= getPasswordStrength(password) ? strengthLabel().color : "bg-secondary"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {strengthLabel().text} — {t("auth.passwordRequirements")}
              </p>
            </div>
          )}

          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="text-xs text-primary hover:underline block"
            >
              {t("auth.forgotPassword")}
            </button>
          )}

          <Button
            type="submit"
            className="w-full bg-cta-green hover:bg-cta-green/90 text-black font-bold"
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" && t("auth.login")}
            {mode === "signup" && t("auth.signup")}
            {mode === "forgot" && t("auth.sendReset")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              {t("auth.noAccount")}{" "}
              <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                {t("auth.signup")}
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              {t("auth.hasAccount")}{" "}
              <button onClick={() => setMode("login")} className="text-primary hover:underline">
                {t("auth.login")}
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-primary hover:underline">
              ← {t("auth.backToLogin")}
            </button>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
