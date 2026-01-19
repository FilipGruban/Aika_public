import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Calendar } from "@prisma/client";
import {ProviderCalendarResponse} from "@/types/calendar";
import {RRule, rrulestr} from "rrule";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
    const [first, last] = name.trim().split(" ");
    return (first[0] + last[0]).toUpperCase();
}

export function buildQueryString(params?: Record<string, string | number | boolean | undefined | null>): string {
    if (!params) return '';

    const entries = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)]);

    return entries.length > 0 ? '?' + new URLSearchParams(entries).toString() : '';
}

export function toProviderCalendarResponse(calendar: Calendar): ProviderCalendarResponse {
    return {
        providerCalendarId: calendar.providerCalendarId,
        name: calendar.name,
        timeZone: calendar.timeZone ?? undefined,
        accessRole: calendar.accessRole,
        used: true,
        provider: calendar.provider,
    };
}

export function convertMicrosoftRecurrenceToRRule(
    recurrence: any,
    startDate: Date
): string | null {
    if (!recurrence || !recurrence.pattern) {
        return null;
    }

    try {
        const { pattern, range } = recurrence;

        const parts: string[] = [];

        const freqMap: Record<string, string> = {
            'daily': 'DAILY',
            'weekly': 'WEEKLY',
            'absoluteMonthly': 'MONTHLY',
            'relativeMonthly': 'MONTHLY',
            'absoluteYearly': 'YEARLY',
            'relativeYearly': 'YEARLY',
        };
        parts.push(`FREQ=${freqMap[pattern.type]}`);

        if (pattern.interval && pattern.interval > 1) {
            parts.push(`INTERVAL=${pattern.interval}`);
        }

        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
            const dayMap: Record<string, string> = {
                'sunday': 'SU',
                'monday': 'MO',
                'tuesday': 'TU',
                'wednesday': 'WE',
                'thursday': 'TH',
                'friday': 'FR',
                'saturday': 'SA',
            };
            const days = pattern.daysOfWeek.map((day: string) => dayMap[day]);
            parts.push(`BYDAY=${days.join(',')}`);
        }

        if (pattern.dayOfMonth) {
            parts.push(`BYMONTHDAY=${pattern.dayOfMonth}`);
        }

        if (pattern.month) {
            parts.push(`BYMONTH=${pattern.month}`);
        }

        if (pattern.index && (pattern.type === 'relativeMonthly' || pattern.type === 'relativeYearly')) {
            const posMap: Record<string, number> = {
                'first': 1,
                'second': 2,
                'third': 3,
                'fourth': 4,
                'last': -1,
            };
            parts.push(`BYSETPOS=${posMap[pattern.index]}`);
        }

        if (range.type === 'numbered' && range.numberOfOccurrences) {
            parts.push(`COUNT=${range.numberOfOccurrences}`);
        } else if (range.type === 'endDate' && range.endDate) {
            const until = new Date(range.endDate + 'T23:59:59Z')
                .toISOString()
                .replace(/[-:]/g, '')
                .replace(/\.\d{3}/, '');
            parts.push(`UNTIL=${until}`);
        }

        const rruleString = `RRULE:${parts.join(';')}`;

        try {
            rrulestr(rruleString);
        } catch (validationError) {
            console.error('Generated invalid RRULE:', rruleString, validationError);
            return null;
        }

        return rruleString;

    } catch (error) {
        console.error('Failed to convert Microsoft recurrence to RRULE:', error);
        return null;
    }
}

export function convertRRuleToMicrosoftRecurrence(rruleString: string | null, startDate: Date): any {
    if (!rruleString) return undefined;

    try {
        const rule = rrulestr(rruleString, { dtstart: startDate });
        const options = rule.options;

        const pattern: any = {
            interval: options.interval || 1,
        };

        const freqMap: Record<number, string> = {
            [RRule.DAILY]: 'daily',
            [RRule.WEEKLY]: 'weekly',
            [RRule.MONTHLY]: 'absoluteMonthly',
            [RRule.YEARLY]: 'absoluteYearly',
        };
        pattern.type = freqMap[options.freq];

        if (options.byweekday && options.byweekday.length > 0) {
            const dayMap: Record<number, string> = {
                [RRule.SU.weekday]: 'sunday',
                [RRule.MO.weekday]: 'monday',
                [RRule.TU.weekday]: 'tuesday',
                [RRule.WE.weekday]: 'wednesday',
                [RRule.TH.weekday]: 'thursday',
                [RRule.FR.weekday]: 'friday',
                [RRule.SA.weekday]: 'saturday',
            };
            pattern.daysOfWeek = options.byweekday.map((wd: any) =>
                dayMap[typeof wd === 'number' ? wd : wd.weekday]
            );
        }

        if (options.bymonthday && options.bymonthday.length > 0) {
            pattern.dayOfMonth = options.bymonthday[0];
        }

        if (options.freq === RRule.YEARLY) {
            if (options.bymonth && options.bymonth.length > 0) {
                pattern.month = options.bymonth[0];
            }

            if (!pattern.dayOfMonth) {
                pattern.dayOfMonth = startDate.getDate();
            }
        } else if (options.bymonth && options.bymonth.length > 0) {
            pattern.month = options.bymonth[0];
        }

        if (options.bysetpos && options.bysetpos.length > 0) {
            const posMap: Record<number, string> = {
                1: 'first',
                2: 'second',
                3: 'third',
                4: 'fourth',
                [-1]: 'last',
            };
            pattern.index = posMap[options.bysetpos[0]];
            if (options.freq === RRule.MONTHLY) {
                pattern.type = 'relativeMonthly';
            } else if (options.freq === RRule.YEARLY) {
                pattern.type = 'relativeYearly';
            }
        }

        const range: any = {
            startDate: startDate.toISOString().split('T')[0],
        };

        if (options.count) {
            range.type = 'numbered';
            range.numberOfOccurrences = options.count;
        } else if (options.until) {
            range.type = 'endDate';
            range.endDate = options.until.toISOString().split('T')[0];
        } else {
            range.type = 'noEnd';
        }

        return { pattern, range };
    } catch (error) {
        console.error('Failed to convert RRULE to Microsoft format:', error);
        return undefined;
    }
}

export function convertGoogleRecurrenceToRRule(recurrence: string[] | undefined): string | null {
    if (!recurrence || recurrence.length === 0) {
        return null;
    }

    try {
        const rruleString = recurrence[0];

        const rule = rrulestr(rruleString);

        return rule.toString();
    } catch (error) {
        console.error('Failed to parse Google RRULE:', error);
        return null;
    }
}

export
function convertAppleRecurrenceToRRule(vevent: any): string | null {
    try {
        const rrule = vevent.getFirstPropertyValue('rrule');
        if (!rrule) return null;

        const rruleString = `RRULE:${rrule.toString()}`;

        const rule = rrulestr(rruleString);

        return rule.toString();
    } catch (error) {
        console.error('Failed to parse Apple RRULE:', error);
        return null;
    }
}