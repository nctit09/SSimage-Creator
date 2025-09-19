import { GoogleGenAI, Modality } from "@google/genai";
// FIX: 'Quality' must be imported as a value to be used in the switch statement, while 'FormData' can remain a type import.
import { Quality } from '../types';
import type { FormData } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

export const generateImages = async (formData: FormData): Promise<string[]> => {
  const { imageFiles, character, scene, removeBackground, aspectRatio, quality } = formData;

  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image must be provided to edit.");
  }
  
  if (!character && !scene) {
    throw new Error("Please provide a character or scene description.");
  }

  const imageParts = await Promise.all(
      imageFiles.map(file => fileToGenerativePart(file))
  );
  
  let promptText = "";
  if (imageFiles.length > 1) {
    promptText = "Crucial instruction: The user has uploaded multiple images, each featuring a distinct character. In the generated scene, you MUST preserve the unique facial identity of each individual character as shown in their respective source images. Pay close attention to the shape of their eyes, nose, mouth, and jawline to ensure they are instantly recognizable. Do not merge their features. Adapt their angles and lighting to match the new scene and poses naturally. Only modify the rest of the image based on the following descriptions. ";
  } else {
    promptText = "Crucial instruction: You MUST preserve the facial identity of the character from the uploaded image. Pay close attention to the shape of the eyes, nose, mouth, and jawline to ensure the person is instantly recognizable. Adapt the angle and lighting of the face to match the new scene and character pose naturally. Only modify the rest of the image based on the following descriptions. ";
  }

  if (removeBackground) {
    promptText += "Remove the background. ";
  }
  if (character) {
    promptText += `Character description: ${character}. `;
  }
  if (scene) {
    promptText += `Scene, environment: ${scene}.`;
  }
  if (aspectRatio) {
    promptText += ` The final image should have an aspect ratio of ${aspectRatio}.`;
  }
  
  let qualityPrompt = "";
  switch (quality) {
      case Quality.TwoK:
          qualityPrompt = " The final image should be very high quality and highly detailed, suitable for 2K resolution.";
          break;
      case Quality.FourK:
          qualityPrompt = " The final image should be extremely high quality with ultra-fine details, suitable for 4K resolution.";
          break;
      case Quality.EightK:
          qualityPrompt = " The final image should be of the highest possible photorealistic quality and detail, as if shot on a high-end camera, suitable for 8K resolution.";
          break;
  }
  promptText += qualityPrompt;


  const textPart = { text: promptText.trim() };

  const generationPromises = Array(4).fill(0).map(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image was generated. The model may have returned only text.");
  });
  
  return Promise.all(generationPromises);
};