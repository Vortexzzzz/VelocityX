
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

// Helper to handle Gemini API errors
const handleGeminiError = (error: any, context: string) => {
    const msg = error.toString();
    // Check for various forms of rate limit/quota errors
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded")) {
        console.warn(`Gemini API Quota Exceeded in ${context}. Switching to fallback/offline mode.`);
        throw new Error("QUOTA_EXCEEDED");
    }
    console.error(`Gemini ${context} failed:`, error);
    throw error;
};

export const analyzeTrickVideo = async (videoFile: File, sport: string, targetTrick: string) => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash";

  try {
    const videoPart = await fileToGenerativePart(videoFile);
  
    const prompt = `
    Role: Expert Action Sports Coach & Judge for ${sport}.
    Task: Verify and critique a specific trick attempt.
    
    The user claims they are performing a: "${targetTrick}" on a "${sport}".

    Protocol:
    1. **Sport Verification (CRITICAL)**: Look at the equipment. Is the rider using a ${sport}?
       - If the user is on a Bike but the sport is Scooter: Mark 'landed' as false.
       - If the user is on a Skateboard but the sport is Bike: Mark 'landed' as false.
       - FEEDBACK MUST SAY: "Incorrect sport detected. You are riding a [Detected Sport] but this profile is for ${sport}."
    2. **Grounding**: Briefly search Google for "how to do ${targetTrick} on ${sport}" to recall strict form and landing criteria.
    3. **Identification**: Watch the video. Does the rider actually attempt a "${targetTrick}"?
       - If they do a completely different trick, mark 'landed' as false and explain why in feedback.
    4. **Success Check**: Did they LAND it?
       - "Landed" means rolling away on wheels.
       - If they fall, touch the ground with hands/feet, or slip out immediately, it is NOT landed.
       - If it is "sketchy" but they roll away, count it as landed.
    5. **Rating**: Rate the execution out of 10.
       - 1-3: Failed attempt / Crash / Wrong Sport.
       - 4-5: Landed but very sketchy (hand drag, toe touch, stopped momentum).
       - 6-7: Clean land, decent style.
       - 8-9: Great height, style, and perfect bolts landing.
       - 10: Professional level perfection.

    Output JSON (Strictly NO markdown code blocks, just JSON):
    {
      "landed": boolean,
      "rating": number (1-10),
      "trickDetected": "string (The actual trick name you saw)",
      "feedback": "string (Constructive coaching advice. e.g., 'You under-rotated slightly. Try tucking your knees more.')",
      "confidence": number (0-100)
    }
    `;

    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [videoPart, { text: prompt }]
      },
      config: {
        tools: [{ googleSearch: {} }],
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
        // Fallback
        data = { 
            landed: false,
            rating: 0,
            trickDetected: "Unknown",
            feedback: "Could not analyze video. Please try again.",
            confidence: 0
        };
    }

    return data;

  } catch (error) {
    handleGeminiError(error, "analyzeTrickVideo");
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
        handleGeminiError(error, "findNearbyParks");
        // Return empty structure if error handling continues (though handleGeminiError throws)
        return { text: "" };
    }
}

export const searchTrickTutorials = async (query: string, sport: string) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const prompt = `
        Find the best high-quality tutorials on how to perform the trick "${query}" on a "${sport}".
        
        Instructions:
        1. Use Google Search to find "How-To" guides and "Video Tutorials".
        2. Prioritize results from YouTube, reliable action sports websites, and expert guides.
        3. Provide a concise step-by-step text summary of how to do the trick based on the search results.
        4. The grounding chunks (sources) will be used to display the links.
        
        Output Format:
        Just provide the clear step-by-step summary in text format (Markdown). The links will be handled automatically by the system.
    `;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        // Extract sources from grounding metadata
        const sources = result.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => ({
                title: chunk.web?.title || "Tutorial Link",
                uri: chunk.web?.uri
            }))
            .filter((source: any) => source.uri) || [];

        return {
            summary: result.text,
            sources: sources
        };

    } catch (error) {
        handleGeminiError(error, "searchTrickTutorials");
    }
}

