'use client';

import { SWRConfig } from 'swr';
import fetcher from '@/lib/fetcher';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: true,
                shouldRetryOnError: true,
                errorRetryInterval: 5000,
                revalidateOnMount: true,
            }}
        >
            {children}
        </SWRConfig>
    );
}