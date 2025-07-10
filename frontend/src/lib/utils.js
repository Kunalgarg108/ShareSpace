import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const checkAbusiveContent = async (text) => {
  const PERSPECTIVE_API_KEY = import.meta.env.VITE_PERSPECTIVE_API_KEY;
  const PERSPECTIVE_URL = import.meta.env.VITE_PERSPECTIVE_URL;
  try {
    const res = await axios.post(
      `${PERSPECTIVE_URL}?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        languages: ["en"],
        requestedAttributes: {
          TOXICITY: {},
          SEVERE_TOXICITY: {},
          INSULT: {},
          PROFANITY: {},
          THREAT: {},
          IDENTITY_ATTACK: {},
          SEXUALLY_EXPLICIT: {},
        },
      }
    );
    const scores = res.data.attributeScores;
    const toxicityScore = scores.TOXICITY.summaryScore.value;
    const insultScore = scores.INSULT.summaryScore.value;
    const profanityScore = scores.PROFANITY.summaryScore.value;


    if (toxicityScore > 0.75 || insultScore > 0.75 || profanityScore > 0.75) {
      return true;
    }
    else return false;
  } catch (error) {
    console.error("Error checking abusive content:", error);
    return {
      error: "Failed to check content. Please try again later.",
      message: error.response?.data?.message || "An error occurred while checking content."
    } // Default to false if there's an error
  }
}
