"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play, Pause, Scissors, Check, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WaveSurfer from "wavesurfer.js";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000";

function TrimContent() {
    const searchParams = useSearchParams();
    const file = searchParams.get("file");
    const title = searchParams.get("title");
    const router = useRouter();

    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number>(0);
    const [region, setRegion] = useState<{ start: string | number; end: string | number }>({ start: "0", end: "30" });
    const regionRef = useRef({ start: 0, end: 30 });
    const [isTrimming, setIsTrimming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const isPreviewing = useRef(false);

    // Keep regionRef in sync with state for event listeners
    useEffect(() => {
        regionRef.current = {
            start: Number(region.start) || 0,
            end: Number(region.end) || duration || 30
        };
    }, [region, duration]);

    useEffect(() => {
        if (!file) {
            console.log("TrimPage: No file parameter found");
            router.push("/");
            return;
        }

        if (!waveformRef.current) {
            console.log("TrimPage: Waveform ref not ready");
            return;
        }

        console.log("TrimPage: Initializing WaveSurfer for:", file);

        try {
            wavesurfer.current = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "#E7E5E4",
                progressColor: "#292524",
                cursorColor: "#292524",
                barWidth: 2,
                barGap: 3,
                barRadius: 10,
                height: 100,
                url: `${API_URL}/files/${file}`,
            });

            // Fallback timeout in case 'ready' event doesn't fire
            const timeout = setTimeout(() => {
                if (isLoading) {
                    console.warn("TrimPage: WaveSurfer ready event timed out. Forcing UI state.");
                    setIsLoading(false);
                }
            }, 10000);

            wavesurfer.current.on("ready", () => {
                clearTimeout(timeout);
                console.log("TrimPage: WaveSurfer ready, duration:", wavesurfer.current?.getDuration());
                const d = wavesurfer.current?.getDuration() || 0;
                setDuration(d);
                const initialRegion = { start: "0", end: Math.min(30, d).toString() };
                setRegion(initialRegion);
                regionRef.current = { start: 0, end: Math.min(30, d) };
                setIsLoading(false);
            });

            wavesurfer.current.on("timeupdate", (currentTime) => {
                // Only enforce the end-stop if we are in "Preview" mode (started by button)
                if (isPreviewing.current && currentTime >= regionRef.current.end) {
                    wavesurfer.current?.pause();
                    wavesurfer.current?.setTime(regionRef.current.start);
                    isPreviewing.current = false;
                }
            });

            wavesurfer.current.on("error", (err) => {
                clearTimeout(timeout);
                console.error("TrimPage: WaveSurfer error:", err);
                toast.error("Error loading audio waveform.");
                setIsLoading(false); // allow them to try playing at least
            });

            wavesurfer.current.on("interaction", () => {
                // Manual interaction disables "Preview" mode so user can hear anywhere
                isPreviewing.current = false;
                wavesurfer.current?.play();
            });

            wavesurfer.current.on("play", () => setIsPlaying(true));
            wavesurfer.current.on("pause", () => {
                setIsPlaying(false);
                // Also reset preview mode if we pause manually
                isPreviewing.current = false;
            });
        } catch (err) {
            console.error("TrimPage: Critical initialization error:", err);
        }

        return () => {
            console.log("TrimPage: Destroying WaveSurfer");
            wavesurfer.current?.destroy();
        };
    }, [file, router]);

    const handlePlayPause = () => {
        if (!wavesurfer.current) return;

        const currentTime = wavesurfer.current.getCurrentTime();
        const { start, end } = regionRef.current;

        // If we are currently paused and want to play, enable Preview mode
        if (!isPlaying) {
            isPreviewing.current = true;

            // If we are outside the region, jump back to start
            if (currentTime >= end || currentTime < start) {
                wavesurfer.current.setTime(start);
            }
        } else {
            // If we are playing and hit the button, just stop
            isPreviewing.current = false;
        }

        wavesurfer.current.playPause();
    };

    const handleTrim = async () => {
        if (!file) return;
        setIsTrimming(true);
        const toastId = toast.loading("Creating ringtone...");

        try {
            await axios.post(`${API_URL}/trim`, {
                file,
                title,
                start: Number(region.start) || 0,
                end: Number(region.end) || duration || 30,
            });
            toast.success("Ringtone saved to library!", { id: toastId });
            router.push("/library");
        } catch (error) {
            console.error(error);
            toast.error("Trimming failed.", { id: toastId });
        } finally {
            setIsTrimming(false);
        }
    };

    return (
        <div className="relative space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[2rem] space-y-4"
                    >
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="font-medium">Loading waveform...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col items-center space-y-6 pt-4">
                {/* Vinyl/Disc Animation */}
                <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{
                        rotate: {
                            duration: 3,
                            repeat: isPlaying ? Infinity : 0,
                            ease: "linear"
                        }
                    }}
                    className="relative w-48 h-48 bg-primary rounded-full flex items-center justify-center border-8 border-accent shadow-2xl overflow-hidden"
                >
                    {/* Vinyl grooves */}
                    <div className="absolute inset-2 border border-white/10 rounded-full" />
                    <div className="absolute inset-4 border border-white/10 rounded-full" />
                    <div className="absolute inset-6 border border-white/10 rounded-full" />
                    <div className="absolute inset-8 border border-white/10 rounded-full" />

                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center border-4 border-primary z-10">
                        <div className="w-4 h-4 bg-primary rounded-full shadow-inner" />
                    </div>
                </motion.div>

                <div className="text-center">
                    <h2 className="text-xl font-bold">Trim Your Audio</h2>
                    <p className="text-muted-foreground text-sm">Select the best 30 seconds</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
                <div
                    ref={waveformRef}
                    className="w-full min-h-[128px] bg-muted/20 rounded-xl"
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Start (s)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={region.start}
                            onChange={(e) => setRegion({ ...region, start: e.target.value })}
                            className="w-full h-12 px-4 bg-muted/50 rounded-xl focus:outline-none font-medium"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">End (s)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={region.end}
                            onChange={(e) => setRegion({ ...region, end: e.target.value })}
                            className="w-full h-12 px-4 bg-muted/50 rounded-xl focus:outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={handlePlayPause}
                        className="flex-1 h-16 bg-secondary text-secondary-foreground rounded-2xl font-semibold flex items-center justify-center space-x-2 tap-effect"
                    >
                        {isPlaying ? (
                            <><Pause className="w-6 h-6" /><span>Pause</span></>
                        ) : (
                            <><Play className="w-6 h-6" /><span>Preview</span></>
                        )}
                    </button>

                    <button
                        onClick={handleTrim}
                        disabled={isTrimming}
                        className="flex-1 h-16 bg-primary text-primary-foreground rounded-2xl font-semibold flex items-center justify-center space-x-2 tap-effect disabled:opacity-50"
                    >
                        {isTrimming ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <><Check className="w-6 h-6" /><span>Save</span></>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-accent/30 rounded-2xl flex items-start space-x-3">
                <Scissors className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-sm text-primary/80 leading-relaxed">
                    Tip: Most ringtones are <strong>20-30 seconds</strong> long. Make sure the start time aligns with your favorite part!
                </p>
            </div>
        </div>
    );
}

export default function TrimPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <TrimContent />
        </Suspense>
    );
}
