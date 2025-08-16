import React from 'react';
import { AssessmentSession } from '../../domain/entities/Assessment';
import { Container } from '../../infrastructure/di/container';
import { CalculateQuestionScores, QuestionScore } from '../../application/use-cases/CalculateQuestionScores';

interface ScoringDebugProps {
  sessionData: AssessmentSession;
}

export default function ScoringDebug({ sessionData }: ScoringDebugProps) {
  const [questionScores, setQuestionScores] = React.useState<QuestionScore[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function calculateQuestionScores() {
      try {
        // Use Clean Architecture - get use case from DI container
        const calculateQuestionScoresUseCase = Container.getInstance().resolve<CalculateQuestionScores>('CalculateQuestionScores');
        const scores = await calculateQuestionScoresUseCase.execute(sessionData);
        setQuestionScores(scores);
      } catch (error) {
        console.error('Error calculating question scores:', error);
        setQuestionScores([]);
      } finally {
        setLoading(false);
      }
    }

    calculateQuestionScores();
  }, [sessionData]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Scoring Debug</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Scoring Debug</h3>
      <div className="space-y-4">
        {questionScores.map((score) => (
          <div key={score.questionId} className="border rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{score.questionText}</h4>
                <p className="text-xs text-gray-500">Category: {score.category}</p>
                <p className="text-xs text-gray-500">Type: {score.type}</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  score.rawScore >= 4 ? 'bg-green-100 text-green-800' :
                  score.rawScore >= 3 ? 'bg-yellow-100 text-yellow-800' :
                  score.rawScore >= 1 ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Score: {score.rawScore}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              <strong>Response:</strong> {JSON.stringify(score.response)}
            </div>
            {score.options && (
              <div className="text-xs text-gray-500 mt-1">
                <strong>Options:</strong> {score.options.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 