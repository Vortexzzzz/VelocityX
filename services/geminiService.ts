import { GoogleGenAI } from "@google/genai";

// Helper to encode file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeTrickVideo = async (videoFile: File, sport: string, allowedTricks: string[]) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  const videoPart = await fileToGenerativePart(videoFile);
  
  // Explicitly list tricks to guide the model strongly
  const tricksListString = allowedTricks.length > 0 
    ? `TARGET TRICKS FOR THIS RANK: ${allowedTricks.map(t => `"${t}"`).join(', ')}.` 
    : '';

  const prompt = `
  Role: Expert Action Sports Judge specializing in ${sport}.
  Task: Analyze the uploaded video and identify the trick performed.

  Context:
  The rider is attempting to perform a trick from the user's current rank list.
  ${tricksListString}

  Instructions:
  1. Use the Google Search tool to search for visual definitions, tutorials, or competition footage of the tricks in the TARGET TRICKS list. This is CRITICAL to ensure you can distinguish between similar tricks (e.g. 360 vs 540, or variations) and verify the technical execution.
  2. Watch the video and analyze the rider's movement carefully.
  3. Compare the observed movement against the technical definitions found via search.
  4. Identify the trick.

  Output Requirements:
  Return ONLY a valid JSON object. Do not include any conversational text outside the JSON.
  JSON Structure:
  {
    "trickName": "string (exact match from list or best guess)",
    "confidence": number,
    "executionQuality": "string",
    "reasoning": "string (Briefly explain the visual features you saw and how they matched the search results)",
    "feedback": "string"
  }
  `;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [videoPart, { text: prompt }]
      },
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are NOT allowed with googleSearch
      }
    });

    // Extract JSON from text (it might be wrapped in ```json ``` or plain)
    let text = result.text || "{}";
    const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/(\{[\s\S]*\})/);
    if (jsonBlock) {
        text = jsonBlock[1] || jsonBlock[0];
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.warn("Failed to parse JSON from AI response, raw text:", result.text);
        // Fallback or simple error object
        data = { 
            trickName: "Unknown", 
            confidence: 0, 
            executionQuality: "Error", 
            reasoning: "Could not parse AI response.", 
            feedback: "Please try again." 
        };
    }

    // Extract sources from grounding metadata
    const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => chunk.web?.uri)
        .filter((uri: string) => uri) || [];

    return { ...data, sources };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};

export const findNearbyParks = async (lat: number, lng: number) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const prompt = "List 5 real skateparks or extreme sports parks near this location. Provide the name, approximate distance, and a short description of features (ramps, bowls, street section).";

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: lat,
                            longitude: lng
                        }
                    }
                }
            }
        });

        return result;
    } catch (error) {
        console.error("Gemini map search failed:", error);
        throw error;
    }
}