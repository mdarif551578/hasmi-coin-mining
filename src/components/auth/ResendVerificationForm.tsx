
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
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function ResendVerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      // Temporarily sign the user in to get the user object
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      if (user.emailVerified) {
        setError("This email address has already been verified. Please sign in.");
        setIsLoading(false);
        await auth.signOut();
        return;
      }

      // Resend the verification email
      await sendEmailVerification(user);
      
      // Sign the user out immediately after sending the email
      await auth.signOut();

      setIsSubmitted(true);
    } catch (err: any) {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
            setError("Invalid credentials. Please check your email and password.");
        } else if (err.code === 'auth/too-many-requests') {
            setError("Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.");
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
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
                    A new verification link has been sent to <span className="font-bold">{form.getValues("email")}</span>.
                    Please check your inbox and spam folder!
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
        <CardDescription>Enter your email and password to receive a new verification link.</CardDescription>
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
             <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute inset-y-0 right-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            
            <Button type="submit" className="w-full h-10" disabled={isLoading}>{isLoading ? "Sending..." : "Send Verification Link"}</Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <Button asChild variant="link" size="sm" className="px-1" disabled={isLoading}>
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

