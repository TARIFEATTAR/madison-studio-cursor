import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import maddiLogo from "@/assets/madison-auth-logo.png";
import { logger } from "@/lib/logger";

const Auth = () => {
  logger.debug("[Auth] Rendering Auth page...");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const hasNavigated = useRef(false);

  // -------------------------------------------
  // NEW REDIRECT LOGIC
  // -------------------------------------------
  const redirectAfterLogin = (user: User) => {
    const created = new Date(user.created_at).getTime();
    const signedIn = new Date(user.last_sign_in_at || 0).getTime();
    const isNewUser = created === signedIn;

    if (isNewUser) {
      navigate("/onboarding", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  // -------------------------------------------
  // AUTH STATE + CALLBACK HANDLING
  // -------------------------------------------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          redirectAfterLogin(session.user);
        } else {
          setUser(null);
        }
      }
    );

    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type");
    const code = params.get("code");
    const error_description = params.get("error_description");

    if (error_description) {
      toast({
        title: "Authentication error",
        description: decodeURIComponent(error_description),
        variant: "destructive",
      });
    }

    if (token_hash && type) {
      supabase.auth.verifyOtp({ token_hash, type: type as any }).then(({ error }) => {
        if (error) {
          toast({
            title: "Link invalid or expired",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Signed in", description: "Welcome back." });
        }
      });
    }
    else if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error, data }) => {
        if (error) {
          toast({
            title: "Authentication error",
            description: error.message,
            variant: "destructive",
          });
        } else if (data?.session?.user) {
          redirectAfterLogin(data.session.user);
        }
      });
    }
    else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          redirectAfterLogin(session.user);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  // -------------------------------------------
  // GOOGLE SIGN-IN — FIXED VERSION
  // -------------------------------------------
  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://app.madisonstudio.io/auth/v1/callback",
        },
      });

      if (error) {
        toast({
          title: "Google sign-in error",
          description: error.message || "Failed to initiate Google sign-in.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (err: any) {
      toast({
        title: "Google sign-in error",
        description: err.message || "Unexpected error.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // -------------------------------------------
  // SIGN UP / SIGN IN / MAGIC LINK / RESET PW
  // -------------------------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    setLoading(false);

    if (error) {
      toast({ title: "Sign up error", description: error.message, variant: "destructive" });
    } else if (data.user && !data.session) {
      // User created but session is null -> Email confirmation required
      setSignupSuccess(true);
      toast({
        title: "Check your email",
        description: "Please confirm your email address to continue.",
      });
    } else {
      // User created and session exists -> Auto-confirmed or no confirmation needed
      toast({
        title: "Welcome to Madison",
        description: "Your account has been created successfully.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast({
        title: "Sign in error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error sending reset email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent a reset link.",
      });
      setResetMode(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Magic link error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMagicLinkSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a magic link.",
      });
    }
  };

  if (user) return null;

  // -------------------------------------------
  // UI
  // -------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-enter">
          <img src={maddiLogo} alt="Madison" className="h-48 w-auto mx-auto mb-6" />
          <p className="text-muted-foreground text-lg">
            Where brands craft and multiply their narrative
          </p>
        </div>

        <div className="card-matte p-8 rounded-lg border border-border/40 fade-enter">
          <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mb-6 gap-2" disabled={loading}>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin">Begin</TabsTrigger>
              <TabsTrigger value="signup">Craft Account</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {resetMode ? (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full btn-craft" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setResetMode(false)}>
                    Back to Sign In
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>

                  <Button type="submit" className="w-full btn-craft" disabled={loading}>
                    {loading ? "Entering..." : "Begin"}
                  </Button>
                  <Button type="button" variant="link" className="w-full text-sm text-muted-foreground" onClick={() => setResetMode(true)}>
                    Forgot password?
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="magic">
              {magicLinkSent ? (
                <div className="space-y-4 text-center">
                  <p className="text-muted-foreground">Check your email for a magic link.</p>
                  <Button type="button" variant="outline" className="w-full" onClick={() => setMagicLinkSent(false)}>
                    Send Another Link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input id="magic-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full btn-craft" disabled={loading}>
                    {loading ? "Sending..." : "Send Magic Link"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              {signupSuccess ? (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-green-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Check your email</h3>
                  <p className="text-muted-foreground">
                    We've sent a confirmation link to <span className="font-medium text-foreground">{email}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please click the link to verify your account and get started.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setSignupSuccess(false)}
                  >
                    Back to Sign Up
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full btn-craft" disabled={loading}>
                    {loading ? "Crafting..." : "Craft Account"}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
