import React from 'react';
import Logo from "@/components/layout/Navbar/Logo";
import User from "@/components/layout/Navbar/User";
import Navigation from "@/components/layout/Navbar/Navigation";
import UserMobile from "@/components/layout/Navbar/UserMobile";
import {getCurrentUser} from "@/lib/authUser";
import Notifications from "@/components/layout/Navbar/Notifications";

async function Navbar() {
    const user = await getCurrentUser()
    if (!user) {
        return;
    }

    return (
            <nav className="absolute top-0 left-0 w-full z-10 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Logo/>
                    <Navigation/>
                    <div className={"flex gap-6 items-center"}>
                        <Notifications/>
                        <User user={user} />
                        <UserMobile user={user}/>
                    </div>

                </div>
            </nav>
    )
}

export default Navbar;