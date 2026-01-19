import Image from "next/image";
import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen text-foreground flex items-center justify-center">
            <div className="max-w-6xl w-full flex flex-col-reverse md:flex-row gap-12 px-6 py-20 items-center">
                <div className="flex flex-col space-y-8 text-center lg:text-left ">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                            Organize your schedule with{" "}
                            <span className="text-primary">Aika</span>
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Sync all your calendars seamlessly. Stay on top of your events across Google, Apple, and Microsoft—all in one beautiful place.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link
                            href="/register"
                            className="rounded-md bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90"
                        >
                            Get Started
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-md border border-border px-6 py-3 font-medium hover:bg-muted"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <div className="relative h-40 w-40 lg:h-72 lg:w-72 md:h-60 md:w-60 flex items-center justify-center">
                        <Image src={"icon.svg"} alt={"logo"} fill={true} />
                    </div>
                </div>
            </div>
        </main>


    );
}
