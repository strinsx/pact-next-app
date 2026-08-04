"use client";

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeDataChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitDataChanged() {
  listeners.forEach((listener) => listener());
}
