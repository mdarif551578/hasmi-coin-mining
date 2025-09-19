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
import { signInWithGoogle } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type Step = "email" | "password" | "google_auth" | "not_found";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.242,44,30.038,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>("email");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function checkAccountType(email: string): Promise<Step> {
    try {
      // This is the most reliable way to check. Trying a bad password will either throw 'auth/wrong-password'
      // (confirming a password account) or 'auth/user-not-found' (confirming no password account).
      // Any other error means it's likely a social-only account.
      await signInWithEmailAndPassword(auth, email, "intentionally-wrong-password-for-detection");
      // This line should never be reached.
      return "password";
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/too-many-requests') {
        return "password"; // Definitely a password account.
      } else if (error.code === 'auth/user-not-found') {
        return "not_found"; // Definitely no account with this email.
      } else {
        // Any other error, like 'auth/invalid-credential' (which is now only triggered for social-only accounts
        // since 'user-not-found' is caught first), implies a social provider.
        return "google_auth";
      }
    }
  }

  async function handleContinue() {
    setIsLoading(true);
    const email = form.getValues("email");
    const emailState = await form.trigger("email");
    if (!emailState) {
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Checking account type for email: ${email}`);
      const accountType = await checkAccountType(email);
      console.log(`Detected account type: ${accountType}`);
      setStep(accountType);
    } catch (error) {
      console.error("Error checking account type:", error);
      toast({
        title: "Error",
        description: "Could not verify email. Please try again or use 'Sign in with Google'.",
        variant: "destructive"
      });
      setStep("not_found");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (step !== 'password') return;

    setIsLoading(true);
    const { email, password } = values;
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Sign-in error:", error);
      
      if (error.code === 'auth/wrong-password') {
        toast({
          title: "Incorrect password",
          description: "The password you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/too-many-requests') {
        toast({
          title: "Too many attempts",
          description: "Too many failed login attempts. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result && !result.error) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Google Sign-In Failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const isAnyLoading = isLoading || isGoogleLoading;

  const resetForm = () => {
    form.reset();
    setStep('email');
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>Enter your credentials to access your account.</CardDescription>
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
                    <Input 
                      placeholder="you@example.com" 
                      {...field} 
                      disabled={isAnyLoading || step !== 'email'} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleContinue();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {step === "password" && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please enter your password to continue.</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          disabled={isAnyLoading}
                          autoFocus
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
                    <div className="text-right">
                      <Button asChild variant="link" size="sm" className="px-0 h-auto" disabled={isAnyLoading}>
                        <Link href="/reset-password">Forgot password?</Link>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {step === 'email' && (
              <Button type="button" onClick={handleContinue} className="w-full h-10" disabled={isAnyLoading}>
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
            )}

            {step === 'password' && (
              <Button type="submit" className="w-full h-10" disabled={isAnyLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            )}
            
            {step === 'google_auth' && (
              <div className="p-4 text-center bg-muted/50 rounded-lg">
                <p className="text-sm font-semibold">This email is linked to a Google account.</p>
                <p className="text-sm text-muted-foreground">Please use the 'Sign in with Google' button below to proceed.</p>
              </div>
            )}
            {step === 'not_found' && (
              <div className="p-3 text-center bg-destructive/10 text-destructive-foreground rounded-lg">
                <p className="text-sm font-semibold">No account found with this email.</p>
                <Button asChild variant="link" size="sm" className="px-1 text-destructive-foreground underline h-auto" disabled={isAnyLoading}>
                  <Link href="/signup">Would you like to sign up?</Link>
                </Button>
              </div>
            )}
            
          </form>
        </Form>

        {(step !== 'email') && (
          <Button variant="link" size="sm" className="px-0 mt-2" onClick={resetForm} disabled={isAnyLoading}>
            Use another email
          </Button>
        )}
        
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
                Sign in with Google
              </>
            )}
          </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          Don't have an account?{" "}
          <Button asChild variant="link" size="sm" className="px-1" disabled={isAnyLoading}>
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
