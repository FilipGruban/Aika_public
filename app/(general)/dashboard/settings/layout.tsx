import SettingsMenu from "@/components/SettingsMenu";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account, integrations, and preferences.",
};

export default function Layout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="pt-32 px-4 w-full max-w-6xl mx-auto flex flex-col gap-8 sm:flex-row">
            <SettingsMenu />
            {children}
        </div>
    );
}