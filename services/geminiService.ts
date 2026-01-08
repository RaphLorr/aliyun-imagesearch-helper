
import { GoogleGenAI, Type } from "@google/genai";
import { BoundingBox, Detection } from "../types";

export const detectObjects = async (imageBase64: string): Promise<Detection[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Gemini expects/returns: ymin, xmin, ymax, xmax
  const prompt = `Identify significant objects in this image and provide their bounding boxes in [ymin, xmin, ymax, xmax] format. Return a JSON array of objects with "label" and "box_2d".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.split(',')[1] || imageBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "[ymin, xmin, ymax, xmax]"
              }
            },
            required: ["label", "box_2d"]
          }
        }
      },
    });

    const text = response.text;
    if (!text) return [];

    const rawData = JSON.parse(text);
    return rawData.map((item: any) => ({
      label: item.label,
      box: {
        // Correctly map to our custom order: x1, x2, y1, y2
        x1: item.box_2d[1], // xmin -> Left
        x2: item.box_2d[3], // xmax -> Right
        y1: item.box_2d[0], // ymin -> Top
        y2: item.box_2d[2], // ymax -> Bottom
      }
    }));
  } catch (e) {
    console.error("Gemini Detection Error:", e);
    throw e;
  }
};
