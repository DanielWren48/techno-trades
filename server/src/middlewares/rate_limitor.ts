import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from "express";
import { ErrorCode, RequestError } from "../config/handlers"

interface RateLimitConfig {
    windowMs?: number;
    max?: number;
    message?: string;
}

const RATE_CFG = {
    default: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: 'Too many requests, please try again later.'
    },
    routes: {
        // auth & user
        login: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 3,
            message: 'Too many login attempts, please try again later.'
        },
        register: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5,
            message: 'Too many registration attempts, please try again later.'
        },
        passwordReset: {
            windowMs: 10 * 60 * 1000, // 10 minutes
            max: 2,
            message: 'Too many password reset attempts.'
        },
        sendOtp: {
            windowMs: 5 * 60 * 1000, // 5 minutes
            max: 1,
            message: 'Too many login attempts, please try again later.'
        },
        // products
        getProducts: {
            windowMs: 20 * 60 * 1000, // 5 minutes
            max: 20,
            message: 'Too many requests, please try again later.'
        },
        setProducts: {
            windowMs: 10 * 60 * 1000, // 10 minutes
            max: 5,
            message: 'Too many requests, please try again later.'
        },
    }
};

// Custom rate limiter creator
const rateLimiter = (config: RateLimitConfig = {}) => {
    return rateLimit({
        ...RATE_CFG.default,
        ...config,
        standardHeaders: true,
        legacyHeaders: false,

        // Skip rate limiting for localhost
        skip: (req: Request) => {
            const isLocalhost =
                req.ip === '127.0.0.1' ||
                req.ip === '::1' ||
                req.hostname === 'localhost' ||
                req.get('host')?.startsWith('localhost') ||
                req.get('host')?.startsWith('127.0.0.1');

            return isLocalhost || process.env.NODE_ENV === 'DEVELOPMENT';
        },

        handler: (req: Request, res: Response, next: NextFunction, options: any) => {
            throw new RequestError(options.message, 429, ErrorCode.TOO_MANY_REQUESTS);
        },
    });
}

const rateLimiterSimple = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        status: 'error',
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req: Request, res: Response, next: NextFunction, options) => {
        throw new RequestError(options.message.message, 429, ErrorCode.TOO_MANY_REQUESTS);
    },

    // Skip rate limiting for localhost
    skip: (req: Request) => {
        const isLocalhost =
            req.ip === '127.0.0.1' ||
            req.ip === '::1' ||
            req.hostname === 'localhost' ||
            req.get('host')?.startsWith('localhost') ||
            req.get('host')?.startsWith('127.0.0.1');

        return isLocalhost || process.env.NODE_ENV === 'DEVELOPMENT';
    },
});

export { RateLimitConfig, RATE_CFG, rateLimiter, rateLimiterSimple }