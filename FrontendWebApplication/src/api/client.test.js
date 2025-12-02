import { getApiBase } from "./client";

describe("getApiBase", () => {
  const oldEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...oldEnv };
    delete process.env.REACT_APP_API_BASE;
    delete process.env.REACT_APP_BACKEND_URL;
    // jsdom provides window.location.origin in CRA tests
    delete window.location;
    window.location = { origin: "http://localhost" };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  test("falls back to same-origin /api when no env set", () => {
    expect(getApiBase()).toBe("http://localhost/api");
  });

  test("uses relative path as-is (normalized) when env is '/api/v1/'", () => {
    process.env.REACT_APP_API_BASE = "/api/v1/";
    expect(getApiBase()).toBe("/api/v1");
  });

  test("adds /api to naked origin env", () => {
    process.env.REACT_APP_API_BASE = "https://example.com";
    expect(getApiBase()).toBe("https://example.com/api");
  });

  test("keeps existing path on full URL", () => {
    process.env.REACT_APP_BACKEND_URL = "https://api.example.com/api/v1";
    expect(getApiBase()).toBe("https://api.example.com/api/v1");
  });

  test("forces versioned path when REACT_APP_API_VERSIONED_PATH is set (origin-only)", () => {
    process.env.REACT_APP_API_BASE = "https://example.com";
    process.env.REACT_APP_API_VERSIONED_PATH = "/api/v1";
    expect(getApiBase()).toBe("https://example.com/api/v1");
    delete process.env.REACT_APP_API_VERSIONED_PATH;
  });

  test("forces versioned path when REACT_APP_API_VERSIONED_PATH is set (relative input)", () => {
    process.env.REACT_APP_API_BASE = "/api";
    process.env.REACT_APP_API_VERSIONED_PATH = "/api/v1";
    expect(getApiBase()).toBe("/api/v1");
    delete process.env.REACT_APP_API_VERSIONED_PATH;
  });

  test("handles vscode-internal hosts by ensuring path", () => {
    process.env.REACT_APP_API_BASE = "https://vscode-internal-29792-beta.beta01.cloud.kavia.ai:5000";
    expect(getApiBase()).toBe("https://vscode-internal-29792-beta.beta01.cloud.kavia.ai:5000/api");
  });
});
