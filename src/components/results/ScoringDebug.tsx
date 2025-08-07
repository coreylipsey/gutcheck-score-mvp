import React from 'react';
import { AssessmentSession } from '../../domain/entities/Assessment';
import { ASSESSMENT_QUESTIONS } from '../../domain/entities/Assessment';
import { ScoringService } from '../../application/services/ScoringService';
import { GeminiAIService } from '../../infrastructure/services/GeminiAIService';

interface ScoringDebugProps {
  sessionData: AssessmentSession;
}

interface QuestionScore {
  questionId: string;
  questionText: string;
  category: string;
  type: string;
  response: string | number | string[];
  rawScore: number;
  options?: string[];
}

export default function ScoringDebug({ sessionData }: ScoringDebugProps) {
  const [questionScores, setQuestionScores] = React.useState<QuestionScore[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function calculateQuestionScores() {
      const aiService = new GeminiAIService(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const scoringService = new ScoringService(aiService);
      
      const scores: QuestionScore[] = [];

      for (const question of ASSESSMENT_QUESTIONS) {
        const response = sessionData.responses.find(r => r.questionId === question.id);
        if (!response) {
          scores.push({
            questionId: question.id,
            questionText: question.text,
            category: question.category,
            type: question.type,
            response: 'No response',
            rawScore: 0,
            options: question.options
          });
          continue;
        }

        let rawScore = 0;

        switch (question.type) {
          case 'multipleChoice':
            rawScore = scoreMultipleChoice(question, response.response as string);
            break;
          case 'multiSelect':
            rawScore = scoreMultiSelect(question, response.response as string[]);
            break;
          case 'likert':
            // Handle Q19 (fear of failure) with inverted scoring
            if (question.id === 'q19') {
              const likertValue = response.response as number;
              rawScore = 6 - likertValue; // Invert: 1=5, 2=4, 3=3, 4=2, 5=1
            } else {
              rawScore = scoreLikert(response.response as number);
            }
            break;
          case 'openEnded':
            try {
              const result = await aiService.scoreOpenEndedResponse(
                question.id,
                response.response as string,
                question.text
              );
              rawScore = result.score;
            } catch (error) {
              rawScore = -1; // Error indicator
            }
            break;
        }

        scores.push({
          questionId: question.id,
          questionText: question.text,
          category: question.category,
          type: question.type,
          response: response.response,
          rawScore,
          options: question.options
        });
      }

      setQuestionScores(scores);
      setLoading(false);
    }

    calculateQuestionScores();
  }, [sessionData]);

  // Scoring helper functions (copied from ScoringService)
  function scoreMultipleChoice(question: any, response: string): number {
    if (!question.options) return 0;
    
    const optionIndex = question.options.indexOf(response);
    if (optionIndex === -1) return 0;
    
    const scoringMaps: Record<string, number[]> = {
      'q1': [3, 4, 5],
      'q2': [3, 4, 5],
      'q4': [5, 4, 3],
      'q5': [5, 4, 3, 2],
      'q6': [5, 4, 3, 2],
      'q7': [5, 4, 3, 2],
      'q11': [2, 3, 4, 5, 0], // Q11 "Other" option: 0 points
      'q12': [5, 4, 3],
      'q13': [5, 4, 3],
      'q14': [5, 3],
      'q15': [5, 4, 3, 2],
      'q16': [2, 3, 4, 5],
      'q17': [5, 4, 3],
      'q20': [5, 4, 3],
      'q21': [3, 4, 5],
      'q22': [3, 4, 5, 2],
      'q24': [4, 5, 3, 2],
      'q25': [5, 3, 2],
    };
    
    const scoringMap = scoringMaps[question.id];
    if (scoringMap && scoringMap[optionIndex] !== undefined) {
      return scoringMap[optionIndex];
    }
    
    const score = optionIndex + 1;
    return Math.max(1, Math.min(5, score));
  }

  function scoreLikert(response: number): number {
    return Math.max(1, Math.min(5, response));
  }

  function scoreMultiSelect(question: any, responses: string[]): number {
    if (!question.options) return 0;
    const completedCount = responses.length;
    const totalOptions = question.options.length;
    const completionPercentage = completedCount / totalOptions;
    const normalizedScore = completionPercentage * 5;
    return Math.round(normalizedScore);
  }

  if (loading) {
    return <div className="p-6">Loading scoring debug...</div>;
  }

  const categories = ['personalBackground', 'entrepreneurialSkills', 'resources', 'behavioralMetrics', 'growthVision'];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Scoring Debug - All 25 Questions</h2>
      
      {categories.map(category => {
        const categoryQuestions = questionScores.filter(q => q.category === category);
        const categoryTotal = categoryQuestions.reduce((sum, q) => sum + q.rawScore, 0);
        
        return (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-600 capitalize">
              {category.replace(/([A-Z])/g, ' $1').trim()} ({categoryTotal} points)
            </h3>
            
            <div className="space-y-4">
              {categoryQuestions.map(question => (
                <div key={question.questionId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">
                      {question.questionId}: {question.questionText}
                    </h4>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      question.rawScore >= 4 ? 'bg-green-100 text-green-800' :
                      question.rawScore >= 3 ? 'bg-yellow-100 text-yellow-800' :
                      question.rawScore >= 1 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Score: {question.rawScore}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Type: {question.type}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-700 mb-1">Response:</div>
                    <div className="text-gray-800">
                      {Array.isArray(question.response) 
                        ? question.response.join(', ')
                        : String(question.response)
                      }
                    </div>
                  </div>
                  
                  {question.options && (
                    <div className="mt-2 text-xs text-gray-500">
                      <div className="font-medium">Options:</div>
                      {question.options.map((option, index) => (
                        <div key={index} className="ml-2">
                          {index + 1}. {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Total Raw Score:</strong> {questionScores.reduce((sum, q) => sum + q.rawScore, 0)}
          </div>
          <div>
            <strong>Questions Answered:</strong> {questionScores.filter(q => q.rawScore > 0).length}/25
          </div>
          <div>
            <strong>Average Score:</strong> {(questionScores.reduce((sum, q) => sum + q.rawScore, 0) / questionScores.filter(q => q.rawScore > 0).length).toFixed(2)}
          </div>
          <div>
            <strong>Open-ended Errors:</strong> {questionScores.filter(q => q.rawScore === -1).length}
          </div>
        </div>
      </div>
    </div>
  );
} 