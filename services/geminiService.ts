
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeNetworkLogs = async (logs: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze the following network log data and provide a concise security assessment and performance optimization recommendations. 
        Focus on anomalies, potential threats, and latency bottlenecks.
        
        LOG DATA:
        ${logs}
      `,
      config: {
        temperature: 0.7,
        topP: 0.9
      }
    });

    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to analyze network data. Please check your connectivity and API key.";
  }
};

export const getSmartSuggestions = async (metrics: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Current Network Metrics: ${JSON.stringify(metrics)}. Provide 3 bullet points for a CTO on how to optimize this network.`,
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
                    propertyOrdering: ["suggestions"]
                }
            }
        });
        
        const text = response.text?.trim();
        if (!text) throw new Error("Empty response");
        
        const data = JSON.parse(text);
        return data.suggestions;
    } catch (error) {
        console.error("Smart Suggestions Error:", error);
        return ["Monitor backbone latency", "Review firewall rules", "Check for packet fragmentation"];
    }
};
