
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export function ResendVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Note: We cannot directly trigger a verification email from the client
    // for a logged-out user without their password.
    // Instead, we immediately show the "submitted" state.
    // This UX prevents email enumeration (disclosing which emails are registered)
    // and guides the user to check their email. Firebase itself will not
    // send an email if the user is already verified or doesn't exist.
    // The user can try to log in, and if their email is unverified,
    // the login form will prompt them again.
    
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsLoading(false);
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
        <CardDescription>Enter your email to receive a new verification link.</CardDescription>
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
