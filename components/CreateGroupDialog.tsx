"use client"
import {
    Dialog,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Plus} from "lucide-react";
import {Card} from "@/components/ui/card";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Form} from "@/components/ui/form";
import {createCalendarGroupInput, createCalendarGroupSchema} from "@/lib/zod";
import {zodResolver} from "@hookform/resolvers/zod";
import FormInput from "@/components/FormInput";
import {useAllProviderCalendars} from "@/hooks/calendars";
import {Provider} from "@prisma/client";
import MainCalendarRadioGroup from "@/components/MainCalendarRadioGroup";
import MainCalendarProviderDropdown from "@/components/MainCalendarProviderDropdown";
import {toast} from "sonner";
import axiosInstance from "@/lib/axios";
import {AxiosError} from "axios";
import {useRouter} from "next/navigation";



function CreateGroupDialog({providers} : {providers: Provider[]}) {
    const router = useRouter();
    const providerCalendars = useAllProviderCalendars(providers, {owner: false});

    const form = useForm<createCalendarGroupInput>({
        resolver: zodResolver(createCalendarGroupSchema),
        defaultValues:{
            name: "",
            description: "",
            mainCalendarId: "",
            provider: ""
        }
    });
    const selectedProvider = form.watch("provider");

    async function handleSubmit(data : createCalendarGroupInput) {
        try {
            const res = await axiosInstance.post("/calendars/groups", data);
            toast.success(res.data.message);
            form.reset();
            router.push(`/dashboard/calendars/groups/${res.data.groupId}`);
        }
        catch (error) {
            console.error('[Create Group] Error:', error);
            if (error instanceof AxiosError) {
                toast.error(error.response?.data.message || "Failed to create group");
            } else {
                toast.error("Something went wrong");
            }
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Calendar Group</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Name your group and select main calendar, description is optional
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormInput
                            type="text"
                            name="name"
                            label="Group Name"
                            placeholder="Work, Holidays, Personal..."
                            description="Give your calendar group a name"
                            control={form.control}
                        />

                        <FormInput
                            type="text"
                            name="description"
                            label="Description"
                            placeholder="What is this group for?"
                            description="Optional description for your group"
                            control={form.control}
                        />
                        <MainCalendarProviderDropdown
                            form={form}
                            providers={providers}
                        />
                        {
                            selectedProvider &&
                            <MainCalendarRadioGroup
                                isLoading={providerCalendars[selectedProvider].isLoading}
                                error={providerCalendars[selectedProvider].error}
                                calendars={providerCalendars[selectedProvider].calendars}
                                form={form}
                            />
                        }
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >Create</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateGroupDialog;