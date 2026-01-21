import { parseJsonFromMessage } from "../../utils/jsonParser";

describe("parseJsonFromMessage", () => {
  it("should parse plain JSON", () => {
    const json = '{"category": "billing", "priority": "urgent"}';
    const result = parseJsonFromMessage(json);
    expect(result).toEqual({ category: "billing", priority: "urgent" });
  });

  it("should parse JSON wrapped in markdown code block", () => {
    const json = '```json\n{"category": "billing", "priority": "urgent"}\n```';
    const result = parseJsonFromMessage(json);
    expect(result).toEqual({ category: "billing", priority: "urgent" });
  });

  it("should parse JSON wrapped in code block without json tag", () => {
    const json = '```\n{"category": "billing", "priority": "urgent"}\n```';
    const result = parseJsonFromMessage(json);
    expect(result).toEqual({ category: "billing", priority: "urgent" });
  });

  it("should handle JSON with extra whitespace", () => {
    const json = '  {"category": "billing"}  ';
    const result = parseJsonFromMessage(json);
    expect(result).toEqual({ category: "billing" });
  });

  it("should throw error for invalid JSON", () => {
    const invalidJson = '{"category": "billing"';
    expect(() => parseJsonFromMessage(invalidJson)).toThrow();
  });

  it("should throw error for empty string", () => {
    expect(() => parseJsonFromMessage("")).toThrow();
  });

  it("should throw error for null", () => {
    expect(() => parseJsonFromMessage(null as any)).toThrow();
  });
});
