import config from "../config";
import { stripe } from "../lib/stripe";

export async function createPaymentSession(customerId: string, priceId: string, userId: string, product: string) {
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${config.frontendUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontendUrl}/payments/cancel`,

        metadata: {
            userId,
        },

        subscription_data: {
            metadata: {
                userId,
                plan: product,
            },
        },
        allow_promotion_codes: true,
        saved_payment_method_options: {
            payment_method_save: "enabled",
        },
    });

    return session;
} 