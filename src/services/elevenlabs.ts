import axios from 'axios';

const ELEVEN_LABS_API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';
const ELEVEN_LABS_VOICE_ID = process.env.NEXT_PUBLIC_ELEVEN_LABS_VOICE_ID;

if (!ELEVEN_LABS_API_KEY) {
  console.error('Eleven Labs API key is not configured. Please add NEXT_PUBLIC_ELEVEN_LABS_API_KEY to your .env.local file');
}

export interface Voice {
  voice_id: string;
  name: string;
}

export class ElevenLabsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ElevenLabsError';
  }
}

export const getVoices = async (): Promise<Voice[]> => {
  try {
    if (!ELEVEN_LABS_API_KEY) {
      throw new ElevenLabsError('API key not configured');
    }

    const response = await axios.get(`${ELEVEN_LABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    });
    return response.data.voices;
  } catch (error: any) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new ElevenLabsError('Invalid API key', 'AUTH_ERROR');
        case 429:
          throw new ElevenLabsError('API rate limit exceeded', 'RATE_LIMIT');
        default:
          throw new ElevenLabsError(`API error: ${error.response.data.detail || 'Unknown error'}`, 'API_ERROR');
      }
    }
    throw new ElevenLabsError('Failed to fetch voices', 'NETWORK_ERROR');
  }
};

export const textToSpeech = async (text: string): Promise<ArrayBuffer> => {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY || '',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to convert text to speech');
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    throw error;
  }
}; 