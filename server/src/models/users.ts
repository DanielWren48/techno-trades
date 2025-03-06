import { Query, Schema, Types, model } from 'mongoose';
import Stripe from 'stripe';

enum AUTH_TYPE {
    PASSWORD = "Password",
    GOOGLE = "Google",
}

enum ACCOUNT_TYPE {
    BUYER = "Buyer",
    STAFF = "Staff",
}

interface IToken {
    access: string;
    refresh: string;
}

interface IShippingAddress extends Stripe.ShippingAddressParam { }

interface IUser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | null;
    password: string;
    isActive: boolean;
    isEmailVerified: boolean;
    authType: AUTH_TYPE;
    accountType: ACCOUNT_TYPE;
    tokens: IToken[];
    otp: number | null;
    otpExpiry: Date;
    shippingAddress: IShippingAddress;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    firstName: { type: String, required: true, maxlength: 50 },
    lastName: { type: String, required: false, maxlength: 50 },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: null, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    authType: { type: String, enum: AUTH_TYPE, default: AUTH_TYPE.PASSWORD },
    accountType: { type: String, enum: ACCOUNT_TYPE, default: ACCOUNT_TYPE.BUYER },
    tokens: [
        {
            access: { type: String, required: true },
            refresh: { type: String, required: true },
        },
    ],
    otp: { type: Number, null: true, blank: true },
    otpExpiry: { type: Date, null: true, blank: true },
    shippingAddress: [
        { type: Object, default: null, required: false }
    ],
}, { timestamps: true });


UserSchema.pre(/^find/, function (this: Query<IUser[], IUser>, next) {
    this.find({ isActive: { $ne: false } });
    next();
});

// Create the User model
const User = model<IUser>('User', UserSchema);
export { User, IUser, IShippingAddress, ACCOUNT_TYPE, AUTH_TYPE };