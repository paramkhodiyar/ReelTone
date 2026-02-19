"use client";

import { useEffect, useState } from "react";
import { Music, Download, Play, Trash2, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "https://nonmoderately-nonfermented-dave.ngrok-free.dev";

export default function LibraryPage() {
    const [ringtones, setRingtones] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchLibrary();
    }, []);

    const fetchLibrary = async () => {
        try {
            const response = await axios.get(`${API_URL}/library`, {
                headers: { "ngrok-skip-browser-warning": "any" }
            });
            setRingtones(response.data.files);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load library.");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlay = (filename: string) => {
        if (currentPlaying === filename) {
            audio?.pause();
            setCurrentPlaying(null);
            setAudio(null);
        } else {
            audio?.pause();
            const newAudio = new Audio(`${API_URL}/ringtones/${filename}`);
            newAudio.play();
            newAudio.onended = () => setCurrentPlaying(null);
            setAudio(newAudio);
            setCurrentPlaying(filename);
        }
    };

    const handleDownload = (filename: string) => {
        const link = document.createElement("a");
        link.href = `${API_URL}/ringtones/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Download started!");
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Your Library</h1>
                <p className="text-muted-foreground text-sm">All your created ringtones in one place</p>
            </div>

            <AnimatePresence mode="popLayout">
                {ringtones.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 px-6 text-center bg-card border border-border border-dashed rounded-[2rem] space-y-4"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Music className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">No ringtones yet</h3>
                            <p className="text-sm text-muted-foreground">Start by downloading some audio from a link.</p>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {ringtones.map((f, i) => (
                            <motion.div
                                key={f}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Music className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold truncate text-sm">Ringtone {i + 1}</p>
                                        <p className="text-xs text-muted-foreground truncate">{f}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePlay(f)}
                                        className="w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center tap-effect"
                                    >
                                        {currentPlaying === f ? <div className="w-3 h-3 bg-primary rounded-xs" /> : <Play className="w-4 h-4 fill-current" />}
                                    </button>
                                    <button
                                        onClick={() => handleDownload(f)}
                                        className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center tap-effect"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Info className="w-4 h-4" />
                <span className="text-xs">Ringtones are stored locally on this machine</span>
            </div>
        </div>
    );
}
