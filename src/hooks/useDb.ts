import { useSyncExternalStore } from "react";
import { db, type DbState } from "@/mocks/db";

/** Reads a slice of the session store; re-renders when it changes. */
export function useDb<T>(selector: (state: DbState) => T): T {
  return useSyncExternalStore(
    db.subscribe,
    () => selector(db.get()),
    () => selector(db.getInitial()),
  );
}
