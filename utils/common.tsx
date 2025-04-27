import { supabase } from "@/utils/supabase";

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
