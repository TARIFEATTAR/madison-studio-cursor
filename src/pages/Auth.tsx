import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        navigate("/");
      } else {
        setUser(null);
      }
    });

    // Handle auth callbacks in URL (magic link, recovery, OAuth PKCE)
    const params = new URLSearchParams(window.location.search);
    const token_hash = params.get("token_hash");
    const type = params.get("type") as "magiclink" | "recovery" | "signup" | "email_change" | null;
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
      supabase.auth.verifyOtp({ token_hash, type }).then(({ error }) => {
        if (error) {
          toast({
            title: "Link invalid or expired",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Signed in", description: "Welcome back." });
          navigate("/");
        }
      });
    } else if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          toast({
            title: "Authentication error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          navigate("/");
        }
      });
    } else {
      // THEN check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          navigate("/");
        }
      });
    }

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Sign up error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Scriptorium",
        description: "Your account has been created successfully.",
      });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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
        description: "We've sent you a password reset link.",
      });
      setResetMode(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error sending magic link",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMagicLinkSent(true);
      toast({
        title: "Check your email",
        description: "We've sent you a magic link to sign in.",
      });
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 fade-enter">
          <img 
            src="/logo-full.png" 
            alt="Scriptorium" 
            className="h-16 w-auto mx-auto mb-3"
          />
          <p className="text-muted-foreground text-lg">
            Where brands craft their narrative
          </p>
        </div>

        <div className="card-matte p-8 rounded-lg border border-border/40 fade-enter">
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
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-craft"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setResetMode(false)}
                  >
                    Back to Sign In
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-craft"
                    disabled={loading}
                  >
                    {loading ? "Entering..." : "Begin"}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm text-muted-foreground"
                    onClick={() => setResetMode(true)}
                  >
                    Forgot password?
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="magic">
              {magicLinkSent ? (
                <div className="space-y-4 text-center">
                  <p className="text-muted-foreground">
                    Check your email for a magic link to sign in.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setMagicLinkSent(false)}
                  >
                    Send Another Link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full btn-craft"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Magic Link"}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    We'll email you a link to sign in without a password.
                  </p>
                </form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50"
                    placeholder="your@email.com"
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
                    className="bg-background/50"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full btn-craft"
                  disabled={loading}
                >
                  {loading ? "Crafting..." : "Craft Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
