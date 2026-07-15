// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { SessionUser } from "$lib/api/types";

declare global {
  namespace App {
    interface Locals {
      user: SessionUser | undefined;
      lang: string;
    }

    interface PageData {
      user: SessionUser | undefined;
      lang: string;
    }

    // interface Error {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
