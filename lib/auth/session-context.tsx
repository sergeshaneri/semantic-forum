"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

type SessionUser = {
  id: string;
  username: string;
} | null;

const SessionContext = createContext<SessionUser>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionUser {
  return useContext(SessionContext);
}
