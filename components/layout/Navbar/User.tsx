import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getInitials} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {UserType} from "@/lib/zod"
import Link from "next/link";

async function User({user}: {user: UserType}) {

    return (
        <div className="hidden md:flex items-center space-x-4 ">
            <Tooltip>
                <TooltipTrigger>
                    <Link href={'/dashboard/settings/account'}>
                        <Avatar className={"h-10 w-10"}>
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                    Currently logged in as {user.name}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export default User;