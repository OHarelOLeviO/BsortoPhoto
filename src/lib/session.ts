import { useSyncExternalStore } from "react";

/**
 * Current-member session.
 *
 * The app intentionally has no password/OAuth login: a company member picks
 * their name from a predefined list, and the chosen member id is stored
 * locally on the device. This is an internal tool on a trusted network, so a
 * lightweight local session is the deliberate design (see project spec §2).
 */

const STORAGE_KEY = "hapluga.memberId";
const listeners = new Set<() => void>();

function getSnapshot(): string | null {
  return window.localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

/** Reactive current member id (null when nobody has picked a name). */
export function useMemberId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function signInAs(memberId: string) {
  window.localStorage.setItem(STORAGE_KEY, memberId);
  notify();
}

export function signOut() {
  window.localStorage.removeItem(STORAGE_KEY);
  notify();
}
