import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { RegisterValidationType } from '../schemas';
import { Shell } from "@/components/dashboard/shell";
import { useResendVerificationEmail } from '@/api/queries/auth';
import { Button, buttonVariants } from '@/components/ui/button';
import { VerifyAccountForm, RegisterForm, GoogleLoginButton } from '../components';
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PasswordReset() {
    const [activeTab, setActiveTab] = useState<string>('register');
    const [userData, setUserData] = useState<RegisterValidationType | undefined>();
    const [hasError, setHasError] = useState(false);
    const { mutateAsync } = useResendVerificationEmail()

    const triggerShakeAnimation = () => {
        setHasError(true);
        setTimeout(() => {
            setHasError(false);
        }, 500);
    };

    async function requestNewCode() {
        const { message } = await mutateAsync({ email: userData!.email })
        toast.info(message)
    }

    return (
        <Shell variant={'default'} className='max-w-xl p-0 gap-4'>
            <Link to={"/"}>
                <CardTitle className="flex flex-row justify-center">
                    <img src="/logo.ico" alt="" className="w-10 mr-2" />
                    <span className="mt-1 text-2xl text-gray-600 dark:text-gray-200">TechnoTrades</span>
                </CardTitle>
            </Link>
            <Card className={` ${hasError ? 'animate-shake' : ''} transition-all duration-500 `} >
                <CardHeader className="flex gap-6 p-5 text-2xl my-4 text-center font-jost">
                    {activeTab === 'register' && <>Create an account</>}
                    {activeTab === 'otp' && <>Verify your account</>}
                    {activeTab === 'confirm' && <>Account Verified Successfully</>}
                </CardHeader>
                <CardContent>
                    <Accordion type="single" defaultValue={"register"} value={activeTab} onValueChange={setActiveTab}>
                        <AccordionItem value="register" className='border-none'>
                            <AccordionContent className='px-1'>
                                <RegisterForm
                                    setActiveTab={setActiveTab}
                                    setUserData={setUserData}
                                    triggerErrorAnimation={triggerShakeAnimation}
                                />
                                <Fragment>
                                    <div className="flex items-center justify-between my-5">
                                        <span className="w-[45%] border-b dark:border-gray-600"></span>
                                        <div className="text-sm text-center text-gray-500 dark:text-gray-400">or</div>
                                        <span className="w-[45%] border-b dark:border-gray-400"></span>
                                    </div>
                                </Fragment>
                                <GoogleLoginButton text='signup_with' context='signup' />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="otp" className='border-none'>
                            <AccordionContent className='px-1'>
                                <VerifyAccountForm
                                    userData={userData}
                                    activeTab={activeTab}
                                    setActiveTab={setActiveTab}
                                    triggerErrorAnimation={triggerShakeAnimation}
                                />
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="confirm" className='border-none'>
                            <AccordionContent className='px-1'>
                                <Card className="flex flex-col items-center justify-center overflow-hidden p-0 gap-3 max-w-xl border-none shadow-none">
                                    <CardContent className="flex flex-row gap-3 items-center justify-center">
                                        <img src="/images/verified.png" className="w-20 h-20 object-cover" />
                                        <p className="text-2xl">
                                            Thank you {userData?.firstName} {userData?.lastName}! You have successfully verified your account.
                                        </p>
                                    </CardContent>
                                    <CardFooter className="w-full">
                                        <Link
                                            to="/auth/sign-in"
                                            className={cn(
                                                buttonVariants({
                                                    size: "lg",
                                                    className: "w-full",
                                                })
                                            )}
                                        >
                                            Sign In to your Account
                                        </Link>
                                    </CardFooter>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
                {activeTab === 'register' &&
                    <CardFooter className='flex items-center justify-center bg-slate-100 m-1 p-5 mt-5 rounded-md'>
                        <div className="flex flex-row  items-center gap-2 text-center">
                            <span className="text-black/50">Have an account already?</span>
                            <Link
                                to={"/auth/sign-in"}
                                className="text-foreground font-semibold dark:text-gray-400 hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </CardFooter>
                }
                {activeTab === 'otp' &&
                    <CardFooter className="flex flex-col space-y-5 w-full mt-5">
                        <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                            <p>Didn't recieve code?</p>
                            <HoverCard openDelay={0}>
                                <HoverCardTrigger className="flex flex-row items-center text-blue-600 p-0 cursor-pointer">Resend</HoverCardTrigger>
                                <HoverCardContent className="flex flex-col gap-5 w-[300px]">
                                    <h1>If you did not recieve your code, please check your <span className="font-bold italic">Spam Folder</span> before requesting a new one!</h1>
                                    <Button onClick={() => requestNewCode()}>Request new Code</Button>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </CardFooter>
                }
            </Card>
        </Shell >
    )
}