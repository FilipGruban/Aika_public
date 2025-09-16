import Navbar from "@/components/layout/Navbar/Navbar";

export default function Layout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar/>
            {children}
        </>
    );
}