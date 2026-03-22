"use client"
import React, {useState} from 'react';
import axiosInstance from "@/lib/axios";
import {toast} from "sonner";
import {Loader2, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

function BuyPremiumButton() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();


    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post('/stripe/checkout')

            if(res.data.url){
                router.push(res.data.url);
                return;
            }

            toast.error("Failed to create payment");
        }
        catch (error) {
            console.log(error);
            toast.error("Something went wrong");
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Button size="lg" className="w-full" onClick={handleCheckout} disabled={loading}>
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <Lock className="w-4 h-4 mr-2" />
                    Continue to Payment
                </>
            )}
        </Button>
    );
}

export default BuyPremiumButton;