export function validateOpenEndedResponse(response: string, minCharacters: number = 100): boolean {
  if (response.trim().length < minCharacters) {
    return false;
  }

  const trimmedResponse = response.trim();
  const nonsensePatterns = [
    /^[a-z\s]+$/i, // Only letters and spaces
    /^(.)\1+$/, // Repeated characters
    /^[0-9\s]+$/, // Only numbers and spaces
    /^[^\w\s]+$/, // Only special characters
  ];

  for (const pattern of nonsensePatterns) {
    if (pattern.test(trimmedResponse)) {
      return false;
    }
  }

  const wordCount = trimmedResponse.split(/\s+/).length;
  if (wordCount < 15) {
    return false;
  }

  return true;
} 