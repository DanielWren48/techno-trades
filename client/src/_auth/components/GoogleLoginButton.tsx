import { Context, GoogleLogin, GsiButtonConfiguration } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import { useGoogleLogin as LoginMutate } from '@/api/auth/queries';
import { toast } from 'sonner';

interface GoogleLoginButtonProps {
    text?: GsiButtonConfiguration['text'];
    context?: Context | undefined
}

export default function GoogleLoginButton({ text = "signin_with", context = "signin" }: GoogleLoginButtonProps) {
    const { mutateAsync } = LoginMutate()

    const onSuccess = async (credentialResponse: CredentialResponse) => {
        if (credentialResponse.credential) {
            const response = await mutateAsync({ token: credentialResponse.credential })
            if (response.status === 'failure'){
                toast.error(response.message)
            }
        }
    };

    return (
        <div className="w-full">
            <GoogleLogin
                onSuccess={onSuccess}
                onError={() => {
                    console.error('Google Login Failed');
                }}
                useOneTap
                theme="outline"
                size="large"
                shape="rectangular"
                locale="en"
                ux_mode='popup'
                context={context}
                text={text}
            />
        </div>
    );
}