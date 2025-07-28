'use server';
/**
 * @fileOverview A content moderation flow for the community forum.
 *
 * - moderateContent - A function that analyzes text for appropriateness.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ModerateContentInputSchema = z.object({
  text: z.string().describe("The user-generated text to be moderated."),
});

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe("Whether the text is appropriate for the community forum."),
  reason: z.string().optional().describe("A brief reason if the content is inappropriate."),
});


export async function moderateContent(input) {
  return moderateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are a content moderator for a personal safety app's community forum. Your goal is to keep the forum supportive and safe.

You must determine if the following text is appropriate. The text is INAPPROPRIATE if it contains:
- Hate speech, discrimination, or personal attacks.
- Harassment or bullying.
- Threats or incitement of violence.
- Sexually explicit content.
- Spam or commercial advertising.
- Sharing private information without consent.

User-submitted text:
"{{{text}}}"

Analyze the text and *always* return a JSON object with the following structure:
- 'isAppropriate' (boolean): true if the text is acceptable, false otherwise.
- 'reason' (string, optional): If inappropriate, provide a brief, user-friendly reason. Omit this field if the content is appropriate.`,
  
  // Disable default safety settings to allow our custom moderator prompt to handle content analysis.
  // This is crucial for a moderation use case where the AI needs to see potentially "unsafe" content to judge it.
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      // The prompt call can result in a null output if the model's response fails to parse against the output schema.
      // Since we disabled safety filters, this is less likely to be a content block.
      if (!output) {
        return {
          isAppropriate: false,
          reason: "This post could not be analyzed. Please try rephrasing your message.",
        };
      }
      return output;
    } catch (error) {
      // This catch block handles catastrophic failures, like network errors or API key issues.
      // The "connection issue" message is appropriate here.
      console.error("A critical error occurred in the content moderation flow:", error);
      return {
          isAppropriate: false,
          reason: "Could not analyze post due to a temporary connection issue. Please try again."
      };
    }
  }
);
