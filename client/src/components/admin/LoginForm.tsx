import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebaseConfig'; // Import Firebase auth instance
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Import Google provider and popup function

// Removed Form related imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// Removed Eye, EyeOff, Lock imports
// Import an icon for the Google button if desired, e.g., from react-icons
// import { FcGoogle } from "react-icons/fc";

// Removed login schema and form types
// Keep props interface simple for now, can remove if onLoginSuccess is truly unused
interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ /* onLoginSuccess - likely unused */ }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false); // State for Google Sign-In loading
  const { toast } = useToast();
  
  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential?.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log("Google Sign-In Success:", user);
      toast({
        title: 'Login successful',
        description: `Welcome, ${user.displayName || user.email}!`,
      });
      // No need to call onLoginSuccess, global listener handles it
    } catch (error: any) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData?.email;
      // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Google Sign-In Error:", errorCode, errorMessage);
      toast({
        title: 'Google Sign-In Failed',
        description: errorMessage || 'An error occurred during sign-in.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in using your Google account to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
           <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {/* Optional: Add Google Icon */}
                {/* <FcGoogle className="mr-2 h-5 w-5" /> */}
                Sign in with Google
              </span>
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          This is a protected area for administrators only
        </CardFooter>
      </Card>
    </div>
  );
}