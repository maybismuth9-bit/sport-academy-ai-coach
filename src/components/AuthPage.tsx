import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/contexts/LangContext";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuthPageProps {
  onAuth: () => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const { t } = useLang();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
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
            {isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-secondary/50"
          />
          <Input
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-secondary/50"
          />
          <Button type="submit" className="w-full bg-cta-green hover:bg-cta-green/90 text-black font-bold" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? t("auth.login") : t("auth.signup")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
            {isLogin ? t("auth.signup") : t("auth.login")}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