export const generateLocalChallenges = async (lat: number, lng: number, sport: string) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const prompt = `
    Identify the closest skatepark or action sports spot to the provided location.
    
    Task:
    1. If the user coordinates place them directly AT or very close to a specific skatepark, generate all 5 challenges SPECIFICALLY for that park's unique features.
    2. If not at a park, find nearby spots.
    
    For the selected spot(s):
    - Identify its layout (Street, Park, Transition, Pump Track).
    - Select a RANDOM specific obstacle or feature at that park (e.g., The 5-stair, The Kidney Bowl, The A-Frame Rail, The Euro Gap, Rhythm Section).
    - Create a unique "Riding Challenge" on that specific obstacle suitable for: ${sport}.

    CRITICAL INSTRUCTIONS:
    1. RANDOMIZE OBSTACLES: Ensure high variety. Do not repeat the same type of challenge (e.g. don't make all of them "Grind the rail"). Include gaps, manuals, grinds, airs, and technical lines.
    2. SPECIFICITY: Reference the specific obstacle in the description (e.g., "Kickflip the 6-stair set", "Air out of the deep end of the clover bowl", "Grind the down-rail").
    3. PUMP TRACKS: If a spot is a "Pump Track", DO NOT use "Laps" or "Time Trials". Instead, generate technical challenges like "Manual the entire rhythm straight", "Gap the double rollers", "Transfer from berm to berm", or "Pre-jump the spine".
    4. NO DECIMALS: All point values must be rounded up to the nearest WHOLE INTEGER.

    Output format requirements:
    Produce a list where each item is separated by a new line.
    Use the pipe character "|" as a delimiter between fields.
    Format: Location Name|Challenge Title|Description|Difficulty|Points
    
    Fields:
    - Location Name: The real name of the place found.
    - Challenge Title: Catchy name for the trick/task.
    - Description: Specific instruction for the selected sport (${sport}) on a specific obstacle.
    - Difficulty: Easy, Medium, Hard, or Insane.
    - Points: WHOLE INTEGER between 300 and 2000.

    Example Output:
    Kinetic Park|Bowl Blazer|Air at least 3ft out of the deep end of the main bowl.|Hard|1000
    Downtown Plaza|The Big 3|Land a clean 360 down the famous 3-block set.|Insane|2000
    Local Pump Track|Roller Manual|Manual through the entire rhythm section without pedaling.|Medium|800
    Community Park|Rail Technician|Feeble grind the entire length of the A-frame rail.|Medium|600
    `;

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

        // Simple parsing logic based on the requested pipe format
        const text = result.text || "";
        const lines = text.split('\n').filter(line => line.includes('|'));
        
        const challenges = lines.map((line, index) => {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 5) {
                return {
                    id: `loc-${Date.now()}-${index}`,
                    locationName: parts[0],
                    title: parts[1],
                    description: parts[2],
                    difficulty: parts[3] as any,
                    points: Math.ceil(parseInt(parts[4])) || 500, // Ensure rounding up
                    sport: sport // Add the sport we queried for
                };
            }
            return null;
        }).filter(c => c !== null);

        return challenges;

    } catch (error) {
        handleGeminiError(error, "generateLocalChallenges");
    }
}

export const verifyChallengeVideo = async (videoFile: File, challengeTitle: string, challengeDesc: string) => {
    if (!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    try {
        const videoPart = await fileToGenerativePart(videoFile);

        const prompt = `
            Role: Action Sports Judge.
            Task: Verify if the rider in the video successfully completes the specific challenge described.
            
            Protocol:
            1. **Full Watch**: Watch the entire video content from start to finish.
            2. **Search**: Search for the trick/challenge described ("${challengeTitle}") to understand the specific success criteria via Google Search.
            3. **Analyze**: Compare the rider's actions to the criteria.
            4. **Best Outcome**: If the attempt is close or slightly sketchy but technically meets the definition, mark as COMPLETED.

            Challenge Title: "${challengeTitle}"
            Challenge Description: "${challengeDesc}"

            Output JSON:
            {
                "completed": boolean,
                "reasoning": "string (Explain why it passed or failed based on visual evidence)"
            }
        `;

        const result = await ai.models.generateContent({
            model,
            contents: {
                parts: [videoPart, { text: prompt }]
            },
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        
        let text = result.text || "{}";
        const jsonBlock = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/(\{[\s\S]*\})/);
        if (jsonBlock) text = jsonBlock[1] || jsonBlock[0];

        return JSON.parse(text);

    } catch (error) {
        handleGeminiError(error, "verifyChallengeVideo");
    }
}
