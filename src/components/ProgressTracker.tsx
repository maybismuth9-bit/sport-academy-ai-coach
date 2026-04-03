import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/contexts/LangContext";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Trash2, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ProgressTracker = () => {
  const { t } = useLang();
  const [photos, setPhotos] = useState<{ id: string; image_url: string; created_at: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_progress_photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPhotos(data);
    setLoading(false);
  };

  useEffect(() => { fetchPhotos(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("progress-photos")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("user_progress_photos")
        .insert({ user_id: user.id, image_url: urlData.publicUrl });
      if (dbError) throw dbError;

      toast({ title: t("progress.uploaded") });
      fetchPhotos();
    } catch (err: any) {
      toast({ title: t("progress.error"), description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("user_progress_photos").delete().eq("id", id);
    setPhotos(photos.filter(p => p.id !== id));
  };

  return (
    <div className="px-5 pt-8 pb-28">
      <div className="flex items-center gap-2 mb-1">
        <Camera className="w-5 h-5 text-primary" />
        <h1 className="text-lg font-display font-bold tracking-wider neon-text text-primary">
          {t("progress.title")}
        </h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{t("progress.subtitle")}</p>

      <label className="block">
        <div className="glass-card rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors border-2 border-dashed border-border">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading ? t("progress.uploading") : t("progress.uploadHint")}
          </span>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {loading ? (
        <div className="flex justify-center mt-8">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-center text-muted-foreground mt-8 text-sm">{t("progress.empty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-6">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative group rounded-xl overflow-hidden glass-card"
            >
              <img src={photo.image_url} alt="Progress" className="w-full aspect-square object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
                <p className="text-[10px] text-white/70">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-2 right-2 bg-destructive/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
