import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthenticatedRequest } from '../../../src/server/middleware/auth';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication required',
    });
  });

  it('should return 403 if token is invalid', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid_token',
    };

    authenticateToken(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
  });

  it('should call next() if token is valid', () => {
    const user = { id: 1, email: 'test@example.com' };
    const token = jwt.sign(user, process.env.JWT_SECRET || 'test-secret');
    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authenticateToken(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toEqual(user);
  });

  it('should handle malformed tokens', () => {
    mockRequest.headers = {
      authorization: 'not_a_bearer_token',
    };

    authenticateToken(
      mockRequest as AuthenticatedRequest,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Authentication required',
    });
  });
}); 