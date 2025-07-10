import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VoiceControl from "./VoiceControl";
import { Loader2 } from "lucide-react";
function VoiceControlDialog({ open, onOpenChange }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col items-center space-y-6 p-6 bg-black text-white">
                <DialogTitle>🎙️ Voice Assistant</DialogTitle>

                <DialogDescription className="text-gray-400 text-sm text-center">
                    {/* Speak a command like "Go to home" or "Open profile" — your assistant will respond! */}
                </DialogDescription>
                {/* Simple Audio Visualization */}
                {/* <div className="flex space-x-2">
                    {[...Array(5)].map((_, idx) => (
                        <div
                            key={idx}
                            className="w-2 h-8 bg-blue-500 rounded"
                            style={{
                                animation: "pulse 0.7s ease-in-out infinite alternate",
                                animationDelay: `${idx * 0.1}s`,
                            }}
                        ></div>
                    ))}
                </div> */}

                {/* Voice control trigger */}
                <VoiceControl setIsLoading={setIsLoading} isLoading={isLoading} />
            </DialogContent>
        </Dialog>
    );
}

export default VoiceControlDialog;
