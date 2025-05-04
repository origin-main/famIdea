import { supabase } from "@/utils/supabase";
import * as Notifications from "expo-notifications";
import { format } from "date-fns";

export const formatDateToYMD = (date: Date | undefined) => {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const getFormattedHours = (openingTime: string, closingTime: string, availableDays: string[]) => {
    const now = new Date();
    const todayAbbrev = format(now, "eee"); // e.g., 'Mon'

    const isAvailableToday = availableDays.includes(todayAbbrev);

    const [openHour, openMinute] = openingTime.split(":").map(Number);
    const [closeHour, closeMinute] = closingTime.split(":").map(Number);

    const openDate = new Date(now);
    openDate.setHours(openHour, openMinute, 0, 0);

    const closeDate = new Date(now);
    closeDate.setHours(closeHour, closeMinute, 0, 0);

    const isWithinHours = now >= openDate && now <= closeDate;

    const isOpen = isAvailableToday && isWithinHours;

    return {
        hours: `${format(openDate, "h:mm a")} - ${format(closeDate, "h:mm a")}`,
        isOpen,
        isAvailableToday,
    };
};

type DayKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const dayLabels: Record<DayKey, string> = {
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
};

export const getAvailabilityText = (availableDays: DayKey[] | undefined): string => {
    if (!availableDays || availableDays.length === 0) return "Closed";
    const allDays: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const weekdays: DayKey[] = ["mon", "tue", "wed", "thu", "fri"];
    const weekends: DayKey[] = ["sat", "sun"];

    const sortedDays = availableDays.sort((a, b) => allDays.indexOf(a) - allDays.indexOf(b));

    const unavailableDays = allDays.filter((d) => !availableDays.includes(d));

    const isEveryday = availableDays.length === 7;
    const isWeekdays = weekdays.every((d) => availableDays.includes(d)) && availableDays.length === 5;
    const isWeekends = weekends.every((d) => availableDays.includes(d)) && availableDays.length === 2;
    const isMWF = availableDays.length === 3 && ["mon", "wed", "fri"].every((d) => availableDays.includes(d as DayKey));
    const isTTH = availableDays.length === 2 && ["tue", "thu"].every((d) => availableDays.includes(d as DayKey));
    const isEverydayExceptOne = availableDays.length === 6 && unavailableDays.length === 1;

    if (isEveryday) return "Open everyday";
    if (isWeekdays) return "Open on weekdays";
    if (isWeekends) return "Open on weekends";
    if (isMWF) return "Open on Mon, Wed, Fri (MWF)";
    if (isTTH) return "Open on Tue, Thu (TTH)";
    if (isEverydayExceptOne) return `Open everyday except ${dayLabels[unavailableDays[0]]}`;

    // Default fallback: list days
    const labelList = sortedDays.map((d) => dayLabels[d]);
    return `Open on ${labelList.join(", ")}`;
};

// supabase functions
export const getProfilePicture = (path: string): string | null => {
    try {
        const { data } = supabase.storage.from("profile-pictures").getPublicUrl(path);

        // Bust the cache by appending a timestamp to the URL to force refresh
        const urlWithCacheBusting = `${data.publicUrl}?t=${Date.now()}`;
        return urlWithCacheBusting;
    } catch (error: any) {
        console.error("Error fetching image: ", error.message);
        return null;
    }
};

export const addNotification = async ({
    type,
    title,
    body,
    patient_id = null,
    birth_center_id = null,
    appointment_id = null,
}: {
    type: string;
    title: string;
    body: string;
    patient_id?: string | null;
    birth_center_id?: string | null;
    appointment_id?: string | null;
}) => {
    const { error } = await supabase.from("notifications").insert([
        {
            type,
            title,
            body,
            patient_id,
            birth_center_id,
            receiver_id: birth_center_id,
            appointment_id,
            is_read: false,
        },
    ]);

    if (error) {
        console.error("Failed to add notification:", error.message);
    }
};

const getExpoPushToken = async () => {
    const projectId = "8ab6d125-745e-4922-b7bc-e88d60c2ce97";

    try {
        const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
        return token;
    } catch (error) {
        console.error("Failed to get Expo push token:", error);
        return null;
    }
};

export const savePushToken = async (userId: string) => {
    const token = await getExpoPushToken();
    if (!token) return;

    const { error } = await supabase.from("tokens").upsert({ id: userId, token });

    if (error) {
        console.error("Failed to save push token:", error.message);
    } else {
        console.log("Push token saved to database.");
    }
};
