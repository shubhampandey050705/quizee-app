import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { AppwriteException, ID } from "appwrite";
import { account } from "@/models/client/config.js";

export const useAuthStore = create(
    persist(
        immer((set) => ({
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
                    set({ session });
                } catch (error) {
                    console.log(error);
                }
            },

            async login(name, email, password) {
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
                        error: error instanceof AppwriteException ? error : null
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
                        error: error instanceof AppwriteException ? error : null
                    };
                }
            },

            async logout() {
                try {
                    await account.deleteSession("current");
                    set({ session: null, user: null, jwt: null });
                } catch (error) {
                    console.log(error);
                }
            }
        })),
        {
            name: "auth",
            onRehydrateStorage() {
                return (state, error) => {
                    if (!error) state?.setHydrated();
                };
            }
        }
    )
);
