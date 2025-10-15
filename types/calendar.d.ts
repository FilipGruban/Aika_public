import {AccessRole} from "@prisma/client";


export interface CalendarItem {
    id: string;
    name: string;
    accessRole: AccessRole;
    selected: boolean;
}