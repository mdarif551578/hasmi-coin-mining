
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
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { name, email, password } = values;
    setUserEmail(email);

    const { error } = await signUp(name, email, password);

    if (error) {
        const firebaseError = error as any;
        if (firebaseError.code === 'auth/email-already-in-use') {
             toast({
                title: "Email Already Registered",
                description: "This email is already in use. Please sign in instead.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "Signup Failed",
                description: firebaseError.message,
                variant: "destructive",
            });
        }
        setIsLoading(false);
    } else {
      setIsSubmitted(true);
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
     return (
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="items-center text-center">
            <MailCheck className="size-12 text-primary mb-2" />
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
                We've sent a verification link to <span className="font-bold text-foreground">{userEmail}</span>.
                Please check your inbox and spam folder.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-sm">
                <p className="text-muted-foreground mb-4">Click the link in the email to activate your account.</p>
                <Button asChild className="w-full">
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
        <CardTitle className="text-xl">Create an Account</CardTitle>
        <CardDescription>Join the community and start mining today.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isLoading} />
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
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-10" disabled={isLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Button asChild variant="link" size="sm" className="px-1" disabled={isLoading}>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
