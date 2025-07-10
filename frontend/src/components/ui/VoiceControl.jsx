import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VoiceControl({ setIsLoading, isLoading }) {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);

    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert("Sorry, your browser does not support Speech Recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;
        recognition.start();
        setIsListening(true);

        recognition.onresult = async (event) => {
            const voiceCommand = event.results[0][0].transcript.toLowerCase();
            console.log("You said:", voiceCommand);

            try {
                setIsLoading(true);
                const res = await axios.post("http://localhost:5000/dialogflow", {
                    query: voiceCommand,
                });

                const intent = res.data.intent;
                console.log("Detected Intent:", intent);

                if (intent === "open_home") navigate("/home");
                else if (intent === "open_profile") navigate("/profile");
                else if (intent === "open_explore") navigate("/explore");
                else if (intent === "open_messages") navigate("/messages");
                else if (intent === "open_notifications") navigate("/notifications");
                else if (intent === "open_settings") navigate("/settings");
                else if (intent === "open_reels") navigate("/reels");
                else if (intent === "create_post") navigate("/create");
                else if (intent === "open_saved_posts") navigate("/saved-posts");
                else if (intent === "logout_account") navigate("/logout");
                else alert("Sorry, command not recognized.");
            } catch (error) {
                console.error("Dialogflow error:", error);
            } finally {
                setIsListening(false);
                setIsLoading(false);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            setIsLoading(false);
        };

        recognition.onend = () => {
            console.log("Voice recognition stopped.");
            setIsListening(false);
        };
    };

    return (
        <div className="text-center mt-4 flex flex-col items-center space-y-3">
            {!isListening && !isLoading ? (
                <button
                    onClick={startListening}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    🎙️ Start
                </button>
            ) : isListening && !isLoading ? (
                <div className="mic-loader"></div>
            ) : isLoading ? (
                <div className="flex flex-col items-center space-y-2 mt-4">
                    <div className="loader"></div>
                </div>
            ) : null}
        </div>
    );
}

export default VoiceControl;
