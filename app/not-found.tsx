import React from 'react';
import {FileQuestion} from "lucide-react";
import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileQuestion className="w-10 h-10 text-muted-foreground" />
                </div>

                <h1 className="text-4xl font-bold mb-2">404</h1>
                <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
                <p className="text-muted-foreground mb-6">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <Link href="/dashboard">
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        </div>
    );
}

