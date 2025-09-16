import React from 'react';
import Image from "next/image";
import Link from "next/link";

function Logo() {
    return (
        <Link href={'/dashboard'}>
            <div className="flex items-center space-x-2">
                <div className="relative h-10 w-10">
                    <Image src="/icon.svg" alt="Aika logo" fill />
                </div>
                <span className="font-bold text-3xl select-none">Aika</span>
            </div>
        </Link>
    );
}

export default Logo;