import { Request, Response, NextFunction, Router } from "express";
import { CustomResponse, randomStr } from "../config/utils";
import { ACCOUNT_TYPE, AUTH_TYPE, IUser, User } from "../models/users";
import { ErrorCode, NotFoundError, RequestError, ValidationErr } from "../config/handlers";
import { checkPassword, createAccessToken, createOtp, createRefreshToken, createUser, hashPassword, setAuthCookie, validateGoogleToken, verifyRefreshToken } from "../managers/users";
import { authMiddleware, getUser } from "../middlewares/auth";
import { sendEmail, EmailType } from '../utils/emailer'
import { TokenPayload } from "google-auth-library";
import ENV from "../config/config";
import { randomBytes } from "crypto";
import { validationMiddleware } from "../middlewares/error";
import { LoginSchema, OtpLoginSchema, RefreshTokenSchema, RegisterSchema, SetNewPasswordSchema, TokenSchema, VerifyEmailSchema } from "../schemas/auth";
import { EmailSchema } from "../schemas/base";

const authRouter = Router();

authRouter.post('/register', validationMiddleware(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: RegisterSchema = req.body;
        const { email } = userData;

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            throw new ValidationErr("email", "Email already registered")
        }
        const user = await createUser(req.body)
        const otp = await createOtp(user);
        await sendEmail({ user, emailType: EmailType.ACTIVATE, data: otp })

        return res.status(201).json(CustomResponse.success('Registration successful', { user, otp }))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/verify-email', validationMiddleware(VerifyEmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: VerifyEmailSchema = req.body;
        const { email } = userData;
        const otp = Number(userData.otp)

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("Incorrect email!")
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot verify account created via google sign in", 401, ErrorCode.NOT_ALLOWED)
        }
        if (user.isEmailVerified) {
            return res.status(200).json(CustomResponse.success("Email already verified"))
        }

        // Verify otp
        const currentDate = new Date()
        if (user.otp !== otp || currentDate > user.otpExpiry) {
            throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        }

        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { otp: null, otpExpiry: null, isEmailVerified: true } }
        );

        await sendEmail({ user, emailType: EmailType.WELCOME })

        return res.status(200).json(CustomResponse.success('Verification successful', user))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/resend-verification-email', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email }: EmailSchema = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("Incorrect email!")
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot request password reset for account created via google sign in", 401, ErrorCode.NOT_ALLOWED)
        }
        if (user.isEmailVerified) {
            return res.status(200).json(CustomResponse.success("Email already verified"))
        }

        const otp = await createOtp(user);
        await sendEmail({ user, emailType: EmailType.ACTIVATE, data: otp })

        return res.status(200).json(CustomResponse.success('Email sent successful', otp))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/send-password-reset-otp', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email }: EmailSchema = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("Incorrect email!")
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot request password reset for account created via google sign in", 401, ErrorCode.NOT_ALLOWED)
        }

        const otp = await createOtp(user);
        await sendEmail({ user, emailType: EmailType.RESET_PASSWORD, data: otp })

        return res.status(200).json(CustomResponse.success('Email sent successful', otp))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/set-new-password', validationMiddleware(SetNewPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: SetNewPasswordSchema = req.body;

        const { email, password } = userData;
        const otp = Number(userData.otp)

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("Incorrect email!")
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot access for account created via google sign in", 401, ErrorCode.NOT_ALLOWED)
        }

        // Verify otp
        let currentDate = new Date()
        if (user.otp !== otp || currentDate > user.otpExpiry) {
            throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        }

        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { otp: null, otpExpiry: null, password: await hashPassword(password as string) } }
        );
        return res.status(200).json(CustomResponse.success('Password reset successful'))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/login', validationMiddleware(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password }: LoginSchema = req.body;

        const user = await User.findOne({ email })
        if (!user || !(await checkPassword(user, password as string))) {
            throw new RequestError("Incorrect email or password.", 401, ErrorCode.INVALID_CREDENTIALS);
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot sign in with account created via google sign in", 401, ErrorCode.NOT_ALLOWED)
        }

        // Generate tokens
        const access = createAccessToken(user.id)
        const refresh = createRefreshToken()
        const tokens = { user, access, refresh }

        // Set cookies
        setAuthCookie(res, req, 'access', access);
        setAuthCookie(res, req, 'refresh', refresh);

        // Update user with access tokens
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successfully', tokens))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/send-login-otp', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email }: EmailSchema = req.body;

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("User not found!")
        }
        if (!user.isEmailVerified) {
            throw new RequestError("Verify your email first", 401, ErrorCode.UNVERIFIED_USER);
        }

        const otp = await createOtp(user);
        await sendEmail({ user, emailType: EmailType.OTP_LOGIN, data: otp })
        
        return res.status(201).json(CustomResponse.success('Login otp sent successful', otp))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/login-with-otp', validationMiddleware(OtpLoginSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: OtpLoginSchema = req.body;
        const { email } = userData;
        const otp = Number(userData.otp)

        const user = await User.findOne({ email })
        if (!user) {
            throw new NotFoundError("Incorrect email!")
        }

        // Verify otp
        const currentDate = new Date()
        if (user.otp !== otp || currentDate > user.otpExpiry) {
            throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        }

        // Generate tokens
        const access = createAccessToken(user.id)
        const refresh = createRefreshToken()
        const tokens = { user, access, refresh }

        // Set cookies
        setAuthCookie(res, req, 'access', access);
        setAuthCookie(res, req, 'refresh', refresh);

        // Update user with access tokens
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successfully', tokens))
    } catch (error) {
        next(error)
    }
});

