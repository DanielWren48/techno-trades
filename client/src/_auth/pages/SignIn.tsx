import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Fragment, useState } from 'react';
import { Icons } from '@/components/shared';
import { UserEmailSchemaType } from '../schemas';
import { Shell } from "@/components/dashboard/shell";
import { buttonVariants } from '@/components/ui/button';
import { GoogleLoginButton, SendLogInOtp, SigninForm, SignInWithOtp } from '../components'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SignIn() {
    const [signInMethod, setSignInMethod] = useState<string>('password');
    const [showOTPField, setShowOTPField] = useState(false);
    const [userData, setUserData] = useState<UserEmailSchemaType | undefined>();
    const [hasError, setHasError] = useState(false);

    const triggerShakeAnimation = () => {
        setHasError(true);
        setTimeout(() => {
            setHasError(false);
        }, 500);
    };

    return (
        <Shell variant={'default'} className='max-w-xl p-0 gap-4'>
            <Link to={"/"}>
                <CardTitle className="flex flex-row justify-center">
                    <img src="/logo.ico" alt="" className="w-10 mr-2" />
                    <span className="mt-1 text-2xl text-gray-600 dark:text-gray-200">TechnoTrades</span>
                </CardTitle>
            </Link>
            <Card className={` ${hasError ? 'animate-shake' : ''} transition-all duration-500 `} >
                <CardHeader className="flex gap-6 p-5 text-2xl my-4 text-center font-jost">Sign in to your account</CardHeader>
                <CardContent>
                    <Accordion className='flex flex-col gap-3' type="single" defaultValue={"password"} value={signInMethod} onValueChange={setSignInMethod}>
                        <AccordionItem value="password" className='border-none'>
                            {signInMethod === 'otp' &&
                                <div className='flex flex-row items-center justify-between gap-4 mx-8 max-w-lg'>
                                    <div className="flex-1">
                                        <AccordionTrigger
                                            showIcon={false}
                                            className={cn(
                                                buttonVariants({
                                                    className: "w-full h-10 border dark:bg-light-1 dark:text-secondary border-gray-900/20 hover:no-underline m-0 p-4 pl-8 relative",
                                                    size: "lg",
                                                    variant: "outline"
                                                }),
                                            )}
                                        >
                                            <Icons.mail className="absolute top-2.5 left-3 w-5 h-5 mr-2" />
                                            Sign in with Password
                                        </AccordionTrigger>
                                    </div>

                                    <div className="flex-1">
                                        <GoogleLoginButton text='signin_with' context='signin' />
                                    </div>
                                </div>
                            }
                            <AccordionContent className='px-1'>
                                <SigninForm triggerErrorAnimation={triggerShakeAnimation} />
                            </AccordionContent>
                        </AccordionItem>
                        <Fragment>
                            <div className="mx-8 flex items-center justify-between my-3">
                                <span className="w-[45%] border-b dark:border-gray-600"></span>
                                <div className="text-sm text-center text-gray-500 dark:text-gray-400">or</div>
                                <span className="w-[45%] border-b dark:border-gray-400"></span>
                            </div>
                        </Fragment>
                        <AccordionItem value="otp" className='border-none'>
                            {signInMethod === 'password' &&
                                <div className='flex flex-row items-center justify-between gap-4 mx-8 max-w-lg'>
                                    <div className="flex-1">
                                        <AccordionTrigger
                                            showIcon={false}
                                            className={cn(
                                                buttonVariants({
                                                    className: "w-full h-10 border dark:bg-light-1 dark:text-secondary border-gray-900/20 hover:no-underline m-0 p-4 pl-8 relative",
                                                    size: "lg",
                                                    variant: "outline"
                                                }),
                                            )}
                                        >
                                            <Icons.mail className="absolute top-2.5 left-3 w-5 h-5 mr-2" />
                                            Sign in with Email
                                        </AccordionTrigger>
                                    </div>

                                    <div className="flex-1">
                                        <GoogleLoginButton text='signin_with' context='signin' />
                                    </div>
                                </div>
                            }
                            <AccordionContent className='px-1'>
                                <SendLogInOtp
                                    showOTPField={showOTPField}
                                    setShowOTPField={setShowOTPField}
                                    setUserData={setUserData}
                                    triggerErrorAnimation={triggerShakeAnimation}
                                />
                                {(showOTPField && userData) &&
                                    <SignInWithOtp
                                        showOTPField={showOTPField}
                                        userData={userData}
                                        triggerErrorAnimation={triggerShakeAnimation}
                                    />
                                }
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                <CardFooter className='flex items-center justify-center bg-primary-foreground dark:bg-dark-4 m-1 p-5 mt-5 rounded-md'>
                    <div className="flex flex-row  items-center gap-2 text-center">
                        <span className="text-primary">Don't have an account? </span>
                        <Link
                            to={"/auth/sign-up"}
                            className="text-foreground font-semibold hover:underline">
                            Register
                        </Link>
                    </div>
                </CardFooter>
            </Card>
            <div className="flex mx-1 items-center">
                <Link
                    to={"/"}
                    className="text-muted-foreground font-medium hover:text-foreground after:content-['•'] after:mx-3 after:text-muted-foreground last:after:content-['']">
                    © TechnoTrades
                </Link>
                <Link
                    to={"/"}
                    className="text-muted-foreground font-medium hover:text-foreground after:content-['•'] after:mx-3 after:text-muted-foreground last:after:content-['']">
                    Contact
                </Link>
                <Link
                    to={"/"}
                    className="text-muted-foreground font-medium hover:text-foreground last:after:content-['']">
                    Privacy & terms
                </Link>
            </div>
        </Shell>
    )
}