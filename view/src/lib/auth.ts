
import { type NextRequest } from "next/server";

export const auth = async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const hasAuth = cookieStore.has("view-mode-auth");

  if (hasAuth) {
    return {
      user: {
        id: "user-1",
        name: "Sai Ram Maruri",
        email: "sairammaruri@gmail.com",
        image: "https://github.com/shadcn.png",
      },
    };
  }
  return null;
};

export const signIn = async () => {
  return true;
};

export const signOut = async () => {
  return true;
};

export const handlers = {
  GET: (req: NextRequest) => new Response("OK"),
  POST: (req: NextRequest) => new Response("OK"),
};
