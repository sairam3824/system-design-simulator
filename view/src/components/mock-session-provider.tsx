"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Mock Session Data
const MOCK_SESSION = {
    user: {
        name: "Sai Ram Maruri",
        email: "sairammaruri@gmail.com",
        image: "https://github.com/shadcn.png",
    },
    expires: "9999-12-31T23:59:59.999Z",
};

type Session = typeof MOCK_SESSION | null;

interface SessionContextType {
    data: Session;
    status: "authenticated" | "loading" | "unauthenticated";
    update: () => Promise<Session>;
}

const SessionContext = createContext<SessionContextType>({
    data: null,
    status: "unauthenticated",
    update: async () => null,
});

export const useSession = () => useContext(SessionContext);

export const signIn = async (provider?: string, options?: any) => {
    // Validate credentials for demo
    if (provider === "credentials") {
        const { email, password } = options || {};
        if (email !== "demo@gmail.com" || password !== "demo@123") {
            return { error: "Invalid credentials", ok: false, status: 401, url: null };
        }
    }

    // Set cookie for server-side checks
    document.cookie = "view-mode-auth=true; path=/";

    // If redirect is requested (default true)
    if (options?.redirect !== false) {
        window.location.href = options?.callbackUrl || "/dashboard";
    }
    return { error: null, ok: true, status: 200, url: "/dashboard" };
};

export const signOut = async (options?: any) => {
    document.cookie = "view-mode-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    if (options?.callbackUrl) {
        window.location.href = options.callbackUrl;
    } else {
        window.location.reload();
    }
    return;
};

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session>(null);
    const [status, setStatus] = useState<"authenticated" | "loading" | "unauthenticated">("loading");

    useEffect(() => {
        // Check for cookie
        const hasAuth = document.cookie.split("; ").find((row) => row.startsWith("view-mode-auth="));
        if (hasAuth) {
            setSession(MOCK_SESSION);
            setStatus("authenticated");
        } else {
            setSession(null);
            setStatus("unauthenticated");
        }
    }, []);

    return (
        <SessionContext.Provider value={{ data: session, status, update: async () => session }}>
            {children}
        </SessionContext.Provider>
    );
}
