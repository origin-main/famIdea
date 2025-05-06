import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { useRouter } from "expo-router";
import { ActivityIndicator, Avatar, List } from "react-native-paper";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getPicture } from "@/utils/common";

type Child = {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    profilePictureUrl: string | null;
};

export default function Index() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // for child info list
    const [childList, setChildList] = useState<Child[]>([]);
    const [listExpanded, setListExpanded] = useState(false);

    const SETTINGS = [
        {
            name: "Child Information",
            icon: "information-variant",
            iconBgColor: "#f4be37",
            iconColor: "white",
            expanded: true,
            onPress: () => setListExpanded(!listExpanded),
        },
        {
            name: "Security & Privacy",
            icon: "lock",
            iconBgColor: "#e51116",
            iconColor: "white",
            onPress: () => router.push("/profile/security-info"),
        },
        {
            name: "FAQs",
            icon: "frequently-asked-questions",
            iconBgColor: "#dfdfdf",
            iconColor: "black",
            onPress: () => {},
        },
        {
            name: "Favorites",
            icon: "star",
            iconBgColor: "#825eff",
            iconColor: "white",
            onPress: () => router.push("/profile/favorites"),
        },
        {
            name: "Feedbacks",
            icon: "alert-circle",
            iconBgColor: "#2963d6",
            iconColor: "white",
            onPress: () => {},
        },
        {
            name: "Log out",
            icon: "logout",
            iconBgColor: "#e96ac4",
            iconColor: "white",
            onPress: () => handleLogout(),
        },
    ];

    useEffect(() => {
        if (!user?.id) return;

        fetchChildInfo();

        const channel = supabase
            .channel("chat-list")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "child_info",
                    filter: `parent_id=eq.${user.id}`,
                },
                fetchChildInfo
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    useEffect(() => {
        if (user?.profile?.profile_picture_url) {
            const url = getPicture(user?.profile?.profile_picture_url);
            setProfilePicture(url);
        } else {
            setProfilePicture(null);
        }
    }, [user?.profile]);

    const fetchChildInfo = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from("child_info")
            .select("id, first_name, middle_name, last_name, profile_picture_url")
            .eq("parent_id", user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching child info:", error);
            return [];
        }

        const children: Child[] = data.map((child: any) => ({
            id: child.id,
            firstName: child.first_name,
            middleName: child.middle_name,
            lastName: child.last_name,
            profilePictureUrl: getPicture(child.profile_picture_url),
        }));

        setChildList(children);
    };

    const handleAddNewChild = async () => {
        if (!user) return;

        const { data, error: childInfoError } = await supabase
            .from("child_info")
            .insert([
                {
                    parent_id: user.id,
                },
            ])
            .select("id");

        if (childInfoError) {
            alert("Error adding new child. Please try again.");
            return;
        }

        const childId = data[0].id;
        if (childId) {
            navigateToChildInfo(childId);
        }
    };

    const handleDeleteChild = async (child: Child) => {
        const displayName = child.firstName?.trim() ? child.firstName : "new child";
        Alert.alert(
            "Delete Child",
            `Are you sure you want to delete ${displayName}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const imagePath = child.profilePictureUrl?.split("/").pop()?.split("?")[0] || null;
                            if (imagePath) {
                                const { error: storageError } = await supabase.storage.from("profile-pictures").remove([imagePath]);

                                if (storageError) {
                                    throw new Error(`Storage delete failed: ${storageError.message}`);
                                }
                            }

                            const { error } = await supabase.from("child_info").delete().eq("id", child.id);

                            if (error) {
                                throw new Error(`Delete failed: ${error.message}`);
                            }

                            fetchChildInfo(); // Refresh list after deletion
                        } catch (err) {
                            console.error("Error deleting child:", err);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const navigateToChildInfo = (childId: string) => {
        router.push({
            pathname: "/profile/child-info",
            params: { id: childId },
        });
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);

            // Navigate to login
            router.replace("/login");
        } catch (err: any) {
            console.error("Error signing out:", err.message);
            alert("There was a problem signing out. Please try again.");
        }
        setLoading(false);
    };

    return loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={COLORS.lightBlue} />
    ) : (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.titleBar}>
                <Text style={styles.title}>Profile</Text>
            </View>

            {/* profile picture */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    paddingHorizontal: 30,
                    paddingTop: 20,
                }}
            >
                <View
                    style={{
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 2,
                    }}
                >
                    <Avatar.Image
                        size={90}
                        style={{ backgroundColor: "gray" }}
                        source={profilePicture ? { uri: profilePicture } : require("@/assets/images/user-default.png")}
                    />
                    {/* Name */}
                    <View
                        style={{
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Text style={styles.title}>Hi, {`${user?.profile?.first_name} ${user?.profile?.last_name}`}</Text>
                        <Text style={styles.subtitle}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            <View
                style={{
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    width: "100%",
                    paddingHorizontal: 30,
                    paddingTop: 20,
                    flex: 1,
                    paddingBottom: 20,
                }}
            >
                {/* Edit Profile */}
                <List.Accordion
                    title="Edit Profile"
                    style={styles.button}
                    titleStyle={{ fontSize: 14, marginHorizontal: 5 }}
                    left={(props) => (
                        <List.Icon
                            {...props}
                            icon="account-edit"
                            color="white"
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: "#65c95b",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        />
                    )}
                    expanded={false}
                    right={(props) => <List.Icon {...props} style={{ padding: 0, margin: 0 }} icon="chevron-right" color="black" />}
                    onPress={() => router.push("/profile/patient-info")}
                >
                    <List.Item title="First item" />
                </List.Accordion>

                {/* General Settings */}
                <Text
                    style={{
                        justifyContent: "flex-start",
                        width: "100%",
                        fontSize: 16,
                        marginVertical: 12,
                        fontWeight: "bold",
                    }}
                >
                    General Settings
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {SETTINGS.map((item, index) => (
                        <List.Accordion
                            key={index}
                            title={item.name}
                            style={styles.button}
                            titleStyle={{ fontSize: 14, marginHorizontal: 5, color: "black" }}
                            left={(props) => (
                                <List.Icon
                                    {...props}
                                    icon={item.icon}
                                    color={item.iconColor}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: item.iconBgColor,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                />
                            )}
                            right={(props) => (
                                <List.Icon
                                    {...props}
                                    style={{ padding: 0, margin: 0 }}
                                    icon={item.expanded && listExpanded ? "chevron-down" : "chevron-right"}
                                    color="black"
                                />
                            )}
                            expanded={item.expanded ? listExpanded : false}
                            onPress={item.onPress}
                        >
                            {childList.map((child) => (
                                <List.Item
                                    key={child.id}
                                    style={{ marginLeft: 50 }}
                                    left={() => (
                                        <Avatar.Image
                                            size={40}
                                            style={{ backgroundColor: "gray" }}
                                            source={
                                                child.profilePictureUrl
                                                    ? { uri: child.profilePictureUrl }
                                                    : require("@/assets/images/user-default.png")
                                            }
                                        />
                                    )}
                                    right={(props) => (
                                        <TouchableOpacity
                                            onPress={() => handleDeleteChild(child)}
                                            style={{ alignItems: "center", justifyContent: "center", padding: 0, margin: 0 }}
                                        >
                                            <List.Icon {...props} icon="delete" color="red" />
                                        </TouchableOpacity>
                                    )}
                                    titleNumberOfLines={1}
                                    titleStyle={{ fontSize: 14 }}
                                    title={child.firstName && child.lastName ? `${child.firstName} ${child.lastName}` : "New Child"}
                                    onPress={() => navigateToChildInfo(child.id)}
                                />
                            ))}

                            <List.Item
                                style={{ marginLeft: 50 }}
                                left={(props) => (
                                    <List.Icon
                                        {...props}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: "lightgrey",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                        icon="account-plus"
                                        color="grey"
                                    />
                                )}
                                titleStyle={{ fontSize: 14 }}
                                title="Add New"
                                onPress={handleAddNewChild}
                            />
                        </List.Accordion>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    titleBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: COLORS.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    safeArea: {
        width: "100%",
        alignItems: "center",
        backgroundColor: "white",
        height: "100%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 5,
    },
    subtitle: {
        fontSize: 20,
        textAlign: "center",
        marginVertical: 2,
        paddingHorizontal: 10,
    },
    button: {
        alignItems: "center",
        justifyContent: "flex-start",
        flexDirection: "row",
        marginTop: 10,
        width: "100%",
        height: 50,
        paddingRight: 0,
    },
});
