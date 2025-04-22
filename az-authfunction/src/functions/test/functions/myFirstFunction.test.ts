import { HttpRequest, InvocationContext } from "@azure/functions";
import { userInfo, validateEntraIDToken } from "../../auth"; // Adjust the import path as needed
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import axios from "axios";
import * as querystring from "querystring";

// Mock dependencies
jest.mock("jsonwebtoken");
jest.mock("jwks-rsa");
jest.mock("axios");
jest.mock("querystring");

// Mock environment variables
const mockEnv = {
  ENTRA_TENANT_ID: "mock-tenant-id",
  ENTRA_CLIENT_ID: "mock-client-id",
  ENTRA_CLIENT_SECRET: "mock-client-secret",
  ENTRA_SCOPE: "api://mock-client-id/.default",
  ENTRA_TOKEN_ENDPOINT: "https://login.microsoftonline.com/mock-tenant-id/oauth2/v2.0/token",
};

beforeAll(() => {
  // Set up environment variables
  process.env.ENTRA_TENANT_ID = mockEnv.ENTRA_TENANT_ID;
  process.env.ENTRA_CLIENT_ID = mockEnv.ENTRA_CLIENT_ID;
  process.env.ENTRA_CLIENT_SECRET = mockEnv.ENTRA_CLIENT_SECRET;
  process.env.ENTRA_SCOPE = mockEnv.ENTRA_SCOPE;
  process.env.ENTRA_TOKEN_ENDPOINT = mockEnv.ENTRA_TOKEN_ENDPOINT;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("validateEntraIDToken", () => {
  const mockContext = {
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as InvocationContext;

  it("should validate a token successfully", async () => {
    const token = "mock-token";
    const decodedToken = {
      header: { kid: "mock-kid" },
      payload: { iss: "mock-issuer", aud: "mock-audience" },
    };
    const signingKey = "mock-public-key";
    const verifiedToken = { user: "mock-user" };

    // Mock jwt.decode
    (jwt.decode as jest.Mock).mockReturnValue(decodedToken);

    // Mock jwksClient
    const mockGetSigningKey = jest.fn().mockResolvedValue({
      getPublicKey: jest.fn().mockReturnValue(signingKey),
    });
    (jwksClient as unknown as jest.Mock).mockReturnValue({
      getSigningKey: mockGetSigningKey,
    });

    // Mock jwt.verify
    (jwt.verify as jest.Mock).mockReturnValue(verifiedToken);

    const result = await validateEntraIDToken(token, mockContext);

    expect(jwt.decode).toHaveBeenCalledWith(token, { complete: true });
    expect(jwksClient).toHaveBeenCalledWith({
      jwksUri: `https://login.microsoftonline.com/${mockEnv.ENTRA_TENANT_ID}/discovery/v2.0/keys`,
    });
    expect(mockGetSigningKey).toHaveBeenCalledWith("mock-kid");
    expect(jwt.verify).toHaveBeenCalledWith(token, signingKey, {
      audience: decodedToken.payload.aud,
      issuer: decodedToken.payload.iss,
    });
    expect(result).toEqual(verifiedToken);
  });

  it("should throw an error for invalid token", async () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);

    await expect(validateEntraIDToken("invalid-token", mockContext)).rejects.toThrow(
      "Invalid token"
    );
    expect(jwt.decode).toHaveBeenCalledWith("invalid-token", { complete: true });
  });
});

describe("userInfo HTTP Trigger", () => {
  const mockContext = {
    error: jest.fn(),
    log: jest.fn(),
  } as unknown as InvocationContext;

  const createMockRequest = (headers: Record<string, string>) => {
    return {
      headers: {
        get: (key: string) => headers[key],
      },
    } as HttpRequest;
  };

  it("should return 401 if no authorization header is provided", async () => {
    const request = createMockRequest({});

    const response = await userInfo(request, mockContext);

    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({ message: "No token provided" });
  });

  it("should return 401 if authorization header does not start with Bearer", async () => {
    const request = createMockRequest({ authorization: "Invalid token" });

    const response = await userInfo(request, mockContext);

    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({ message: "No token provided" });
  });

  it("should return 200 with user info for a valid token", async () => {
    const token = "mock-token";
    const request = createMockRequest({ authorization: `Bearer ${token}` });
    const decodedToken = { user: "mock-user" };
    const axiosResponse = {
      data: { access_token: "mock-access-token" },
    };

    // Mock validateEntraIDToken
    jest.spyOn(require("../../auth"), "validateEntraIDToken").mockResolvedValue(decodedToken);

    // Mock axios.post
    (axios.post as jest.Mock).mockResolvedValue(axiosResponse);

    // Mock querystring.stringify
    (querystring.stringify as jest.Mock).mockReturnValue("mock-query-string");

    const response = await userInfo(request, mockContext);

    expect(validateEntraIDToken).toHaveBeenCalledWith(token, mockContext);
    expect(axios.post).toHaveBeenCalledWith(
      mockEnv.ENTRA_TOKEN_ENDPOINT,
      "mock-query-string",
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    expect(querystring.stringify).toHaveBeenCalledWith({
      grant_type: "client_credentials",
      client_id: mockEnv.ENTRA_CLIENT_ID,
      client_secret: mockEnv.ENTRA_CLIENT_SECRET,
      scope: mockEnv.ENTRA_SCOPE,
    });
    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      message: "Authentication successful",
      data: { ...decodedToken, ...axiosResponse.data },
    });
  });

  it("should return 401 if token verification fails", async () => {
    const token = "invalid-token";
    const request = createMockRequest({ authorization: `Bearer ${token}` });

    // Mock validateEntraIDToken to throw an error
    jest
      .spyOn(require("../../auth"), "validateEntraIDToken")
      .mockRejectedValue(new Error("Token verification failed"));

    const response = await userInfo(request, mockContext);

    expect(validateEntraIDToken).toHaveBeenCalledWith(token, mockContext);
    expect(mockContext.error).toHaveBeenCalledWith(
      "Token verification failed:",
      expect.any(Error)
    );
    expect(response.status).toBe(401);
    expect(response.jsonBody).toEqual({
      message: "Invalid token",
      error: "Token verification failed",
    });
  });
});