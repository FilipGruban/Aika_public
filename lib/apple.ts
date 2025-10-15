import axios from "axios";
import {xml2js, xml2json} from "xml-js";

export async function getApplePrincipalUrl(username: string, appPassword: string): Promise<string> {
    const authHeader = "Basic " + Buffer.from(`${username}:${appPassword}`).toString("base64");

    const res = await axios.request({
        method: "PROPFIND",
        url: "https://caldav.icloud.com/.well-known/caldav",
        headers: {
            "Content-Type": "application/xml",
            "Depth": "0",
            Authorization: authHeader,
        },
    });

    const stringRes = xml2json(res.data, { compact: true });
    const jsonRes = JSON.parse(stringRes);

    const principalUrl = jsonRes?.multistatus?.response?.href?._text;
    if (!principalUrl) throw new Error("Failed to extract Apple principal URL");
    const userId = extractAppleUserIdFromPath(principalUrl);
    if(!userId) throw new Error("Failed to extract Apple principal");
    return userId ;
}

export function extractAppleUserIdFromPath(path: string): string | null {
    const match = path.match(/^\/(\d{5,})\//);
    return match ? match[1] : null;
}

export function parseCalDavResponse(xml: string) {
    try {
        const parsed = xml2js(xml, { compact: true }) as any;
        return parsed.multistatus.response ?? [];
    } catch (e) {
        console.error("Failed to parse CalDAV response:", e);
        return [];
    }
}