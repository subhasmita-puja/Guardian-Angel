
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) flow.
 *
 * - generateSpeech - A function that converts text into spoken audio.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import wav from 'wav';

// The input schema is a simple string.
const TextToSpeechInputSchema = z.string();

// The output schema contains the base64-encoded WAV audio data URI.
const TextToSpeechOutputSchema = z.object({
  media: z.string().nullable().describe("The generated audio as a data URI in WAV format, or null if generation fails."),
});

/**
 * Converts PCM audio data buffer to a Base64-encoded WAV string.
 * @param {Buffer} pcmData - The raw PCM audio data.
 * @param {number} channels - Number of audio channels.
 * @param {number} rate - The sample rate of the audio.
 * @param {number} sampleWidth - The width of each sample in bytes.
 * @returns {Promise<string>} A promise that resolves with the Base64 WAV string.
 */
async function toWav(pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateSpeechFlow = ai.defineFlow(
  {
    name: 'generateSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (text) => {
    // Prevent calling the API with an empty string, which would fail.
    if (!text?.trim()) {
      return { media: null };
    }
    
    try {
        const { media } = await ai.generate({
          // Use the specified TTS model
          model: 'googleai/gemini-2.5-flash-preview-tts',
          config: {
            // Response modality must be AUDIO
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                // Use a standard, clear voice. "Algenib" is a good neutral choice.
                prebuiltVoiceConfig: { voiceName: 'Algenib' },
              },
            },
          },
          prompt: text,
        });

        if (!media?.url) {
          console.warn("TTS Flow: AI model did not return any media URL.");
          return { media: null };
        }

        // The returned data URI is PCM audio, which needs to be converted to WAV for broad browser support.
        const audioBuffer = Buffer.from(
          media.url.substring(media.url.indexOf(',') + 1),
          'base64'
        );
        
        const wavData = await toWav(audioBuffer);

        return {
          media: `data:audio/wav;base64,${wavData}`,
        };
    } catch (error) {
        console.error("Critical error in generateSpeechFlow:", error);
        // Return null instead of throwing an error to allow the calling component to handle it gracefully.
        return { media: null };
    }
  }
);

/**
 * Public-facing function to generate speech from text.
 * @param {string} text - The text to convert to speech.
 * @returns {Promise<{media: string | null}>} A promise that resolves with the audio data URI or null on failure.
 */
export async function generateSpeech(text) {
  return generateSpeechFlow(text);
}
