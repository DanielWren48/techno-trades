import { Link } from "react-router-dom"
import { Fragment, useState } from "react"
import { Button } from "@/components/ui/button"
import { GoogleLoginButton, SigninForm } from "@/_auth/components"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"

export default function SignInDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="w-full">
                <Button size={"lg"} className="w-full bg-dark-1 rounded-md dark:text-white/90 py-4 px-8">
                    Sign In to Checkout
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl w-full px-6 py-12 md:px-12 lg:w-1/2 rounded-xl shadow-lg">
                <DialogHeader>
                    <DialogTitle className="mt-3 text-2xl text-center text-gray-600 dark:text-gray-200">
                        Welcome back!
                    </DialogTitle>
                </DialogHeader>
                <Card className="w-full border-none bg-none shadow-none">
                    <CardContent className="p-0">
                        <SigninForm showPasswordReset={false} setOpen={setOpen} />
                    </CardContent>
                </Card>
                <Fragment>
                    <div className="flex items-center justify-between my-2">
                        <span className="w-[45%] border-b dark:border-gray-600"></span>
                        <div className="text-sm text-center text-gray-500 dark:text-gray-400">or</div>
                        <span className="w-[45%] border-b dark:border-gray-400"></span>
                    </div>
                </Fragment>
                <GoogleLoginButton text='signin_with' context='signin' />
                <DialogFooter className='flex items-center sm:justify-center mt-8'>
                    <div className="flex flex-row  items-center gap-2 text-center">
                        <span className="text-black/50">Don't have an account? </span>
                        <Link
                            to={"/auth/sign-up"}
                            className="text-foreground font-semibold dark:text-gray-400 hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}