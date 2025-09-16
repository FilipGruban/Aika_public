import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
      <main className="min-h-screen text-foreground flex items-center justify-center">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-20 items-center">
              <div className="flex flex-col justify-center space-y-6 text-center md:text-left order-2 md:order-1">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                      Organize your schedule with Aika.
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0">
                      Sync all your calendars seamlessly, stay on top of your events, and manage your time effortlessly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
              <div className="flex items-center justify-center order-1 md:order-2">
                  <div className="relative h-40 w-40 lg:h-72 lg:w-72 md:h-60 md:w-60 flex items-center justify-center">
                      <Image src={"icon.svg"} alt={"logo"} fill={true} />
                  </div>
              </div>
          </div>
      </main>
  );
}
