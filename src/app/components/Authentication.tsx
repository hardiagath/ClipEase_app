'use client';

import { useState } from 'react';
import { useAuth, initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, KeyRound, Loader2 } from 'lucide-react';

export function Authentication() {
  const auth = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error: any) => {
    setIsLoading(false);
    let description = "An unexpected error occurred. Please try again.";
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      description = "Invalid email or password. Please check your credentials and try again.";
    } else if (error.code === 'auth/email-already-in-use') {
      description = "An account with this email already exists. Please sign in instead.";
    } else if (error.code === 'auth/weak-password') {
        description = "The password is too weak. Please use at least 6 characters.";
    }
    toast({
      variant: "destructive",
      title: 'Authentication Failed',
      description,
    });
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({ title: 'Signing in...', description: 'Please wait while we sign you in.' });
    try {
      await initiateEmailSignIn(auth, email, password);
      // Let the onAuthStateChanged listener handle success
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({ title: 'Creating account...', description: 'Please wait while we create your account.' });
    try {
      await initiateEmailSignUp(auth, email, password);
      // Let the onAuthStateChanged listener handle success
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    toast({ title: 'Signing in anonymously...', description: 'You can create an account later to save your data.' });
    try {
        await initiateAnonymousSignIn(auth);
    } catch (error) {
        handleError(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <div className="w-full max-w-md">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card>
              <form onSubmit={handleEmailSignIn}>
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                  <CardDescription>Enter your email below to sign in to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signin">Email</Label>
                    <Input id="email-signin" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signin">Password</Label>
                    <Input id="password-signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <KeyRound className="mr-2" />}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <form onSubmit={handleEmailSignUp}>
                <CardHeader>
                  <CardTitle className="text-2xl">Create an Account</CardTitle>
                  <CardDescription>Enter your email and a password to create your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <User className="mr-2" />}
                    Create Account
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">Or, continue without creating a permanent account:</p>
          <Button variant="link" onClick={handleAnonymousSignIn} disabled={isLoading}>
            Sign in Anonymously
          </Button>
        </div>
      </div>
    </div>
  );
}
