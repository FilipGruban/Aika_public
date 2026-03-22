import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {Check, ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {getCurrentUser} from "@/lib/authUser";
import BuyPremiumButton from "@/components/BuyPremiumButton";

export default async function BuyPremiumPage() {
    const user = await getCurrentUser();
    if (!user) return;

    if(user.premium) {
        return (
            <div className="min-h-screen p-8 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">You Already Have Premium!</h1>
                    <p className="text-muted-foreground mb-6">
                        You have lifetime access to all premium features.
                    </p>
                    <Link href="/dashboard">
                        <Button>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-2xl mx-auto">
            <div className="mb-8">
                <Link href="/dashboard/premium/about">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Premium
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Upgrade to Premium</h1>
                <p className="text-muted-foreground">One-time payment for lifetime access</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <div>
                                <h3 className="font-semibold text-lg">Aika Premium</h3>
                                <p className="text-sm text-muted-foreground">Lifetime access</p>
                            </div>
                            <span className="text-2xl font-bold">$9.00</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="font-medium">What's included:</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Unlimited calendar groups</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                <span>Sync every 15 minutes</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>$9.00</span>
                    </div>

                    <BuyPremiumButton />
                </CardContent>
            </Card>
        </div>
    );
}