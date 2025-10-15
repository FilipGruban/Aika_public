import {NextResponse} from "next/server";
import {getAccount} from "@/lib/user";
import {getCurrentUser} from "@/lib/authUser";
import {getCredentials} from "@/lib/tokens";
import axiosInstance from "@/lib/axios";
import {decrypt} from "@/lib/encryption";
import {getApplePrincipalUrl, parseCalDavResponse} from "@/lib/apple";


export interface AppleCalDAVEntry {
    href: { _text: string };
    propstat:
        | {
        prop: {
            displayname?: { _text?: string };
            resourcetype?: {
                calendar?: Record<string, unknown>;
            };
        };
        status: { _text: string };
    }
        | Array<{
        prop: {
            displayname?: { _text?: string };
            resourcetype?: {
                calendar?: Record<string, unknown>;
            };
        };
        status: { _text: string };
    }>;
}
export interface AppleCalendarEntry {
    href: { _text: string };
    propstat: {
        prop: {
            displayname: { _text?: string };
            resourcetype: {
                collection?: object;
                calendar?: object;
            };
        };
        status: { _text: string };
    };
}

export async function GET() {
    try {
        const user = await getCurrentUser();
        if(!user){
            return NextResponse.json({message:"Unauthorized"}, {status: 401})
        }
        const account = await getAccount(user.id, "apple");
        if(!account){
            return NextResponse.json({message:"Apple account not found"}, {status: 400})
        }

        const credentials =  getCredentials(account);
        const password = decrypt(credentials.credential)
        const userHash = await getApplePrincipalUrl(credentials.username, password);
        const url = `https://caldav.icloud.com/${userHash}/calendars/`

        const res = await axiosInstance.request({
            method: "PROPFIND",
            url,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                Depth: "1"
            },
            auth: {
                username: credentials.username,
                password: password,
            },
            data: `<?xml version="1.0" encoding="UTF-8"?>
                <d:propfind xmlns:d="DAV:" xmlns:cs="http://calendarserver.org/ns/">
                  <d:prop>
                    <d:displayname />
                    <d:resourcetype />
                  </d:prop>
                </d:propfind>`
        });

        if(!res.data){
            return NextResponse.json({message:"Failed to fetch apple calendars"}, {status: 400})
        }

        const data = parseCalDavResponse(res.data);

        const calendars = data.filter((entry: AppleCalDAVEntry) => {
            if (Array.isArray(entry.propstat)) return false;

            return !!entry.propstat?.prop?.resourcetype?.calendar;
        }).map((entry:AppleCalendarEntry) => ({
            id: entry.href._text.split("/").filter(Boolean).pop()!,
                name: entry.propstat.prop.displayname._text,
                description: "",
                timeZone: null,
                primary: false,
                accessRole: "owner",
                selected: false,
        }))

        return NextResponse.json({message:"Successfully fetched calendars", data: calendars}, {status: 200});
    }
    catch(error){
        console.log(error);
        return NextResponse.json({message:"Something went wrong"}, {status: 500});
    }
}