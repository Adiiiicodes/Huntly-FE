export const getQuestions = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/questions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    // Return default questions if the API fails
    return [
      "Tell me about yourself and your experience.",
      "What are your greatest strengths?",
      "What is your biggest weakness?",
      "Why do you want to work for this company?",
      "Where do you see yourself in five years?",
      "What is your greatest professional achievement?",
      "Tell me about a challenge you faced and how you overcame it.",
      "What are your salary expectations?",
      "Do you have any questions for me?",
    ];
  }
}; 