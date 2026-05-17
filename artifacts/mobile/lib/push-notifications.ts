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

// Identifier prefix used so we can cancel/replace previously scheduled day-before reminders
// without clobbering unrelated notifications.
const EVENT_REMINDER_ID_PREFIX = "mosaicbeats-event-reminder-";

function reminderIdFor(eventDate: string): string {
  return `${EVENT_REMINDER_ID_PREFIX}${eventDate}`;
}

/**
 * Schedules a "Don't forget to send your DJ the link" reminder for noon local time
 * the day before the supplied event date. Cancels any previously scheduled reminder
 * first so this is safe to call repeatedly (e.g. when the user edits the date).
 *
 * Returns:
 *  - "scheduled"   notification queued
 *  - "skipped"     event date is in the past or fires within the next hour
 *  - "permission_denied"
 *  - "unsupported" running on web or no native scheduling available
 */
export async function scheduleEventDayBeforeReminder(
  eventDateIso: string,
  options?: { eventLabel?: string; setCount?: number },
): Promise<"scheduled" | "skipped" | "permission_denied" | "unsupported"> {
  if (Platform.OS === "web") return "unsupported";

  const eventDate = new Date(eventDateIso);
  if (Number.isNaN(eventDate.getTime())) return "skipped";

  // Fire 12:00 local time the day before the event.
  const trigger = new Date(eventDate);
  trigger.setDate(trigger.getDate() - 1);
  trigger.setHours(12, 0, 0, 0);

  // Skip if trigger is already in the past or so close it's basically useless.
  if (trigger.getTime() - Date.now() < 60 * 60 * 1000) return "skipped";

  // Cancel any previous reminders we scheduled for any date — there should only be one active.
  await cancelAllEventReminders();

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return "permission_denied";

  const eventLabel = options?.eventLabel?.trim() || "your event";
  const setHint = options?.setCount && options.setCount > 0
    ? ` ${options.setCount} set${options.setCount === 1 ? "" : "s"} ready to share.`
    : "";

  await Notifications.scheduleNotificationAsync({
    identifier: reminderIdFor(eventDateIso),
    content: {
      title: "Send your DJ the link",
      body: `${eventLabel} is tomorrow.${setHint} Tap to open Mosaic Beats and share the playlist.`,
      sound: true,
      data: { type: "event-reminder", eventDate: eventDateIso },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
  return "scheduled";
}

export async function cancelAllEventReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.identifier?.startsWith(EVENT_REMINDER_ID_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (err) {
    console.warn("Failed to cancel event reminders:", err);
  }
}
