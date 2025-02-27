import { useState } from "react";
import { Button } from "@/components/ui/button";
import DeleteAccountDialog from "./delete-account-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserCloseAccount() {
    const [open, setOpen] = useState<boolean>(false);
    const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);

    const handleEditClick = () => {
        setDialogContent(<DeleteAccountDialog setOpen={setOpen} />);
    };

    return (
        <Card className="mt-4 p-1 max-w-[800px] bg-red-100 dark:bg-red-300 text-dark-4 dark:text-muted-foreground">
            <CardHeader className="text-left bg-light-1 dark:bg-background w-full rounded-lg">
                <CardDescription>
                    When you submit the form, your web account will be disabled, and you
                    will no longer be able to log in using the same details.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-start p-3">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild onClick={handleEditClick}>
                        <Button
                            type="button"
                            variant={"destructive"}
                        >
                            Deactivate My Account
                        </Button>
                    </DialogTrigger>
                    {dialogContent && (
                        <DialogContent className="max-w-2xl">{dialogContent}</DialogContent>
                    )}
                </Dialog>
            </CardContent>
        </Card>
    );
};