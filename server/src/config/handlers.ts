export class ErrorCode {
    static readonly UNAUTHORIZED_USER = "unauthorized_user";
    static readonly NETWORK_FAILURE = "network_failure";
    static readonly SERVER_ERROR = "server_error";
    static readonly INVALID_ENTRY = "invalid_entry";
    static readonly INCORRECT_EMAIL = "incorrect_email";
    static readonly INVALID_OTP = "invalid_otp";
    static readonly INVALID_AUTH = "invalid_auth";
    static readonly INVALID_TOKEN = "invalid_token";
    static readonly INVALID_CREDENTIALS = "invalid_credentials";
    static readonly UNVERIFIED_USER = "unverified_user";
    static readonly NON_EXISTENT = "non_existent";
    static readonly INVALID_OWNER = "invalid_owner";
    static readonly INVALID_PAGE = "invalid_page";
    static readonly INVALID_PARAM = "invalid_param";
    static readonly INVALID_MEMBER = "invalid_member";
    static readonly INVALID_VALUE = "invalid_value";
    static readonly NOT_ALLOWED = "not_allowed";
    static readonly INVALID_DATA_TYPE = "invalid_data_type";
    static readonly TOO_MANY_REQUESTS = "too_many_requests";
}

export class RequestError extends Error {
    status: number;
    code: string;
    data?: any;

    constructor(message: string, status: number, code: string, data?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.data = data;

        // Set the prototype explicitly to maintain instanceof behavior
        Object.setPrototypeOf(this, RequestError.prototype);

        // Capture the stack trace (if available)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export class ValidationErr extends RequestError {
    constructor(field: string, field_message: string) {
        let message = "Invalid Entry"
        let data = { [field]: field_message }
        super(message, 422, ErrorCode.INVALID_ENTRY, data);
    }
}

export class NotFoundError extends RequestError {
    constructor(message: string) {
        super(message, 404, ErrorCode.NON_EXISTENT);
    }
}

export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}