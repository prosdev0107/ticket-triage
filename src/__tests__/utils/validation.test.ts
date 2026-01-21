import { validateRequired } from "../../utils/validation";

describe("validateRequired", () => {
  it("should not throw for valid non-empty string", () => {
    expect(() => validateRequired("test", "field")).not.toThrow();
  });

  it("should throw for empty string", () => {
    expect(() => validateRequired("", "field")).toThrow("Missing or invalid field");
  });

  it("should throw for whitespace-only string", () => {
    expect(() => validateRequired("   ", "field")).toThrow("Missing or invalid field");
  });

  it("should throw for null", () => {
    expect(() => validateRequired(null, "field")).toThrow("Missing or invalid field");
  });

  it("should throw for undefined", () => {
    expect(() => validateRequired(undefined, "field")).toThrow("Missing or invalid field");
  });

  it("should throw for number", () => {
    expect(() => validateRequired(123, "field")).toThrow("Missing or invalid field");
  });

  it("should throw for object", () => {
    expect(() => validateRequired({}, "field")).toThrow("Missing or invalid field");
  });

  it("should include field name in error message", () => {
    expect(() => validateRequired("", "subject")).toThrow("Missing or invalid subject");
    expect(() => validateRequired("", "body")).toThrow("Missing or invalid body");
  });
});
