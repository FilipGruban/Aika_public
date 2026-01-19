import {Provider} from "@prisma/client";
import {UseFormReturn} from "react-hook-form";
import {FormField, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

interface MainCalendarProviderDropdownProps{
    providers: Provider[],
    form: UseFormReturn<{
        name: string
        mainCalendarId: string
        provider: "" | "google" | "microsoft" | "apple"
        description?: string | undefined
    }, any, {
        name: string
        mainCalendarId: string
        provider: "" | "google" | "microsoft" | "apple"
        description?: string | undefined
    }>
}

function MainCalendarProviderDropdown({form, providers} :MainCalendarProviderDropdownProps) {
    return (
        <FormField control={form.control} name={"provider"} render={({field})=>(
            <>
                <Select value={field.value} onValueChange={(value) => {
                    form.setValue("mainCalendarId", "");
                    field.onChange(value);
                }}>
                    <SelectTrigger className={"w-full"}>
                        <SelectValue placeholder="Select main calendar provider" />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            providers.map((provider) => (
                                <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                <FormMessage/>
            </>
        )}
        />
    )
}

export default MainCalendarProviderDropdown;