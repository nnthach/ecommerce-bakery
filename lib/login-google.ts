import { supabaseBrowser } from "./supabase";

export const handleLoginGoogle = async () => {
  const { error } = await supabaseBrowser.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      skipBrowserRedirect: false,
    },
  });

  if (error) console.error(error);
};
