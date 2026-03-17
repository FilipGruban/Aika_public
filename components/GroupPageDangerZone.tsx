'use client'
import React, {useState} from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import {createDeleteGroupSchema, DeleteGroupInput} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import FormInput from "@/components/FormInput";
import {deteleCalendarGroup} from "@/actions/group";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

interface DangerZoneProps {
    groupId: string;
    groupName: string;
}

function GroupPageDangerZone({groupId, groupName}: DangerZoneProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const deleteGroupSchema = createDeleteGroupSchema(groupName);

    const form = useForm<DeleteGroupInput>({
        resolver: zodResolver(deleteGroupSchema),
        defaultValues:{
            confirmName: ''
        }
    });

    async function handleDeleteGroup() {
        try {
            const res = await deteleCalendarGroup(groupId)
            if (!res.success){
                toast.error(res.message)
                return;
            }
            toast.success(res.message)
            router.push("/dashboard/calendars/groups");
        }
        catch (error){
            console.log(error)
            toast.error("Something went wrong");
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex flex-row items-center justify-between p-4 border border-destructive/50 rounded-lg">
                <div className="space-y-0.5">
                    <div className="text-base font-medium">Delete Calendar Group</div>
                    <div className="text-sm text-muted-foreground">
                        Permanently delete this calendar group and all its settings
                    </div>
                </div>
                <DialogTrigger asChild>
                    <Button variant="destructive">Delete Group</Button>
                </DialogTrigger>
            </div>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your
                        calendar group and remove all associated data.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleDeleteGroup)} className="space-y-4">
                        <FormInput
                            type={'text'}
                            name={'confirmName'}
                            label={`Type "${groupName}" to confirm`}
                            control={form.control}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Deleting..." : "Delete Group"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default GroupPageDangerZone;