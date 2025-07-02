import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import Hover from "wavesurfer.js/dist/plugins/hover.esm.js";

export interface AudioPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isLoading: boolean;
}

export const useAudioPlayback = (
    containerRef: React.RefObject<HTMLElement | null>,
    src?: string,
) => {
    const waveSurferRef = useRef<WaveSurfer | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // init wavesurfer
    useEffect(() => {
        if (!containerRef?.current || !src) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: "#ccc",
            progressColor: "#ffcc15",
            barWidth: 2,
            height: 100,
            cursorColor: "#111",
            plugins: [
                Hover.create({
                    lineColor: '#111',
                    lineWidth: 2,
                    labelBackground: '#555',
                    labelColor: '#fff',
                    labelSize: '11px',
                    labelPreferLeft: false,
                })
            ]
        });

        waveSurferRef.current = ws;

        ws.load(src as string);

        ws.on("ready", () => {
            setIsReady(true);
            setDuration(ws.getDuration());
        });

        ws.on("audioprocess", () => {
            setCurrentTime(ws.getCurrentTime());
        });

        ws.on("seeking", () => {
            setCurrentTime(ws.getCurrentTime());
        });

        ws.on("finish", () => {
            setIsPlaying(false);
        });

        return () => ws.destroy();
    }, [containerRef, src]);

    const play = useCallback(() => {
        if (waveSurferRef.current && isReady) {
            waveSurferRef.current.play();
            setIsPlaying(true);
        }
    }, [isReady]);

    const pause = useCallback(() => {
        if (waveSurferRef.current && isReady) {
            waveSurferRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (waveSurferRef.current && isReady) {
            waveSurferRef.current.playPause();
            setIsPlaying(waveSurferRef.current.isPlaying());
        }
    }, [isReady]);

    const seekTo = useCallback((fraction: number) => {
        // fraction = value between 0 and 1
        waveSurferRef.current?.seekTo(fraction);
    }, []);

    return {
        isReady,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        togglePlay,
        seekTo,
        waveSurferRef,
    };
};
