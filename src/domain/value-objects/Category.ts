export type AssessmentCategory = 
  | 'personalBackground' 
  | 'entrepreneurialSkills' 
  | 'resources' 
  | 'behavioralMetrics' 
  | 'growthVision';

export class Category {
  private constructor(public readonly value: AssessmentCategory) {}

  static create(value: AssessmentCategory): Category {
    return new Category(value);
  }

  static personalBackground(): Category {
    return new Category('personalBackground');
  }

  static entrepreneurialSkills(): Category {
    return new Category('entrepreneurialSkills');
  }

  static resources(): Category {
    return new Category('resources');
  }

  static behavioralMetrics(): Category {
    return new Category('behavioralMetrics');
  }

  static growthVision(): Category {
    return new Category('growthVision');
  }

  equals(other: Category): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 