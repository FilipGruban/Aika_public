import {scheduleCalendarSync} from '@/lib/sync';

async function test() {
    await scheduleCalendarSync('groupid', 'userid');
    console.log('Done!');
}

test();