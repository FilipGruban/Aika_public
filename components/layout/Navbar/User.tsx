import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {getInitials} from "@/lib/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import {UserType} from "@/lib/zod"

async function User({user}: {user: UserType}) {

    return (
        <div className="hidden md:flex items-center space-x-4 ">
            <Tooltip>
                <TooltipTrigger>
                    <Avatar className={"h-10 w-10"}>
                        <AvatarImage src="/user.svg" alt="user avatar" />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                    Currently logged in as {user.name}
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

export default User;