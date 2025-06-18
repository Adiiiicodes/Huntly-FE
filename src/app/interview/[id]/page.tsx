'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Mic, MicOff, Play, Pause } from 'lucide-react';
import { InterviewDB } from '@/services/interview-db';
import { getQuestions } from '@/services/questions';
import { textToSpeech } from '@/services/elevenlabs';

export default function InterviewSessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewSession, setInterviewSession] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const initializeInterview = async () => {
      try {
        if (!user) {
          router.push(`/login?redirect=/interview/${params.id}`);
          return;
        }

        // Get interview session
        const interviewDB = new InterviewDB();
        const session = await interviewDB.getInterviewSession(params.id);
        
        if (!session) {
          toast({
            title: "Interview Not Found",
            description: "This interview session does not exist or has been removed.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }

        // Check if user is the candidate
        if (session.candidateId !== user.uid) {
          toast({
            title: "Access Denied",
            description: "You are not authorized to take this interview.",
            variant: "destructive",
          });
          router.push('/');
          return;
        }

        setInterviewSession(session);

        // Get questions from external source
        const interviewQuestions = await getQuestions();
        setQuestions(interviewQuestions);
        setCurrentQuestion(interviewQuestions[0]);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing interview:', error);
        toast({
          title: "Error",
          description: "Failed to initialize interview. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initializeInterview();
  }, [user, router, params.id, toast]);

  const playQuestion = async () => {
    if (!currentQuestion) return;

    try {
      setIsPlaying(true);
      const audioBuffer = await textToSpeech(currentQuestion);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing question:', error);
      toast({
        title: "Error",
        description: "Failed to play question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll just simulate a transcript
        const simulatedTranscript = "This is a simulated transcript of the candidate's response.";
        setTranscript(prev => prev + '\n\n' + simulatedTranscript);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setTranscript('');
    } else {
      // Interview completed
      try {
        const interviewDB = new InterviewDB();
        await interviewDB.updateInterviewStatus(params.id, 'completed', transcript);
        
        toast({
          title: "Interview Completed",
          description: "Thank you for completing the interview. The recruiter will review your responses.",
        });
        router.push('/');
      } catch (error) {
        console.error('Error completing interview:', error);
        toast({
          title: "Error",
          description: "Failed to complete interview. Please try again.",
          variant: "destructive",
        });
      }
    }
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Question Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Question</h2>
            <p className="text-lg mb-6">{currentQuestion}</p>
            
            <div className="flex space-x-4">
              <Button
                onClick={playQuestion}
                disabled={isPlaying}
                className="flex items-center"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Play Question
                  </>
                )}
              </Button>
              
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Response</h2>
            <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] mb-6">
              {transcript || "Your response will appear here..."}
            </div>
            
            <Button
              onClick={nextQuestion}
              disabled={!transcript}
              className="w-full"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Complete Interview"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
} 