import type React from "react";
import {
    createContext,
    useContext,
    useRef,
    type ReactNode,
} from "react";
import useFiles from "../hooks/useFiles";
import { useAudioPlayback } from "../hooks/useAudioPlayer";


// Split context: File info
type FileContextProps = {
    currentFile: any;
    loading: boolean;
};
const FileContext = createContext<FileContextProps | undefined>(undefined);
export const useFileContext = () => {
    const ctx = useContext(FileContext);
    if (!ctx) throw new Error("useFileContext must be used within FileContext.Provider");
    return ctx;
};

// Split context: Audio playback
type AudioContextProps = {
    waveFormRef: React.RefObject<HTMLDivElement>;
    isReady: boolean;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seekTo: (fraction: number) => void;
    waveSurferRef: React.RefObject<HTMLDivElement>;
    formatTime: (time: number) => string;
    getCurrentTimeForComment: () => number;
    seekToTime: (time: number) => void;
};
const AudioContext = createContext<AudioContextProps | undefined>(undefined);
export const useAudioContext = () => {
    const ctx = useContext(AudioContext);
    if (!ctx) throw new Error("useAudioContext must be used within AudioContext.Provider");
    return ctx;
};

type ProviderProps = {
    children: ReactNode;
};


export const SingleFileContextProvider = ({ children }: ProviderProps) => {
    const { currentFile, isLoading } = useFiles({ includeStreamUrl: true });
    const waveFormRef = useRef<HTMLDivElement>(null);
    const {
        isReady,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        togglePlay,
        seekTo,
        waveSurferRef,
    } = useAudioPlayback(waveFormRef, currentFile?.streamUrl as string);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };
    const getCurrentTimeForComment = () => currentTime;
    const seekToTime = (time: number) => {
        if (duration > 0) {
            const fraction = time / duration;
            seekTo(fraction);
        }
    };

    const fileContextValue: FileContextProps = {
        currentFile,
        loading: isLoading,
    };

    const audioContextValue: AudioContextProps = {
        waveFormRef,
        isReady,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        togglePlay,
        seekTo,
        waveSurferRef,
        formatTime,
        getCurrentTimeForComment,
        seekToTime,
    };

    return (
        <FileContext.Provider value={fileContextValue}>
            <AudioContext.Provider value={audioContextValue}>
                {children}
            </AudioContext.Provider>
        </FileContext.Provider>
    );
};

export default SingleFileContextProvider;
