import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { getFormattedHours } from "@/utils/common";
import { format } from "date-fns";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    pictureUrl: string | null;
    rating?: number;
    openingTime: string;
    closingTime: string;
    availableDays: string[];
    distance?: number;
    services?: any;
    availableRooms?: number;
};

type Props = {
    data: BirthCenter;
    onPress?: () => void;
    disabled?: boolean;
};

const BirthCenterCard = ({ data, onPress, disabled }: Props) => {
    const { user } = useAuth();
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        if (!user) return;

        const checkFavorite = async () => {
            const { data: fav } = await supabase
                .from("preferred_centers")
                .select("id")
                .eq("patient_id", user.id)
                .eq("birth_center_id", data.id)
                .maybeSingle();

            setSelected(!!fav);
        };

        checkFavorite();

        const channel = supabase
            .channel("preferred-centers-realtime")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "preferred_centers",
                    filter: `patient_id=eq.${user.id}`,
                },
                () => {
                    checkFavorite();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, data.id]);

    const toggleFavorite = async (patientId: string, centerId: string, currentlyFavored: boolean) => {
        if (currentlyFavored) {
            await supabase.from("preferred_centers").delete().eq("patient_id", patientId).eq("birth_center_id", centerId);
        } else {
            await supabase.from("preferred_centers").insert({
                patient_id: patientId,
                birth_center_id: centerId,
            });
        }
    };

    const handleToggle = async () => {
        if (!user) return;

        await toggleFavorite(user.id, data.id, selected);
        setSelected((prev) => !prev);
    };

    const { hours, isOpen, isAvailableToday } = getFormattedHours(data.openingTime, data.closingTime, data.availableDays);
    const today = format(new Date(), "EEE");

    return (
        <TouchableOpacity onPress={onPress} style={styles.container} disabled={disabled}>
            <IconButton
                size={15}
                style={styles.heartIcon}
                mode="outlined"
                icon={selected ? "heart" : "heart-outline"}
                iconColor={selected ? "red" : "black"}
                onPress={() => handleToggle()}
            />
            <View style={styles.row}>
                <Image
                    style={styles.image}
                    source={data.pictureUrl ? { uri: data.pictureUrl } : require("@/assets/images/service-icons/health-clinic.png")}
                />
                <View style={styles.details}>
                    <Text style={styles.title} numberOfLines={2}>
                        {data.name}
                    </Text>

                    <Text style={styles.text} numberOfLines={2}>
                        <Text style={styles.label}>Address: </Text>
                        {data.address}
                    </Text>

                    <Text style={styles.text} numberOfLines={2}>
                        <Text style={styles.label}>Hours: </Text>
                        {hours}
                        {!isAvailableToday && <Text style={{ color: "red" }}> (Closed on {today})</Text>}
                        {isAvailableToday && !isOpen && <Text style={{ color: "red" }}> (Closed now)</Text>}
                    </Text>

                    <Text style={styles.text}>
                        <Text style={styles.label}>Phone: </Text>
                        {data.contactNumber}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10, alignItems: "center", width: 20 }}>
                        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
                            <MaterialIcons size={16} name="meeting-room" color="black" />
                            <Text style={styles.text}>{data?.availableRooms || "0"}</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
                            <MaterialCommunityIcons size={16} name="hand-heart" color="black" />
                            <Text style={styles.text}>{data?.services?.length}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.rating}>
                {typeof data?.distance == "number" && (
                    <Text style={{ fontSize: 11, color: "grey", alignSelf: "flex-start" }}>{(data.distance / 1000).toFixed(1)} km away</Text>
                )}
                <Ionicons size={15} name="star" color="gold" />
                <Text style={styles.ratingText}>{data.rating}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default BirthCenterCard;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 200,
        backgroundColor: COLORS.white,
        borderColor: "black",
        borderWidth: 1,
        alignItems: "flex-start",
        justifyContent: "center",
        borderRadius: 5,
        marginBottom: 10,
        paddingVertical: 10,
    },
    row: {
        flexDirection: "row",
        height: "100%",
        alignItems: "center",
        width: "100%",
        gap: 10,
    },
    heartIcon: {
        position: "absolute",
        top: 0,
        right: 0,
        zIndex: 100,
    },
    image: {
        width: "40%",
        height: "100%",
        backgroundColor: COLORS.lightBlue,
        resizeMode: "cover",
        margin: 5,
    },
    details: {
        alignItems: "flex-start",
        gap: 3,
        height: "100%",
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        width: 150,
    },
    text: {
        fontSize: 14,
        flexWrap: "wrap",
        width: "90%",
    },
    label: {
        fontWeight: "bold",
    },
    rating: {
        position: "absolute",
        bottom: 10,
        right: 10,
        flexDirection: "row",
        gap: 5,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "bold",
    },
});
