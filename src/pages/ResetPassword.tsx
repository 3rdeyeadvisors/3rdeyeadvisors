import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { user, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenVerified, setTokenVerified] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      
      if (!tokenHash || type !== 'recovery') {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Just verify we have the required parameters - we'll verify the actual token when they submit
      setIsValidToken(true);
      setTokenVerified(true);
      toast({
        title: "Ready to Reset Password",
        description: "Please enter your new password below.",
      });
    };

    verifyToken();
  }, [searchParams, navigate, toast]);

  // CRITICAL: Prevent any redirects when user is in password reset flow
  // This overrides any other authentication redirects
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    
    // If we have reset parameters, NEVER redirect away from this page
    if (tokenHash && type === 'recovery') {
      return; // Don't redirect anywhere
    }
    
    // Only redirect to dashboard if user is authenticated AND not in a password reset flow
    if (user && !tokenVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate, tokenVerified, searchParams]);

  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast({
        title: "Password Requirements Not Met",
        description: validation.errors.join(". "),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (!tokenHash || type !== 'recovery') {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Use verifyOtp to verify the token and set the new password
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery'
      });

      if (error) {
        toast({
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        toast({
          title: "Error Updating Password",
          description: updateError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated Successfully!",
          description: "Your password has been changed. Please sign in with your new password.",
        });
        
        // Sign out to ensure they need to login again with new password
        await supabase.auth.signOut();
        
        // Redirect to sign in
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken && !tokenVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Verifying reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md border-primary/20 shadow-cosmic">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-violet-400" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-violet-400">
              Reset Your Password
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a new secure password for your 3rdeyeadvisors account
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-foreground font-medium">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10 border-primary/20 focus:border-primary/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password" className="text-foreground font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10 border-primary/20 focus:border-primary/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-muted/50 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Password Requirements:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className={newPassword.length >= 8 ? "text-primary" : ""}>
                  • At least 8 characters long
                </li>
                <li className={/[A-Z]/.test(newPassword) ? "text-primary" : ""}>
                  • One uppercase letter
                </li>
                <li className={/[a-z]/.test(newPassword) ? "text-primary" : ""}>
                  • One lowercase letter
                </li>
                <li className={/[0-9]/.test(newPassword) ? "text-primary" : ""}>
                  • One number
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !newPassword || !confirmNewPassword} 
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>

          <div className="text-center">
            <Button 
              variant="ghost" 
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={() => navigate('/auth')}
            >
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;