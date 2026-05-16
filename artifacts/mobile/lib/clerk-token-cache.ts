import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

export const clerkTokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
      return null;
    }
  },
  async saveToken(key, value) {
    await SecureStore.setItemAsync(key, value);
  },
};
