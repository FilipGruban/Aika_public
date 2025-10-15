import {getAccount} from "@/lib/user"
import {getCurrentUser} from "@/lib/authUser"
import {redirect, RedirectType} from "next/navigation";
import AppleForm from "@/components/AppleForm";


async function Page() {
    const user = await getCurrentUser()
    if(!user) {
        return null;
    }
    const connectedAccount = await getAccount(user.id, "apple")

    if(connectedAccount) {
        redirect('/dashboard/settings/providers?error=Apple+account+already+connected', RedirectType.replace)
    }

    return (
        <AppleForm/>
    );
}

export default Page;