import { useEffect, useRef } from "react";
import { useParams } from "react-router";
import useFiles from "../hooks/useFiles";
import { useAudioPlayback } from "../hooks/useAudioPlayer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pause, Play } from "lucide-react";


const AudioPlayer = () => {
    const { fileId } = useParams();
    const { getCurrentFile, files: { currentFile }, downloadFile } = useFiles();

    const waveFormRef = useRef<HTMLDivElement>(null);
    const {
        isPlaying,
        togglePlay,
        currentTime,
        duration,
        isReady
    } = useAudioPlayback(waveFormRef, currentFile?.streamUrl as string);

    useEffect(() => {
        if (fileId) {
            getCurrentFile(fileId, true);
        }
    }, [fileId]);

    const handleDownloadFile = async () => {
        const downloadUrl = await downloadFile(fileId as string);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "sonex_download.mp3";
        document.body.appendChild(link);
        link.click();

        // Clean up after 2 seconds
        setTimeout(() => {
            document.body.removeChild(link);
        }, 2000);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isPlaying ? "Playing" : "Play"} '{currentFile?.name}'</CardTitle>
                <CardDescription>
                    <div className="flex items-center gap-x-2">
                        <span> {formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div ref={waveFormRef} className="w-full p-4 items-center bg-gray-100 rounded" />

                <div className="flex justify-center items-center gap-x-4 mt-4">
                    <Button variant="ghost" size="icon" onClick={togglePlay} disabled={!isReady}>
                        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </Button>
                </div>


                <Button type="button" onClick={handleDownloadFile}>Download File</Button>
            </CardContent>



        </Card>

    );
};

export default AudioPlayer;