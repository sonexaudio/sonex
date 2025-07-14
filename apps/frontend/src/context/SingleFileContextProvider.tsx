import type React from "react";
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import useFiles from "../hooks/useFiles";
import { useParams } from "react-router";
import { useAudioPlayback } from "../hooks/useAudioPlayer";

type SingleFileContextProps = {
    // File-related properties
    currentFile: any; // Replace 'any' with your actual file type
    getCurrentFile: (id: string, includeStream?: boolean) => void;
    loading: boolean;

    // Audio playback properties
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

    // Helper functions for comments
    formatTime: (time: number) => string;
    getCurrentTimeForComment: () => number;
    seekToTime: (time: number) => void;
};

const SingleFileContext = createContext<SingleFileContextProps | undefined>(
    undefined,
);

export const useSingleFileContext = () => {
    const ctx = useContext(SingleFileContext);
    if (!ctx) {
        throw new Error(
            "useSingleFileContext must be used within a SingleFileContextProvider",
        );
    }
    return ctx; // This was missing!
};

type ProviderProps = {
    children: ReactNode;
};

export const SingleFileContextProvider = ({ children }: ProviderProps) => {
    const {
        files: { currentFile },
        getCurrentFile,
        loading,
    } = useFiles();
    const { fileId } = useParams();

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

    useEffect(() => {
        if (fileId) {
            getCurrentFile(fileId, true);
        }
    }, [fileId]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    const getCurrentTimeForComment = () => {
        return currentTime; // Return the current playback time as a number
    };

    const seekToTime = (time: number) => {
        if (duration > 0) {
            const fraction = time / duration;
            seekTo(fraction);
        }
    };

    const contextValue: SingleFileContextProps = {
        // File-related
        currentFile,
        getCurrentFile,
        loading,


        // Audio playback
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

        // helper functions
        getCurrentTimeForComment,
        formatTime,
        seekToTime
    };

    return (
        <SingleFileContext.Provider value={contextValue}>
            {children}
        </SingleFileContext.Provider>
    );
};

export default SingleFileContextProvider;
