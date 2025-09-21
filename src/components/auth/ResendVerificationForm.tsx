
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export function ResendVerificationForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
        // This is a bit of a workaround as Firebase Admin SDK is not available client-side.
        // We can't directly check if a user exists and is unverified.
        // So we send the email, but it will only be delivered if the user exists.
        // We will show a generic success message to prevent email enumeration attacks.
        
        // This action can be called on any user, so we need a mock user object with the email.
        const mockUser = { email: values.email };
        
        // The sendEmailVerification function needs a user object.
        // It doesn't actually check if the user is signed in, just that the object has a sendEmailVerification method.
        // A dummy object is enough, but to be safe, we will create a more realistic mock.
        const dummyUser = {
            ...auth.currentUser,
            email: values.email,
            emailVerified: false,
            sendEmailVerification: () => sendEmailVerification(dummyUser as any)
        };
        
        // This will attempt to send a verification email.
        // Firebase handles the logic to not send if the user doesn't exist or is already verified.
        await sendEmailVerification(dummyUser as any);
        setIsSubmitted(true);

    } catch (error: any) {
        // We will still show success to prevent leaking info about which emails are registered
        console.error("Resend verification error:", error);
        setIsSubmitted(true);
    } finally {
        setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
        <Card className="rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl">Check your email</CardTitle>
                <CardDescription>
                    If an account exists for {form.getValues("email")}, a new verification link has been sent.
                    Don't forget to check your spam folder!
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="mt-6 text-center text-sm">
                    <Button asChild variant="link" size="sm" className="px-1">
                        <Link href="/login">Back to Sign In</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Resend Verification Email</CardTitle>
        <CardDescription>Enter your email and we'll send you a new verification link.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-10" disabled={isLoading}>{isLoading ? "Sending..." : "Send Verification Link"}</Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <Button asChild variant="link" size="sm" className="px-1">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
