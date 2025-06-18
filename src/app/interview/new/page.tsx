'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, MicOff, Play, Pause } from 'lucide-react';
import { SpeechRecognitionService } from '@/services/speech-to-text';
import { textToSpeech, getVoices, Voice } from '@/services/elevenlabs';

export default function NewInterviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const speechService = useRef<SpeechRecognitionService | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const initializeInterview = async () => {
      try {
        // Initialize speech recognition
        speechService.current = new SpeechRecognitionService();
        
        // Fetch available voices
        const availableVoices = await getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].voice_id);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing interview:', error);
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [user, router]);

  const startInterview = async () => {
    if (!selectedVoice) return;

    try {
      // Generate first question
      const question = "Tell me about yourself and your experience.";
      setCurrentQuestion(question);
      
      // Convert question to speech
      const audioBuffer = await textToSpeech(question, selectedVoice);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const toggleRecording = () => {
    if (!speechService.current) return;

    if (isRecording) {
      speechService.current.stopListening();
    } else {
      speechService.current.startListening(
        (text) => {
          setTranscript(prev => prev + ' ' + text);
        },
        (error) => {
          console.error('Speech recognition error:', error);
        }
      );
    }
    setIsRecording(!isRecording);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Interview Session</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Interview Controls</h2>
          
          <div className="space-y-4">
            <Button 
              onClick={startInterview}
              className="w-full"
              disabled={!selectedVoice}
            >
              Start Interview
            </Button>

            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "outline"}
              className="w-full"
            >
              {isRecording ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Interview Transcript</h2>
          
          <div className="space-y-4">
            {currentQuestion && (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="font-semibold">Question:</p>
                <p>{currentQuestion}</p>
              </div>
            )}
            
            {transcript && (
              <div className="bg-white p-4 rounded-lg border">
                <p className="font-semibold">Your Response:</p>
                <p>{transcript}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
} 