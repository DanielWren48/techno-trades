import { Request, Response, NextFunction, Router } from "express";
import { CustomResponse } from "../config/utils";
import { AUTH_TYPE, User } from "../models/users";
import { ErrorCode, NotFoundError, RequestError, ValidationErr } from "../config/handlers";
import { checkPassword, createAccessToken, createOtp, createRefreshToken, createUser, hashPassword, setAuthCookie } from "../managers/users";
import { authMiddleware, staff } from "../middlewares/auth";
import { EmailType, sendEmail } from "../utils/emailer";
import { validationMiddleware } from "../middlewares/error";
import { UpdateUserDetails, UpdateUserEmail, UpdateUserPassword } from "../schemas/user";
import { utapi } from "../upload";
import { rateLimiter, RATE_CFG } from "../middlewares/rate_limitor";

const userRouter = Router();

userRouter.get('/', authMiddleware, staff, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find()
        if (!users) {
            throw new NotFoundError("Users not found")
        }
        return res.status(200).json(CustomResponse.success("OK", { users }))
    } catch (error) {
        next(error)
    }
});

userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const user = await User.findById(id).select('-password')
        if (!user) {
            throw new NotFoundError("User not found")
        }
        return res.status(200).json(CustomResponse.success("OK", { user }))
    } catch (error) {
        next(error)
    }
});

userRouter.patch('/update-my-password', rateLimiter(RATE_CFG.routes.passwordReset), authMiddleware, validationMiddleware(UpdateUserPassword), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const userData = req.body as UpdateUserPassword;
        const { passwordCurrent, password } = userData;

        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot update user details for Google auth", 400, ErrorCode.NOT_ALLOWED);
        }

        if (!user || !(await checkPassword(user, passwordCurrent as string))) {
            throw new RequestError("Invalid credentials!", 401, ErrorCode.INVALID_CREDENTIALS);
        }
        if (!user.isEmailVerified) {
            throw new RequestError("Verify your email first", 401, ErrorCode.UNVERIFIED_USER);
        }

        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { password: await hashPassword(password as string) } }
        );
        return res.status(200).json(CustomResponse.success('Password reset successful'))
    } catch (error) {
        next(error)
    }
});

userRouter.post('/send-email-change-otp', rateLimiter(RATE_CFG.routes.sendOtp), authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user

        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot update user details for Google auth", 400, ErrorCode.NOT_ALLOWED);
        }

        if (!user.isEmailVerified) {
            throw new RequestError("Verify your email first", 401, ErrorCode.UNVERIFIED_USER);
        }

        const otp = await createOtp(user);
        await sendEmail({ user, emailType: EmailType.RESET_EMAIL, data: otp })

        return res.status(200).json(CustomResponse.success('Email sent successful', otp))
    } catch (error) {
        next(error)
    }
});

userRouter.patch('/update-my-email', rateLimiter(RATE_CFG.routes.passwordReset), authMiddleware, validationMiddleware(UpdateUserEmail), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const userData = req.body as UpdateUserEmail;
        const { email, otp } = userData;

        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot update user details for Google auth", 400, ErrorCode.NOT_ALLOWED);
        }

        // Verify otp
        const currentDate = new Date()
        if (user.otp !== otp || currentDate > user.otpExpiry) {
            throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $set: { otp: null, otpExpiry: null, email: email, isEmailVerified: true } },
            { new: true, runValidators: true }
        );

        return res.status(200).json(CustomResponse.success('Verification successful', updatedUser))
    } catch (error) {
        next(error)
    }
});

userRouter.patch('/update-me', rateLimiter(RATE_CFG.routes.passwordReset), authMiddleware, validationMiddleware(UpdateUserDetails), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const userData = req.body as UpdateUserDetails;

        if (user.authType === AUTH_TYPE.GOOGLE) {
            throw new RequestError("Cannot update user details for Google auth", 400, ErrorCode.NOT_ALLOWED);
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, userData,
            { new: true, runValidators: true }
        );

        return res.status(200).json(CustomResponse.success('User updated successfully', updatedUser))
    } catch (error) {
        next(error)
    }
});

userRouter.delete('/deactivate-me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        if (user.authType === AUTH_TYPE.PASSWORD) {
            const user_avator = user.avatar && user.avatar.split("/").at(-1);
            if (user_avator) await utapi.deleteFiles(user_avator)
            await User.findByIdAndUpdate(req.user._id, { isActive: false, avatar: null, tokens: null, isEmailVerified: false })
        }
        if (user.authType === AUTH_TYPE.GOOGLE) {
            await User.findByIdAndUpdate(req.user._id, { isActive: false, tokens: null })
        }

        return res.status(200).json(CustomResponse.success('User deleted successfully'))
    } catch (error) {
        next(error)
    }
});

export default userRouter;