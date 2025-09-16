

export default function Layout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="relative min-h-screen w-full flex items-center justify-center bg-transparent text-foreground">
            <div
                className="absolute inset-0 pointer-events-none
                [background-image:radial-gradient(oklch(0.85_0_0)_1px,transparent_1px)]
                [background-size:12px_12px]
                [background-position:center]"
            />
            <div
                className="absolute inset-0 pointer-events-none
                [background-image:radial-gradient(circle_at_center,transparent_30%,oklch(0.98_0_0)_100%)]"
            />
            {children}
            </div>
        </>
    );
}
