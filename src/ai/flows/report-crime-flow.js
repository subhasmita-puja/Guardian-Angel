'use server';
/**
 * @fileOverview A crime reporting assistant flow.
 *
 * - reportCrime - A function that assists in reporting a crime.
 * - ReportCrimeInput - The input type for the reportCrime function.
 * - ReportCrimeOutput - The return type for the reportCrime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { ZodError } from 'zod';

const ReportCrimeInputSchema = z.object({
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe("The entire history of the conversation so far, including the user's latest message."),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional().describe("The user's current location."),
  // Allow optional, nullable strings to be robust against various client-side states (null, undefined, or string).
  photoDataUri: z.string().optional().nullable().describe("A photo of the incident, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  videoDataUri: z.string().optional().nullable().describe("A video of the incident, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.")
});


const ReportCrimeOutputSchema = z.object({
  response: z.string().describe("The chatbot's response to the user."),
});

export async function reportCrime(input) {
  return reportCrimeFlow(input);
}

const findNearestPoliceStation = ai.defineTool(
  {
    name: 'findNearestPoliceStation',
    description: "Finds the nearest police station to the user's current location. Only use this if the user has provided their location.",
    inputSchema: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    outputSchema: z.object({
      name: z.string().describe("The name of the police station."),
      address: z.string().describe("The address of the police station."),
      distance: z.string().describe("The approximate distance to the police station."),
    }),
  },
  async ({ latitude, longitude }) => {
    // In a real app, this would use an API like Google Places.
    // For this demo, we return mock data.
    console.log(`Searching for police station near ${latitude}, ${longitude}`);
    return {
      name: "City Central Police Station",
      address: "123 Safety Avenue, Guardian City",
      distance: "approx. 1.2 km away",
    };
  }
);


const prompt = ai.definePrompt({
  name: 'reportCrimePrompt',
  tools: [findNearestPoliceStation],
  input: {schema: ReportCrimeInputSchema},
  output: {schema: ReportCrimeOutputSchema},
  prompt: `System: You are a helpful and empathetic AI assistant for a personal safety app called 'Guardian Angel'. Your purpose is to help a user who may be in a distressing situation to document a crime. Your tone must be calm, reassuring, and professional. Guide the user through creating a report.

**Your Instructions:**
1.  **Acknowledge and Start:** Begin by acknowledging the user's situation. If it's the first message, ask a general question like "Please tell me what happened."
2.  **Gather Details Systematically:** Ask for one key piece of information at a time (e.g., what happened, where, when, description of people involved).
3.  **Acknowledge Evidence:** If the user has provided location or media, acknowledge it clearly. For example: "Thank you for providing your location. This will be very helpful." or "I've received the photo and attached it to the report."
4.  **Stay Concise:** Keep your responses clear and to the point.
5.  **Safety First:** If the user expresses that they are in immediate danger and they have provided their location, your first priority is to provide immediate, actionable help. Use the 'findNearestPoliceStation' tool with the user's location to give them the details of the nearest police station. Also, provide the national women's helpline number in India: 1091. Then, strongly advise them to contact local authorities. Example: "I understand. Your safety is the top priority. The nearest police station is [Police Station Name] at [Address], which is [Distance]. The Women's Helpline number is 1091. Please contact emergency services immediately if you feel you are in danger." If they express danger but have not provided a location, ask them to enable location services or describe where they are.
6.  **Tool Usage Transparency:** When you use the \`findNearestPoliceStation\` tool, integrate its output directly into your response. *Do not* state that you are "looking up" information, "locating a station", or that a tool is unavailable. Your response should be direct and helpful, like in the example provided above.
7.  **Set Boundaries:** Do not provide legal advice. Remind the user you are an AI assistant and not a replacement for emergency services if needed.
8.  **Summarize:** Once sufficient details are gathered, offer to summarize the report.

**Attached Evidence (Analyze if present):**
{{#if location}}
- Location: Latitude {{location.latitude}}, Longitude {{location.longitude}}
{{/if}}
{{#if photoDataUri}}
- Photo: {{media url=photoDataUri}}
{{/if}}
{{#if videoDataUri}}
- Video: {{media url=videoDataUri}}
{{/if}}

**Conversation History:**
{{#each chatHistory}}
- {{role}}: {{{content}}}
{{/each}}

Based on the full conversation, generate the assistant's next response. Your entire output must be a single JSON object with a key named "response" that contains your textual reply. Example:
{
  "response": "I see. Thank you for providing that photo. Can you please describe what happened?"
}`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const reportCrimeFlow = ai.defineFlow(
  {
    name: 'reportCrimeFlow',
    inputSchema: ReportCrimeInputSchema,
    outputSchema: ReportCrimeOutputSchema,
  },
  async (input) => {
    try {
        // Defensive coding: Create a clean input object for the prompt.
        // This removes fields that are null, undefined, or empty strings before calling the AI.
        const cleanInput = { ...input };
        if (!cleanInput.location) {
          delete cleanInput.location;
        }
        if (!cleanInput.photoDataUri) {
          delete cleanInput.photoDataUri;
        }
        if (!cleanInput.videoDataUri) {
          delete cleanInput.videoDataUri;
        }
        
        const { output } = await prompt(cleanInput);

        if (!output) {
          console.warn("reportCrimeFlow received a null output from the prompt. This could be due to a parsing issue or the model returning an empty response.");
          return { response: "I'm sorry, I had trouble generating a response. Could you please try rephrasing or sending your message again?" };
        }
        return output;
    } catch (error) {
        // Log the detailed error for debugging purposes on the server.
        console.error("Critical error in reportCrimeFlow:", error);

        // Check if it's a Zod validation error to provide a more specific (though generic) message.
        if (error instanceof ZodError) {
             console.error("Zod validation errors:", error.errors);
             return { response: "There was an issue with the data format. Please try again." };
        }
        
        // This is the generic fallback for network errors, API key issues, or other unexpected problems.
        return { response: "I'm having trouble connecting to the AI service right now. Please check your connection and try again in a moment." };
    }
  }
);
