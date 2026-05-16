import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";

export type PushToken = string;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<PushToken | null> {
  if (Platform.OS === "web") return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission denied");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      // In development without EAS, skip token fetch
      const localToken = await Notifications.getExpoPushTokenAsync({ projectId: "mosaic-beats-dev" }).catch(() => null);
      return localToken?.data ?? null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (err) {
    console.warn("Push registration error:", err);
    return null;
  }
}

export async function sendTokenToServer(
  clientId: string,
  token: string,
  apiBaseUrl: string,
): Promise<void> {
  try {
    await fetch(`${apiBaseUrl}/api/push/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        token,
        platform: Platform.OS,
      }),
    });
  } catch (err) {
    console.warn("Failed to register push token:", err);
  }
}

export function addNotificationListener(
  onNotification: (notification: Notifications.Notification) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(onNotification);
}

export function addResponseListener(
  onResponse: (response: Notifications.NotificationResponse) => void,
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
}
