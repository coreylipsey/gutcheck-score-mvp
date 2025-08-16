export class ScoringInfrastructureService {
  private readonly aiScoringUrl = 'https://scorequestion-ix3v2eesbq-uc.a.run.app';

  async scoreOpenEndedWithAI(questionId: string, response: string, questionText: string): Promise<number> {
    try {
      const questionTypeMap: Record<string, string> = {
        'q3': 'entrepreneurialJourney',
        'q8': 'businessChallenge', 
        'q18': 'setbacksResilience',
        'q23': 'finalVision'
      };

      const questionType = questionTypeMap[questionId] || 'general';

      const scoringResponse = await fetch(this.aiScoringUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionType,
          response,
          questionText,
        }),
      });

      if (scoringResponse.ok) {
        const data = await scoringResponse.json();
        return data.score;
      } else {
        console.error('AI scoring failed, using fallback');
        return 3; // Fallback score
      }
    } catch (error) {
      console.error('Error in AI scoring:', error);
      return 3; // Fallback score
    }
  }
}
