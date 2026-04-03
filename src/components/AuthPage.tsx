import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/contexts/LangContext";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface AuthPageProps {
  onAuth: () => void;
}

const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const { t } = useLang();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: t("auth.resetSent"), description: t("auth.resetSentDesc") });
        setLoading(false);
        return;
      }

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!PASSWORD_REGEX.test(password)) {
          toast({ title: t("auth.error"), description: t("auth.passwordRequirements"), variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: t("auth.checkEmail"), description: t("auth.checkEmailDesc") });
        setLoading(false);
        return;
      }
      onAuth();
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
