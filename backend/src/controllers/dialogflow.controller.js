import { SessionsClient } from "@google-cloud/dialogflow";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialogflowClient = new SessionsClient({
    // keyFilename: path.join(__dirname, "../../Chatbot.json"),
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS)
});

const projectId = "social-media-chatbot-g9af";

export const handleDialogflowRequest = async (req, res) => {
    try {
        const sessionId = uuidv4();
        const sessionPath = dialogflowClient.projectAgentSessionPath(projectId, sessionId);

        const requestDialogflow = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: req.body.query,
                    languageCode: "en-US",
                },
            },
        };

        const responses = await dialogflowClient.detectIntent(requestDialogflow);
        const result = responses[0].queryResult;

        res.json({ success: true, intent: result.intent.displayName });
    } catch (error) {
        console.error("Dialogflow error:", error);
        res.status(500).json({ success: false, error: "Dialogflow API error" });
    }
};
