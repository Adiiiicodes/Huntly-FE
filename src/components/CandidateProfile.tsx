import { createInterviewSession } from '@/services/interview';
import { useToast } from '@/components/ui/use-toast';

export default function CandidateProfile({ candidate }: CandidateProfileProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSendingInterview, setIsSendingInterview] = useState(false);

  const handleSendInterview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send an interview request.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingInterview(true);
      const interviewId = await createInterviewSession(candidate.id, user.uid);
      const interviewUrl = `${window.location.origin}/interview/${interviewId}`;
      
      // Copy interview link to clipboard
      await navigator.clipboard.writeText(interviewUrl);
      
      toast({
        title: "Interview Link Generated",
        description: "The interview link has been copied to your clipboard. Share it with the candidate.",
      });
    } catch (error) {
      console.error('Error creating interview:', error);
      toast({
        title: "Error",
        description: "Failed to create interview session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingInterview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing profile content ... */}
      
      {user && user.role === 'recruiter' && (
        <div className="mt-6">
          <Button
            onClick={handleSendInterview}
            disabled={isSendingInterview}
            className="w-full sm:w-auto"
          >
            {isSendingInterview ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Interview Link...
              </>
            ) : (
              <>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Interview Request
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* ... rest of the profile content ... */}
    </div>
  );
} 