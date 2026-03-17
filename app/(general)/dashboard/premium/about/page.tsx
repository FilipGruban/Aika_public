// app/dashboard/premium/page.tsx
import { Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PremiumPage() {
    return (
        <div className="min-h-screen p-8 max-w-5xl mx-auto">
            <div className="mb-12 text-center">
                <Badge className="mb-4">Coming Soon</Badge>
                <h1 className="text-4xl font-bold tracking-tight mb-3">Aika Premium</h1>
                <p className="text-lg text-muted-foreground">
                    More features, better sync, complete control
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Free Plan */}
                <div className="bg-white border rounded-xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Free</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Perfect for personal use
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Up to 3 calendar groups</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Hourly sync</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm">Basic sync logs</span>
                        </li>
                    </ul>

                    <Button variant="outline" className="w-full" disabled>
                        Current Plan
                    </Button>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary rounded-xl p-8 relative">
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        Coming Soon
                    </Badge>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Premium</h2>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-4xl font-bold">$9</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            For power users and teams
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Unlimited calendar groups</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Sync every 5 minutes</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Advanced sync options</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Priority support</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium">Detailed analytics</span>
                        </li>
                    </ul>

                    <Button className="w-full" disabled>
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade to Premium
                    </Button>
                </div>
            </div>

            {/* Feature Comparison */}
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
                            <td className="text-center py-4 text-muted-foreground">3</td>
                            <td className="text-center py-4 font-semibold">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="py-4">Sync frequency</td>
                            <td className="text-center py-4 text-muted-foreground">Hourly</td>
                            <td className="text-center py-4 font-semibold">5 minutes</td>
                        </tr>
                        <tr>
                            <td className="py-4">Sync history</td>
                            <td className="text-center py-4 text-muted-foreground">7 days</td>
                            <td className="text-center py-4 font-semibold">Unlimited</td>
                        </tr>
                        <tr>
                            <td className="py-4">Support</td>
                            <td className="text-center py-4 text-muted-foreground">Email</td>
                            <td className="text-center py-4 font-semibold">Priority</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}