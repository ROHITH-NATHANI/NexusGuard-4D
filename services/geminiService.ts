import { GoogleGenAI, Type } from "@google/genai";

export const analyzeNetworkLogs = async (logs: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following network log data and provide a concise security assessment and performance optimization recommendations. 
        Focus on anomalies, potential threats, and latency bottlenecks. Use a professional but futuristic tone.
        
        LOG DATA:
        ${logs}
      `,
      config: {
        temperature: 0.8,
        topP: 0.95
      }
    });

    return response.text || "ANALYTICS BUFFER EMPTY. NO THREATS DETECTED.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "NEURAL LINK FAILURE: FAILED TO ANALYZE PACKET STREAM. CHECK ENCRYPTION KEYS.";
  }
};

export const getSmartSuggestions = async (metrics: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Current Network Metrics: ${JSON.stringify(metrics)}. Provide 3 strategic suggestions for network hardening and optimization.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });
        
        const text = response.text?.trim();
        if (!text) throw new Error("Null response");
        
        const data = JSON.parse(text);
        return data.suggestions;
    } catch (error) {
        console.error("Smart Suggestions Error:", error);
        return [
          "ENFORCE LAYER 7 PROTOCOL INSPECTION", 
          "AUDIT PERIMETER FIREWALL RECURSIVELY", 
          "OPTIMIZE BACKBONE FIBER LATENCY"
        ];
    }
};