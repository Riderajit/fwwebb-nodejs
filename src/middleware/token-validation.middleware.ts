// src/auth/middleware/azure-token-validation.middleware.ts
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config'

// Create a JWKS client that will fetch the public keys from Azure AD
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`, // Azure AD endpoint for keys
});

@Injectable()
export class AzureTokenValidationMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from "Authorization: Bearer <token>"
    
    if (!token) {
      return next(new UnauthorizedException('Token is required'));
    }
    
    try {
      // Decode the JWT token to get the "kid" (Key ID) from the header
      const decodedToken = jwt.decode(token, { complete: true });
      console.log('Decoded JWT Header:', decodedToken?.header);
      
      if (!decodedToken?.header?.kid) {
        return next(new UnauthorizedException('Invalid token: Missing Key ID (kid)'));
      }

      // Get the signing key from Azure AD using the key ID
      client.getSigningKey(decodedToken.header.kid, (err, key: any) => {
        if (err) {
          console.error('Error getting signing key:', err);
          return next(new UnauthorizedException('Unable to retrieve signing key'));
        }
        
        // Get the public key to validate the token's signature
        const publicKey = key.publicKey || key.rsaPublicKey;
        
        // Now validate the token using the public key from Azure AD
        jwt.verify(token, publicKey, (err, decoded) => {
          if (err) {
            console.error('Token verification error:', err);
            return next(new UnauthorizedException('Invalid or expired token'));
          }
          
          // Attach the decoded user info to the request object
          req.user = decoded;
          console.log("User data attached to request:", req.user);
          next(); // Proceed to the next middleware/route handler
        });
      });
    } catch (error) {
      console.error('Unexpected error in token validation:', error);
      return next(new UnauthorizedException('Error processing token'));
    }
  }
}