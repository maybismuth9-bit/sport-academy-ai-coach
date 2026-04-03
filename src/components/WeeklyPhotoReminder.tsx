import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const WeeklyPhotoReminder = () => {
  const { t } = useLang();
  const [showReminder, setShowReminder] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkWeeklyReminder();
  }, []);

  const checkWeeklyReminder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const lastDismissed = localStorage.getItem(`fuelcore_photo_reminder_${user.id}`);
    if (lastDismissed) {
      const diff = Date.now() - parseInt(lastDismissed);
      if (diff < 7 * 24 * 60 * 60 * 1000) return; // Less than 7 days
    }

    // Check if user uploaded a photo this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count } = await supabase
      .from("user_progress_photos")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", weekAgo.toISOString());

    if ((count || 0) === 0) {
      setTimeout(() => setShowReminder(true), 2000);
    }
  };

  const dismissReminder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) localStorage.setItem(`fuelcore_photo_reminder_${user.id}`, String(Date.now()));
    setShowReminder(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("progress-photos")
        .getPublicUrl(filePath);

      await supabase.from("user_progress_photos").insert({
        user_id: user.id,
        image_url: publicUrl,
      });

      toast({ title: "📸", description: t("progress.uploaded") });
      dismissReminder();
    } catch (err: any) {
      toast({ title: t("progress.error"), description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {showReminder && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <div className="glass-card rounded-2xl p-5 border border-primary/20 shadow-[0_0_30px_hsl(180_80%_50%/0.15)]">
            <button onClick={dismissReminder} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-sm">Weekly Progress Check!</p>
                <p className="text-xs text-muted-foreground">Track your transformation with a photo</p>
              </div>
            </div>
            <label className="block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Button
                asChild
                className="w-full h-10 bg-cta-green hover:bg-cta-green/90 text-black font-bold text-sm"
                disabled={uploading}
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? t("progress.uploading") : "Upload Progress Photo"}
                </span>
              </Button>
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeeklyPhotoReminder;
