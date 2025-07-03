import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pause, Play } from "lucide-react";
import { useSingleFileContext } from "../context/SingleFileContextProvider";

const AudioPlayer = () => {
    const {
        currentFile,
        waveFormRef,
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        isReady,
        formatTime
    } = useSingleFileContext();


    if (!currentFile) {
        return <div>No file selected</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isPlaying ? "Playing" : "Play"} '{currentFile.name}'</CardTitle>
                <CardDescription>
                    <div className="flex items-center gap-x-2">
                        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* This div will be used by WaveSurfer */}
                <div ref={waveFormRef} className="w-full p-4 items-center rounded" />

                <div className="flex justify-center items-center gap-x-4 mt-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlay}
                        disabled={!isReady}
                    >
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AudioPlayer;