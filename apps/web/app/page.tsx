"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download, Music, Loader2 } from "lucide-react";
import { PiHandsPrayingBold } from "react-icons/pi"
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://nonmoderately-nonfermented-dave.ngrok-free.dev";

export default function DownloadPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Welcome toast on first visit
  useEffect(() => {
    const visited = localStorage.getItem("visited");
    if (!visited) {
      toast("Radhe Radhe", {
        icon: <PiHandsPrayingBold className="text-primary" />,
        duration: 4000
      });
      localStorage.setItem("visited", "true");
    }
  }, []);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    const toastId = toast.loading("Connecting to server...");

    try {
      const response = await axios.post(`${API_URL}/download`, { url }, {
        timeout: 60000 // 1 minute timeout
      });

      if (response.data.error) {
        toast.error(response.data.error, { id: toastId });
        return;
      }

      toast.success("Ready to trim!", { id: toastId });

      const params = new URLSearchParams();
      params.append("file", response.data.file);
      if (response.data.title) params.append("title", response.data.title);

      router.push(`/trim?${params.toString()}`);
    } catch (error: any) {
      console.error("Download Error Details:", error);
      const message = error.response?.data?.detail || error.response?.data?.error || "Could not fetch audio. Check the link.";
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-10">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-4"
        >
          <Music className="w-10 h-10 text-primary" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-tight">ReelTone</h1>
        <p className="text-muted-foreground">Paste a link to start creating</p>
      </div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleDownload}
        className="w-full space-y-4"
      >
        <div className="space-y-2">
          <input
            type="url"
            placeholder="Paste YouTube or Instagram link"
            className="w-full h-14 px-4 bg-card border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !url}
          className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center space-x-2 tap-effect disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Get Audio</span>
            </>
          )}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="pt-8 grid grid-cols-2 gap-4 w-full"
      >
        <div className="p-4 bg-muted/50 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 1</span>
          <p className="text-sm font-medium">Download audio from any video link.</p>
        </div>
        <div className="p-4 bg-muted/50 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step 2</span>
          <p className="text-sm font-medium">Trim the exact portion you want.</p>
        </div>
      </motion.div>
    </div>
  );
}
