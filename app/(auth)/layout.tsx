

export default function Layout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, oklch(0.91 0.005 195) 1px, transparent 1px),
                        linear-gradient(to bottom, oklch(0.91 0.005 195) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px'
                }}
            />
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle, oklch(0.52 0.14 195) 1.5px, transparent 1.5px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {children}
        </div>
    );
}
