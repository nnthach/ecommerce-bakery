import { supabaseBrowser } from "./supabase";

export const handleLoginGoogle = async () => {
  const { data, error } = await supabaseBrowser.auth.signInWithOAuth({
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

  console.log("google login data", data);

  if (error) console.error(error);
};
