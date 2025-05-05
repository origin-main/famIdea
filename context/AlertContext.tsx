import { createContext, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import { savePushToken } from "@/utils/common";

const PERMISSIONS_REQUESTED_KEY = "permissionsRequested";

type AlertContextType = {
    totalBadgeCount: number;
    notificationCount: number;
    messageCount: number;
    markNotificationsAsSeen: () => Promise<void>;
    markMessagesAsRead: () => Promise<void>;
};

const AlertContext = createContext<AlertContextType>({
    totalBadgeCount: 0,
    notificationCount: 0,
    messageCount: 0,
    markNotificationsAsSeen: async () => {},
    markMessagesAsRead: async () => {},
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [notificationCount, setNotificationCount] = useState(0);
    const [messageCount, setMessageCount] = useState(0);

    const totalBadgeCount = notificationCount + messageCount;

    const havePermissionsBeenRequested = async () => {
        try {
            const value = await AsyncStorage.getItem(PERMISSIONS_REQUESTED_KEY);
            return value !== null;
        } catch {
            return false;
        }
    };

    const markPermissionsAsRequested = async () => {
        try {
            await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, "true");
        } catch {}
    };

    const requestPermissions = async () => {
        const alreadyRequested = await havePermissionsBeenRequested();
        if (!alreadyRequested) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === "granted") {
                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldPlaySound: false,
                        shouldSetBadge: false,
                    }),
                });
                await markPermissionsAsRequested();
            } else {
                console.log("Notification permission denied.");
            }
        }
    };

    const fetchNotificationCount = async () => {
        if (!user?.id) return;
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .eq("is_read", false);
        if (!error) setNotificationCount(count || 0);
    };

    const fetchMessageCount = async () => {
        if (!user?.id) return;
        const { count, error } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("receiver_id", user.id)
            .is("read_at", null);
        if (!error) setMessageCount(count || 0);
    };

    const markNotificationsAsSeen = async () => {
        if (!user?.id || notificationCount === 0) return;
        const { error } = await supabase.from("notifications").update({ is_read: true }).eq("receiver_id", user.id).eq("is_read", false);
        if (!error) setNotificationCount(0);
    };

    const markMessagesAsRead = async () => {
        if (!user?.id || messageCount === 0) return;
        const { error } = await supabase
            .from("messages")
            .update({ read_at: new Date().toISOString() })
            .eq("receiver_id", user.id)
            .is("read_at", null);
        if (!error) setMessageCount(0);
    };

    useEffect(() => {
        requestPermissions();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        fetchNotificationCount();
        fetchMessageCount();
        savePushToken(user.id);

        const notifChannel = supabase
            .channel("notifications-updates")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `receiver_id=eq.${user.id}`,
                },
                () => fetchNotificationCount()
            )
            .subscribe();

        const messageChannel = supabase
            .channel("messages-updates")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `receiver_id=eq.${user.id}`,
                },
                () => fetchMessageCount()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(notifChannel);
            supabase.removeChannel(messageChannel);
        };
    }, [user]);

    return (
        <AlertContext.Provider
            value={{
                totalBadgeCount,
                notificationCount,
                messageCount,
                markNotificationsAsSeen,
                markMessagesAsRead,
            }}
        >
            {children}
        </AlertContext.Provider>
    );
};
