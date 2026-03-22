import { NextResponse } from "next/server";
import {getCurrentUser} from "@/lib/authUser";
import {stripe} from "@/lib/stripe";

export async function POST() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (user.premium) {
            return NextResponse.json({ message: 'Already premium' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Aika Premium',
                            description: 'Lifetime access to unlimited calendar groups and 15-minute sync',
                        },
                        unit_amount: 900,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium/buy-premium?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/premium/buy-premium`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({message:"Successfully created payment", url:session.url}, {status:200});
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json({ message: 'Failed to create checkout session' }, { status: 500 });
    }
}