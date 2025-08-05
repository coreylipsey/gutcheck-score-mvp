import { AssessmentCategory } from '../value-objects/Category';

export type QuestionType = 'multipleChoice' | 'multiSelect' | 'openEnded' | 'likert';

export interface Question {
  id: string;
  text: string;
  subHeading?: string;
  category: AssessmentCategory;
  type: QuestionType;
  options?: string[];
  isOpenEnded?: boolean;
  weight: number;
  section: string;
  minCharacters?: number;
  validationPrompt?: string;
}

export class QuestionEntity {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly category: AssessmentCategory,
    public readonly type: QuestionType,
    public readonly weight: number,
    public readonly section: string,
    public readonly subHeading?: string,
    public readonly options?: string[],
    public readonly minCharacters?: number,
    public readonly validationPrompt?: string
  ) {}

  static fromQuestion(question: Question): QuestionEntity {
    return new QuestionEntity(
      question.id,
      question.text,
      question.category,
      question.type,
      question.weight,
      question.section,
      question.subHeading,
      question.options,
      question.minCharacters,
      question.validationPrompt
    );
  }

  toQuestion(): Question {
    return {
      id: this.id,
      text: this.text,
      category: this.category,
      type: this.type,
      weight: this.weight,
      section: this.section,
      subHeading: this.subHeading,
      options: this.options,
      minCharacters: this.minCharacters,
      validationPrompt: this.validationPrompt
    };
  }

  isOpenEnded(): boolean {
    return this.type === 'openEnded';
  }

  isMultipleChoice(): boolean {
    return this.type === 'multipleChoice';
  }

  isMultiSelect(): boolean {
    return this.type === 'multiSelect';
  }

  isLikert(): boolean {
    return this.type === 'likert';
  }

  requiresValidation(): boolean {
    return this.isOpenEnded() && !!this.minCharacters;
  }
} 