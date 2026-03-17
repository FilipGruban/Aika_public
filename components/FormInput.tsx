import React from 'react';
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Control, FieldPath, FieldValues} from "react-hook-form";
import {cn} from "@/lib/utils";

interface FormInputProps<T extends FieldValues> {
    name: FieldPath<T>;
    control: Control<T>;
    label: string;
    type: string;
    description?: string;
    placeholder?: string;
    className?: string;
}

function FormInput<T extends FieldValues>({control, type, label, name, description, placeholder, className}: FormInputProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem className={cn("py-1", className)}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input type={type} placeholder={placeholder} {...field}/>
                    </FormControl>
                    <FormDescription>{description}</FormDescription>
                    <FormMessage/>
                </FormItem>
            )}/>
    );
}

export default FormInput;