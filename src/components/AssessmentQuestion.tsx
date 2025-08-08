'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/domain/entities/Question';
import { validateOpenEndedResponse } from '@/utils/scoring';

interface AssessmentQuestionProps {
  question: Question;
  value?: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}

export default function AssessmentQuestion({ question, value, onChange }: AssessmentQuestionProps) {
  const [textValue, setTextValue] = useState(value as string || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value as string[] || []);
  const [characterCount, setCharacterCount] = useState(0);
  const [isValid, setIsValid] = useState(true);

  // Reset state when question changes
  useEffect(() => {
    if (question.type === 'openEnded') {
      setTextValue(value as string || '');
      setCharacterCount((value as string || '').length);
      setIsValid(true);
    } else if (question.type === 'multiSelect') {
      setSelectedOptions(value as string[] || []);
    }
  }, [question.id, question.type, value]);

  const handleMultipleChoiceChange = (option: string) => {
    onChange(option);
  };

  const handleMultiSelectChange = (option: string) => {
    const newSelected = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    
    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const handleLikertChange = (rating: number) => {
    onChange(rating);
  };

  const handleTextChange = (text: string) => {
    setTextValue(text);
    setCharacterCount(text.length);
    
    // Validate content
    if (question.minCharacters) {
      const valid = validateOpenEndedResponse(text, question.minCharacters);
      setIsValid(valid);
    }
    
    onChange(text);
  };

  const renderMultipleChoice = () => (
    <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${question.id}`}>
      {question.options?.map((option, index) => (
        <label
          key={index}
          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
            value === option
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name={question.id}
            value={option}
            checked={value === option}
            onChange={() => handleMultipleChoiceChange(option)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            aria-describedby={`option-${question.id}-${index}`}
          />
          <span className="ml-3 text-gray-900" id={`option-${question.id}-${index}`}>{option}</span>
        </label>
      ))}
    </div>
  );

  const renderMultiSelect = () => (
    <div className="space-y-3" role="group" aria-labelledby={`question-${question.id}`}>
      {question.options?.map((option, index) => (
        <label
          key={index}
          className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedOptions.includes(option)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="checkbox"
            name={question.id}
            value={option}
            checked={selectedOptions.includes(option)}
            onChange={() => handleMultiSelectChange(option)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
            aria-describedby={`option-${question.id}-${index}`}
          />
          <span className="ml-3 text-gray-900" id={`option-${question.id}-${index}`}>{option}</span>
        </label>
      ))}
      {selectedOptions.length > 0 && (
        <div className="text-sm text-gray-600 mt-2" aria-live="polite">
          Selected: {selectedOptions.length} of {question.options?.length} options
        </div>
      )}
    </div>
  );

  const renderLikert = () => {
    // Check if this is the Fear of Failure question (Q19)
    const isFearOfFailure = question.id === 'q19';
    
    return (
      <div className="space-y-4" role="group" aria-labelledby={`question-${question.id}`}>
        <div className="text-sm text-gray-600 mb-4" id={`question-${question.id}`}>
          {isFearOfFailure 
            ? "Rate how much fear of failure prevents you from taking bold steps in your business"
            : "Rate your confidence level from 1 (Not at all confident) to 5 (Extremely confident)"
          }
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {isFearOfFailure ? "1 - Not at all" : "1 - Not at all confident"}
          </span>
          <div className="flex space-x-2" role="radiogroup" aria-label="Rating scale">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleLikertChange(rating)}
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-colors ${
                  value === rating
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
                aria-pressed={value === rating}
                aria-label={`Rating ${rating}`}
              >
                {rating}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {isFearOfFailure ? "5 - Extremely" : "5 - Extremely confident"}
          </span>
        </div>
      </div>
    );
  };

  const renderOpenEnded = () => (
    <div className="space-y-4" role="group" aria-labelledby={`question-${question.id}`}>
      {question.subHeading && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 italic">{question.subHeading}</p>
        </div>
      )}
      
      <textarea
        value={textValue}
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder="Please provide a detailed response..."
        className={`w-full h-32 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          !isValid && characterCount > 0 ? 'border-red-300 focus:ring-red-500' : ''
        }`}
        rows={6}
        aria-labelledby={`question-${question.id}`}
        aria-describedby={`char-count-${question.id} ${!isValid && characterCount > 0 ? 'error-' + question.id : ''}`}
        aria-invalid={!isValid && characterCount > 0}
      />
      
      <div className="flex justify-between items-center text-sm">
        <div className="text-gray-500">
          {question.minCharacters && (
            <span>
              Minimum {question.minCharacters} characters required
            </span>
          )}
        </div>
        <div className={`font-medium ${
          characterCount < (question.minCharacters || 0) ? 'text-red-600' : 'text-green-600'
        }`} id={`char-count-${question.id}`} aria-live="polite">
          {characterCount} characters
        </div>
      </div>
      
      {!isValid && characterCount > 0 && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg" id={`error-${question.id}`} role="alert">
          Please provide a more detailed and thoughtful response. Your answer should be at least {question.minCharacters} characters and show genuine reflection on the question.
        </div>
      )}
      
      <div className="text-sm text-gray-500">
        Please provide a thoughtful, detailed response. This will be evaluated by AI to assess your entrepreneurial potential.
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Response Options */}
      {question.type === 'multipleChoice' && renderMultipleChoice()}
      {question.type === 'multiSelect' && renderMultiSelect()}
      {question.type === 'likert' && renderLikert()}
      {question.type === 'openEnded' && renderOpenEnded()}
    </div>
  );
} 