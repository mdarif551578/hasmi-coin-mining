
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
import { Separator } from "../ui/separator";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailInUse, setEmailInUse] = useState(false);

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
    setEmailInUse(false);
    const { name, email, password } = values;

    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
            setEmailInUse(true);
            setIsLoading(false);
            toast({
                title: "Email Already Registered",
                description: "This email is already in use. Please sign in instead.",
                variant: "destructive"
            });
            return;
        }
    } catch (error) {
        if ((error as any).code === 'auth/operation-not-allowed') {
            // This error can occur if Email Enumeration Protection is on.
            // We can't know for sure, so we proceed with the signup attempt
            // and let Firebase's backend rules handle it.
        } else {
            toast({
                title: "Error",
                description: "Could not verify email. Please try again.",
                variant: "destructive"
            });
            setIsLoading(false);
            return;
        }
    }

    const { error } = await signUp(name, email, password);

    if (error) {
        const firebaseError = error as any;
        if (firebaseError.code === 'auth/email-already-in-use') {
             setEmailInUse(true);
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
    } else {
      router.push('/dashboard');
    }
    setIsLoading(false);
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    await signInWithGoogle();
     // No need to handle error or success here, the AuthProvider will manage the state
  }

  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Create an Account</CardTitle>
        <CardDescription>Join the community and start mining today.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {emailInUse && (
              <div className="p-3 text-center bg-destructive/10 text-destructive-foreground rounded-lg">
                <p className="text-sm font-semibold">This email is already registered.</p>
                <Button asChild variant="link" size="sm" className="px-1 text-destructive-foreground underline h-auto" disabled={isAnyLoading}>
                  <Link href="/login">Would you like to sign in instead?</Link>
                </Button>
              </div>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isAnyLoading} />
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
                    <Input placeholder="you@example.com" {...field} disabled={isAnyLoading} onChange={(e) => {
                      field.onChange(e);
                      setEmailInUse(false);
                    }}/>
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
                        disabled={isAnyLoading}
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
            <Button type="submit" className="w-full h-10" disabled={isAnyLoading}>{isLoading ? 'Creating Account...' : 'Create Account'}</Button>
          </form>
        </Form>
         <div className="relative my-6">
            <Separator />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
        </div>
        <div className="space-y-3">
             <Button variant="outline" className="w-full h-10" onClick={handleGoogleSignIn} disabled={isAnyLoading}>
                {isGoogleLoading ? 'Redirecting...' : (
                    <>
                        <GoogleIcon className="mr-2" />
                        Sign up with Google
                    </>
                )}
            </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <Button asChild variant="link" size="sm" className="px-1" disabled={isAnyLoading}>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

    
