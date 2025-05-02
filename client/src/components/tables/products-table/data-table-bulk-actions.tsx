import React from "react";
import { Row } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icons } from "@/components/shared";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionsDropdownProps<TData> {
    selectedRows: Row<TData>[];
    onArchiveSelected: () => Promise<void>;
    onClearSelection: () => void;
}

export default function BulkActionsDropdown<TData>({ selectedRows, onArchiveSelected, onClearSelection }: BulkActionsDropdownProps<TData>) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

    const downloadJSON = (data: any) => {
        const jsonData = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const jsonURL = URL.createObjectURL(jsonData);
        const link = document.createElement('a');
        link.href = jsonURL;
        link.download = `selected_rows.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async () => {
        setShowDeleteDialog(false);
        setIsDeleting(true);
        try {
            await onArchiveSelected();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild disabled={selectedRows.length === 0}>
                    <div className="relative">
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Bulk actions</span>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                        {selectedRows.length > 0 && <span className="absolute top-0 right-0 rounded-full text-xs text-white bg-destructive/80 px-1.5 py-0.5">{selectedRows.length}</span>}
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                        onClick={onClearSelection}
                    >
                        <Icons.close className='mr-2 h-4 w-4' />
                        Clear Selection ({selectedRows.length})
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => downloadJSON(selectedRows.flatMap(row => row.original))}
                    >
                        <Icons.download className='mr-2 h-4 w-4' />
                        Export selected as JSON
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={() => setShowDeleteDialog(true)}
                        className='text-red-400'
                        disabled={isDeleting}
                    >
                        <Icons.delete className='mr-2 h-4 w-4' />
                        Delete Selected Products
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to delete {selectedRows.length} {selectedRows.length === 1 ? "product" : "products"}.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}