import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

import { AppwriteException, ID } from "appwrite";
import { account } from "@/models/client/config";

export const useAuthStore = create(
  persist(
    immer((set, get) => ({
      session: null,
      jwt: null,
      user: null,
      hydrated: false,

      setHydrated() {
        set({ hydrated: true });
      },

      async verifySession() {
        try {
          const session = await account.getSession("current");
          const user = await account.get();
          set({ session, user, hydrated: true }); // Set hydrated here
        } catch (error) {
          console.log("verifySession error:", error);
          set({ session: null, user: null, hydrated: true }); // Still set hydrated on failure
        }
      },


      async login(email, password) {
        try {
          const session = await account.createEmailPasswordSession(email, password);
          const [user, { jwt }] = await Promise.all([
            account.get(),
            account.createJWT()
          ]);

          if (!user.prefs?.reputation) {
            await account.updatePrefs({
              reputation: 0
            });
          }

          set({ session, user, jwt });

          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async createAccount(name, email, password) {
        try {
          await account.create(ID.unique(), email, password, name);
          return { success: true };
        } catch (error) {
          console.log(error);
          return {
            success: false,
            error: error instanceof AppwriteException ? error : null,
          };
        }
      },

      async logout() {
        try {
          await account.deleteSessions();
          set({ session: null, jwt: null, user: null });
        } catch (error) {
          console.log(error);
        }
      },
    })),
    {
      name: "auth",
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.verifySession) {
          state.verifySession(); // This sets hydrated properly
        } else {
          state?.setHydrated(); // Fallback
        }
      }

    }
  )
);
