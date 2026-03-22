import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {getCurrentUser} from "@/lib/authUser";

export default async function PremiumPage() {
    const user = await getCurrentUser();
    if (!user) return;

    if (user.premium) {
        return (
            <div className="min-h-screen p-8 max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">You're a Premium Member!</h1>
                    <p className="text-muted-foreground">
                        Enjoy unlimited calendar groups and faster sync
                    </p>
                </div>

                <div className="bg-white border rounded-xl p-8">
                    <h2 className="text-xl font-semibold mb-4">Your Premium Features</h2>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>Unlimited calendar groups</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span>Sync every 15 minutes</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight mb-3">Aika Premium</h1>
                <p className="text-lg text-muted-foreground">
                    Unlock unlimited sync power with lifetime access
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white border rounded-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Free</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold">$0</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Perfect for personal use
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">1 calendar group</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Sync every hour</span>
                        </li>
                    </ul>

                    <Button variant="outline" className="w-full" disabled>
                        Current Plan
                    </Button>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary rounded-xl p-8 relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Best Value
                    </Badge>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Premium</h2>
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-bold">$9</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">One-time payment</p>
                        <p className="text-sm text-muted-foreground">
                            Lifetime access to all features
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Unlimited calendar groups</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Sync every 15 minutes</span>
                        </li>
                    </ul>

                    <Link href="/dashboard/premium/buy-premium">
                        <Button className="w-full">
                            <Zap className="w-4 h-4 mr-2" />
                            Upgrade to Premium
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="bg-white border rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 font-semibold">Feature</th>
                            <th className="text-center py-3 font-semibold">Free</th>
                            <th className="text-center py-3 font-semibold">Premium</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y">
                        <tr>
                            <td className="py-4">Calendar groups</td>
                            <td className="text-center py-4 text-muted-foreground">1</td>
                            <td className="text-center py-4 font-semibold">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="py-4">Sync frequency</td>
                            <td className="text-center py-4 text-muted-foreground">Every hour</td>
                            <td className="text-center py-4 font-semibold">Every 15 minutes</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}