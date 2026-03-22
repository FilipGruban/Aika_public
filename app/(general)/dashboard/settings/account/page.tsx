import React from 'react';
import AccountInformation from "@/components/AccountInformation";
import {getCurrentUser} from "@/lib/authUser";
import AccountChangePassword from "@/components/AccountChangePassword";

async function Page() {
    const user = await getCurrentUser();

    if (!user) return;

    return (
        <div className={'flex flex-col gap-4 w-full'}>
            <AccountInformation username={user.name} email={user.email} />
            <AccountChangePassword/>
        </div>
    );
}

export default Page;