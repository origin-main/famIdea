import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    pictureUrl: string;
    rating?: number;
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

    // Get random static rating
    const getRating = () => (Math.random() * 2 + 3).toFixed(1);

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

                    <Text style={styles.text}>
                        <Text style={styles.label} numberOfLines={2}>
                            Address:{" "}
                        </Text>
                        {data.address}
                    </Text>

                    <Text style={styles.text}>
                        <Text style={styles.label} numberOfLines={1}>
                            Hours:{" "}
                        </Text>
                        8:00 AM - 5:00 PM
                    </Text>

                    <Text style={styles.text}>
                        <Text style={styles.label}>Phone: </Text>
                        {data.contactNumber}
                    </Text>

                    <View style={styles.rating}>
                        <Ionicons size={15} name="star" color="gold" />
                        <Text style={styles.ratingText}>{data.rating || getRating()}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default BirthCenterCard;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 170,
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
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        width: 150,
    },
    text: {
        fontSize: 14,
        flexWrap: "wrap",
        width: "70%",
    },
    label: {
        fontWeight: "bold",
    },
    rating: {
        flexDirection: "row",
        gap: 5,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: "bold",
    },
});
