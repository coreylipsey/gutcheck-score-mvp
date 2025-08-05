import { AssessmentCategory } from './Category';

export class Score {
  constructor(
    public readonly value: number,
    public readonly category: AssessmentCategory,
    public readonly maxValue: number = 5
  ) {
    if (value < 0 || value > maxValue) {
      throw new Error(`Score must be between 0 and ${maxValue}`);
    }
  }

  static create(value: number, category: AssessmentCategory, maxValue: number = 5): Score {
    return new Score(value, category, maxValue);
  }

  normalize(weight: number): number {
    return (this.value / this.maxValue) * (weight / 5);
  }

  add(other: Score): Score {
    if (this.category !== other.category) {
      throw new Error('Cannot add scores from different categories');
    }
    return new Score(this.value + other.value, this.category, this.maxValue);
  }

  multiply(factor: number): Score {
    return new Score(this.value * factor, this.category, this.maxValue);
  }

  equals(other: Score): boolean {
    return this.value === other.value && this.category === other.category;
  }

  toString(): string {
    return `${this.category}: ${this.value}/${this.maxValue}`;
  }
}

export class CategoryScore {
  constructor(
    public readonly category: AssessmentCategory,
    public readonly score: number,
    public readonly weight: number
  ) {}

  getNormalizedScore(): number {
    return (this.score / 5) * (this.weight / 5);
  }

  getPercentage(): number {
    return (this.score / 5) * 100;
  }
}

export class OverallScore {
  constructor(
    public readonly value: number,
    public readonly categoryScores: Record<AssessmentCategory, number>
  ) {
    if (value < 0 || value > 100) {
      throw new Error('Overall score must be between 0 and 100');
    }
  }

  static calculate(categoryScores: Record<AssessmentCategory, number>): OverallScore {
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    return new OverallScore(totalScore, categoryScores);
  }

  getStarRating(): number {
    if (this.value >= 80) return 5;
    if (this.value >= 60) return 4;
    if (this.value >= 40) return 3;
    if (this.value >= 20) return 2;
    return 1;
  }

  getGrade(): string {
    if (this.value >= 90) return 'A+';
    if (this.value >= 80) return 'A';
    if (this.value >= 70) return 'B';
    if (this.value >= 60) return 'C';
    if (this.value >= 50) return 'D';
    return 'F';
  }

  getPerformanceLevel(): string {
    if (this.value >= 80) return 'Excellent';
    if (this.value >= 60) return 'Good';
    if (this.value >= 40) return 'Fair';
    if (this.value >= 20) return 'Poor';
    return 'Very Poor';
  }
} 