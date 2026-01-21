/**
 * Extracts and parses JSON from a string that may contain markdown code blocks.
 * Handles cases where the response is wrapped in ```json ... ``` or ``` ... ```
 * @throws Error if JSON parsing fails
 */
export function parseJsonFromMessage(message: string): any {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message: expected a non-empty string");
  }

  // Remove markdown code blocks if present
  let cleaned = message.trim();
  
  // Match ```json ... ``` or ``` ... ```
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = cleaned.match(codeBlockRegex);
  
  if (match) {
    cleaned = match[1].trim();
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    throw new Error(
      `Failed to parse JSON response. Raw message: ${message.substring(0, 200)}...`
    );
  }
}
