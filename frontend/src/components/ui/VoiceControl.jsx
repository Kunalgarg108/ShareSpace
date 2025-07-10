import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function VoiceControl({ setIsLoading, isLoading }) {
  const url = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");

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
    setRecognizedText("Listening...");

    recognition.onresult = async (event) => {
      const voiceCommand = event.results[0][0].transcript.toLowerCase();
      setRecognizedText(`You said: "${voiceCommand}"`);

      try {
        setIsLoading(true);
        const res = await axios.post(`${url}/api/v1/dialogflow`, {
          query: voiceCommand,
        });

        const intent = res.data.intent;

        const intentRoutes = {
          open_home: "/",
          open_profile: `/profile/${user._id}`,
          open_user_posts: `/userposts/${user._id}`,
          open_edit_profile: "/editprofile",
          open_saved_post: `/savedpost/${user._id}`,
          open_followers: `/followers/${user._id}`,
          open_following: `/following/${user._id}`,
          open_create_post: "/createpost",
          open_explore: "/explore",
          open_chat: "/chat",
          open_notifications: "/notifications",
          open_search: "/search",
          open_reel: "/reel",
        };

        if (intentRoutes[intent]) {
          navigate(intentRoutes[intent]);
        } else {
          toast.info("Sorry, Voice not Clear.");
        }
      } catch (error) {
        toast.error("Something went wrong with voice processing.");
      } finally {
        setIsListening(false);
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      toast.error("Voice recognition error. Please try again.");
      setIsListening(false);
      setIsLoading(false);
    };

    recognition.onend = () => {
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
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <div className="mic-loader"></div>
          {recognizedText && (
            <div className="text-sm text-gray-700 font-medium">{recognizedText}</div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center space-y-2 mt-4">
          <div className="loader"></div>
          <div className="text-sm text-gray-500">Processing your voice...</div>
        </div>
      )}
    </div>
  );
}

export default VoiceControl;
