import dotenv from "dotenv";

dotenv.config();

// userInfo.ts or index.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import axios from "axios";
import * as querystring from "querystring";


// Function to validate the token from Entra ID
export const validateEntraIDToken = async (token: string, context: InvocationContext): Promise<any> => {
  // Get token header
  const decodedToken = jwt.decode(token, { complete: true });
  if (!decodedToken) {
    throw new Error('Invalid token');
  }
  const tokenIssuer = (decodedToken.payload as jwt.JwtPayload).iss;
  const tokenAudience = (decodedToken.payload as jwt.JwtPayload).aud;
  console.log(">>>>>>>>>>>>>>>>>>.IDS",process.env.ENTRA_TENANT_ID)
  console.log(">>>>>>>>>>>>>>>>>>.IDS",process.env.ENTRA_CLIENT_ID)
  console.log(">>>>>>>>>>>>>>>>>>.IDS",process.env.ENTRA_CLIENT_SECRET)
  // Get signing key
  const kid = decodedToken.header.kid;
  const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/discovery/v2.0/keys`
  });

  const key = await client.getSigningKey(kid);
  const signingKey = key.getPublicKey();
  // Verify token
  return jwt.verify(token, signingKey, {
    audience: tokenAudience,
    issuer: tokenIssuer,
  });
};

// HTTP trigger function using the new programming model for Node.js 20
export async function userInfo(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  // Removed context.log('HTTP trigger function processed a request.');

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        jsonBody: { message: 'No token provided' }
      };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify and decode the token
    const decoded = await validateEntraIDToken(token, context);

// Get the token endpoint from environment variable
const tokenEndpoint = process.env.ENTRA_TOKEN_ENDPOINT || 
`https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/oauth2/v2.0/token`;

// Prepare the request data
const data = {
    grant_type: "client_credentials",
    client_id: process.env.ENTRA_CLIENT_ID,
    client_secret: process.env.ENTRA_CLIENT_SECRET,
    scope: process.env.ENTRA_SCOPE || `api://${process.env.ENTRA_CLIENT_ID}/.default`
  };
 
  // Make the token request
  const response = await axios.post(
    tokenEndpoint,
    querystring.stringify(data),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

   
    // Return user info
    return {
      status: 200,
      jsonBody: {
        message: 'Authentication successful',
        data: {
          ...decoded,
          ...response.data
        }
      }
    };
  } catch (error) {
    context.error('Token verification failed:', error);
    return {
      status: 401,
      jsonBody: { 
        message: 'Invalid token', 
        error: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
}

// Register the function with the new programming model
app.http('userInfo', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/token',
  handler: userInfo
});