import { supabase } from "@/utils/supabase";
import * as Notifications from "expo-notifications";

export const formatDateToYMD = (date: Date | undefined) => {
    if (!date) return undefined;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