authRouter.get('/validate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            throw new RequestError("Unauthorized User", 401, ErrorCode.UNAUTHORIZED_USER);
        }
        const user = await getUser(req.headers.authorization.replace('Bearer ', ''));
        const { tokens } = user
        req.user = user
        return res.status(200).json(CustomResponse.success('Validate successful', { user, tokens }))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/refresh', validationMiddleware(RefreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken: string = req.body.refresh;
        const user = await User.findOne({ "tokens.refresh": refreshToken });
        if (!user || !(await verifyRefreshToken(refreshToken))) {
            throw new RequestError("Refresh token is invalid or expired!", 401, ErrorCode.INVALID_TOKEN);
        }

        // Generate new tokens
        const access = createAccessToken(user.id)
        const refresh = createRefreshToken()

        // Update user with access tokens
        let tokens = { user, access, refresh }

        // Set cookies
        setAuthCookie(res, req, 'access', access);
        setAuthCookie(res, req, 'refresh', refresh);

        await User.updateOne(
            { _id: user._id, "tokens.refresh": refreshToken },
            { $set: { "tokens.$": tokens } }
        );
        return res.status(201).json(CustomResponse.success('Tokens refreshed successfully', tokens))
    } catch (error) {
        next(error)
    }
});

authRouter.get('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const authorization = req.headers.authorization as string
        const token = authorization.replace('Bearer ', '');

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        await User.updateOne(
            { _id: user._id, "tokens.access": token },
            { $pull: { tokens: { access: token } } }
        );
        return res.status(200).json(CustomResponse.success("Logout Successfully"))
    } catch (error) {
        next(error)
    }
});

authRouter.post('/google', validationMiddleware(TokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: TokenSchema = req.body;
        const { token } = userData;

        // Validate token
        const { payload, error } = await validateGoogleToken(token as string) as { payload: TokenPayload, error: string }
        if (error) {
            throw new RequestError(error, 401, ErrorCode.INVALID_TOKEN);
        }

        // Get or Create User
        let user = await User.findOne({ email: payload.email })
        if (user && user.authType === AUTH_TYPE.PASSWORD) {
            throw new RequestError("Requires password to sign in to this account", 401, ErrorCode.INVALID_AUTH);
        }
        else if (!user) {
            const newUserPassword = ENV.NODE_ENV === 'DEVELOPMENT' ? 'password123' : randomBytes(4).toString('hex');
            const userData = {
                firstName: payload.given_name || payload.name || '',
                lastName: payload.family_name || '',
                email: payload.email || '',
                password: newUserPassword,
                isEmailVerified: payload.email_verified || false,
                isActive: true,
                accountType: ACCOUNT_TYPE.BUYER,
                avatar: payload.picture || null,
            }
            // TODO: SEND EMAIL WITH THE PASSWORD TO USER
            user = await createUser(userData, true, AUTH_TYPE.GOOGLE)
        }

        // Generate tokens
        const access = createAccessToken(user.id)
        const refresh = createRefreshToken()

        // Set cookies
        setAuthCookie(res, req, 'access', access);
        setAuthCookie(res, req, 'refresh', refresh);

        // Update user with access and refresh tokens
        let tokens = { user, access, refresh }
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successful', { user, tokens }))
    } catch (error) {
        next(error)
    }
});

export default authRouter;