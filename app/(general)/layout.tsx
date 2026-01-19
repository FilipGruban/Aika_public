import Navbar from "@/components/layout/Navbar/Navbar";

export default function Layout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar/>
            <main className={"pt-24"}>
                {children}
            </main>
        </>
    );
}