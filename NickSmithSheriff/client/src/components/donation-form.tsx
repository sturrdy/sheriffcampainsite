import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const VITE_STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51RUE0iQBABaPIPClIh2CjLUbl51z2Gub6GzHrgxwGClAMmHitC4gQyJcXf5IBKEd7X632mtYQ3s8HxkgbshPJacH00EQQq2rkY';

const stripePromise = loadStripe(VITE_STRIPE_PUBLIC_KEY);

const donationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least $1"),
  email: z.string().email("Valid email is required"),
});

type DonationFormData = z.infer<typeof donationSchema>;

const CheckoutForm = ({ amount, email }: { amount: number; email: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast({
        title: "Payment Successful",
        description: "Thank you for your donation to Nick Smith's campaign!",
      });
      // Reset form after successful payment
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-crimson hover:bg-red-700 text-white"
      >
        {isProcessing ? "Processing..." : `Donate $${amount}`}
      </Button>
    </form>
  );
};

export default function DonationForm() {
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 0,
      email: "",
    },
  });

  const predefinedAmounts = [25, 50, 100, 250];

  const selectAmount = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount);
  };

  const onSubmit = async (data: DonationFormData) => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: data.amount,
        email: data.email,
      });

      const result = await response.json();
      setClientSecret(result.clientSecret);
      setShowPayment(true);
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (showPayment && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <div className="space-y-4">
          <div className="text-center">
            <p className="font-semibold">Donating ${form.getValues("amount")}</p>
            <p className="text-sm text-gray-600">{form.getValues("email")}</p>
          </div>
          <CheckoutForm amount={form.getValues("amount")} email={form.getValues("email")} />
          <Button
            variant="outline"
            onClick={() => setShowPayment(false)}
            className="w-full"
          >
            Back to Amount Selection
          </Button>
        </div>
      </Elements>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {predefinedAmounts.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant={selectedAmount === amount ? "default" : "outline"}
              className={selectedAmount === amount ? "bg-crimson hover:bg-red-700 text-white" : ""}
              onClick={() => selectAmount(amount)}
            >
              ${amount}
            </Button>
          ))}
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Other amount"
                  {...field}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                    setSelectedAmount(null);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-crimson hover:bg-red-700 text-white"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Processing..." : "Continue to Payment"}
        </Button>
      </form>
    </Form>
  );
}