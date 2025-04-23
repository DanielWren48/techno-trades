"use client"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { first } from "lodash";
import { formatDate, ratingStyle } from "@/lib/utils";
import "@smastrom/react-rating/style.css";
import { ReviewType } from "@/lib/validation";
import { Rating } from "@smastrom/react-rating";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TableCellViewerProps = {
    review: ReviewType;
};

export function TableCellViewer({ review }: TableCellViewerProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="link" className="w-fit px-0 text-left text-foreground">
                    {review.title}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col w-3/5 sm:max-w-2xl">
                <SheetHeader className="gap-1">
                    <SheetTitle>
                        <div className="flex flex-row gap-3 text-center m-auto content-center items-center align-middle">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={review.userAvatar ?? undefined}
                                    alt="AR"
                                    className="object-cover"
                                />
                                <AvatarFallback>{first(review.userFirstName)}{first(review.userLastName)}</AvatarFallback>
                            </Avatar>
                            <h1>{review.userFirstName} {review.userLastName}</h1>
                        </div>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
                    <h2 className="text-lg font-bold">Rating</h2>
                    <Rating
                        value={review.rating}
                        readOnly
                        className="max-w-[200px]"
                        itemStyles={ratingStyle}
                    />
                    <h2 className="text-lg font-bold">Title</h2>
                    <span>{review.title}</span>

                    <h2 className="text-lg font-bold">Comment</h2>
                    <span>{review.comment}</span>

                    <h2 className="text-lg font-bold">Created on</h2>
                    <span>{formatDate(review.createdAt, "long")}</span>
                </div>
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                            Done
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}