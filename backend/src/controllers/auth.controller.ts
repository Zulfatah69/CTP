import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ message: 'Registration successful', user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    // Cookie based refresh token (ADR-010)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      accessToken: result.accessToken,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};
export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    const result = await authService.refreshUserToken(token);
    res.json(result);
  } catch (error) {
    res.clearCookie('refreshToken');
    next(error);
  }
};
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
};
