import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SERVICE_ICONS } from "@/components/constants";
import { Avatar, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { getProfilePicture } from "@/utils/common";
import * as Location from "expo-location";
import { supabase } from "@/utils/supabase";
import { getDistance } from "geolib";
import { useAlert } from "@/context/AlertContext";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude?: string;
    longitude?: string;
    pictureUrl: string;
    distance?: number;
};

const DISTANCE_THRESHOLD_KM = 5; // 5km
const DISTANCE_THRESHOLD_METERS = DISTANCE_THRESHOLD_KM * 1000;

export default function Index() {
    const { user } = useAuth();
    const { notificationCount } = useAlert();
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [nearbyBirthCenters, setNearbyBirthCenters] = useState<BirthCenter[]>([]);
    const [services, setServices] = useState<{ label: string; value: number }[]>([]);
    const [loading, setLoading] = useState(false);

    // Set user's profile picture
    useEffect(() => {
        if (user?.profile?.profile_picture_url) {
            const url = getProfilePicture(user?.profile?.profile_picture_url);
            setProfilePicture(url);
        } else {
            setProfilePicture(null);
        }
    }, [user?.profile?.profile_picture_url]);

    // Get user's current location
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Permission to access location was denied");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        })();
    }, []);

    useEffect(() => {
        fetchNearbyBirthCenters();
        fetchServices();
    }, [location]);

    // Get nearby birth centers
    const fetchNearbyBirthCenters = async () => {
        if (!location) return;

        setLoading(true);

        const { data, error } = await supabase
            .from("birth_centers")
            .select("id, name, address, contact_number, description, latitude, longitude, picture_url")
            .eq("status", "approved");

        if (error) {
            console.error("Failed to fetch birth centers:", error.message);
            setLoading(false);
            return;
        }

        const birthCenters = data
            .filter((center) => center.latitude != null && center.longitude != null)
            .map((center) => ({
                id: center.id,
                name: center.name,
                address: center.address,
                contactNumber: center.contact_number,
                description: center.description,
                latitude: center.latitude,
                longitude: center.longitude,
                pictureUrl: center.picture_url,
            }));

        const searchWithinRadius = (radiusMeters: number) => {
            return birthCenters
                .map((center) => {
                    const distance = getDistance(location!, {
                        latitude: center.latitude,
                        longitude: center.longitude,
                    });

                    return {
                        ...center,
                        distance,
                    };
                })
                .filter((center) => center.distance <= radiusMeters)
                .sort((a, b) => a.distance - b.distance);
        };

        let radius = DISTANCE_THRESHOLD_METERS; // Start with 5km
        let nearbyCenters: typeof birthCenters = [];

        while (nearbyCenters.length === 0 && radius <= 20000) {
            // Max 20km to avoid infinite loop
            nearbyCenters = searchWithinRadius(radius);
            if (nearbyCenters.length === 0) {
                radius += 1000; // Increase by 1km
            }
        }

        setNearbyBirthCenters(nearbyCenters);
        setLoading(false);
    };

    const fetchServices = async () => {
        const { data, error } = await supabase.from("services_list").select("*");
        if (error) {
            console.error("Failed to fetch filters:", error.message);
        }

        setServices(
            (data ?? []).map((service) => ({
                label: service.name,
                value: service.id,
            }))
        );
    };

    const handleServiceClick = (serviceId: number) => {
        router.navigate({
            pathname: "/home/search-page",
            params: { filter: serviceId },
        });
    };

    const handleBirthCenterClick = (centerId: string) => {
        router.navigate({
            pathname: "/clinic-page",
            params: { id: centerId },
        });
    };

    // Get random static rating
    const getRating = () => (Math.random() * 2 + 3).toFixed(1);

    const renderServiceRows = () => {
        const rows = [];
        const itemsPerRow = 3;

        for (let i = 0; i < services.length; i += itemsPerRow) {
            const rowItems = services.slice(i, i + itemsPerRow);
            rows.push(
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-evenly", gap: 10 }}>
                    {rowItems.map((service, index) => (
                        <View
                            key={index}
                            style={{
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <TouchableOpacity style={styles.button} onPress={() => handleServiceClick(service.value)}>
                                <Image style={{ width: 50, height: 50 }} source={SERVICE_ICONS[service.value]} />
                            </TouchableOpacity>
                            <Text
                                style={{
                                    fontSize: 10,
                                    maxWidth: 100,
                                    textAlign: "center",
                                }}
                            >
                                {service.label}
                            </Text>
                        </View>
                    ))}
                </View>
            );
        }

        return rows;
    };

    return (
        <View>
            <SafeAreaView style={styles.safeArea}>
                {/* Avatar and header details */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        paddingHorizontal: 30,
                        paddingTop: 40,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Avatar.Image
                            size={60}
                            style={{ backgroundColor: "white" }}
                            source={profilePicture ? { uri: profilePicture } : require("@/assets/images/user-default.png")}
                        />
                        {/* Name */}
                        <View
                            style={{
                                flexDirection: "column",
                                alignItems: "flex-start",
                            }}
                        >
                            <Text style={styles.title}>Hi, {`${user?.profile?.first_name} ${user?.profile?.last_name}`}</Text>
                            <Text style={styles.subtitle}>Welcome back!</Text>
                        </View>
                    </View>
                    <View>
                        {notificationCount > 0 && (
                            <View style={styles.badgeCount}>
                                <Text style={{ fontSize: 12, fontWeight: "bold", color: "white" }}>
                                    {notificationCount > 9 ? "9+" : notificationCount}
                                </Text>
                            </View>
                        )}
                        <Ionicons
                            size={28}
                            name="notifications"
                            color={"white"}
                            onPress={() => {
                                router.push("/home/notifications");
                            }}
                        />
                    </View>
                </View>

                {/* Search bar */}
                <View
                    style={{
                        width: "100%",
                        paddingHorizontal: 30,
                        paddingVertical: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            router.push("/(tabs)/home/search-page");
                        }}
                    >
                        <TextInput
                            readOnly
                            mode="outlined"
                            theme={{ roundness: 10 }}
                            placeholder="Birthing Centers near you"
                            left={<TextInput.Icon icon="magnify" />}
                            placeholderTextColor={COLORS.gray}
                        />
                    </TouchableOpacity>
                </View>

                {/* Services */}
                <View
                    style={{
                        padding: 20,
                        backgroundColor: "white",
                        height: "40%",
                        width: "100%",
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ fontSize: 17, fontWeight: "bold" }}>Services</Text>
                    {renderServiceRows()}
                </View>

                {/* Birthing Center */}
                <View
                    style={{
                        padding: 20,
                        backgroundColor: "#e0e0e0",
                        width: "100%",
                        borderRadius: 10,
                        marginTop: 10,
                        flex: 1,
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingBottom: 5,
                        }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: "bold" }}>Birthing Centers near you</Text>
                        <Ionicons
                            size={28}
                            name="arrow-forward-circle"
                            onPress={() => {
                                router.push("/(tabs)/home/search-page");
                            }}
                            color={"black"}
                        />
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-evenly", flex: 1 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchNearbyBirthCenters} />}
                        >
                            {nearbyBirthCenters.length > 0 ? (
                                nearbyBirthCenters.map((data, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.clinicCard}
                                        onPress={() => {
                                            handleBirthCenterClick(data.id);
                                        }}
                                    >
                                        <Image
                                            style={{
                                                width: "90%",
                                                height: "70%",
                                                backgroundColor: COLORS.lightBlue,
                                                objectFit: "fill",
                                                margin: 5,
                                            }}
                                            source={
                                                data.pictureUrl
                                                    ? { uri: data.pictureUrl }
                                                    : require("@/assets/images/service-icons/health-clinic.png")
                                            }
                                        />
                                        <View style={{ alignItems: "center", gap: 3 }}>
                                            <Text style={{ fontSize: 12, fontWeight: "bold" }} numberOfLines={1}>
                                                {data.name}
                                            </Text>
                                            <View style={{ flexDirection: "row", gap: 5, alignSelf: "flex-start", alignItems: "center" }}>
                                                <Ionicons size={15} name="star" color={"gold"} />
                                                <Text style={{ fontSize: 12 }}>{getRating()}</Text>
                                            </View>
                                            <Text style={{ fontSize: 11, color: "grey", alignSelf: "flex-start" }}>{`${(
                                                data.distance! / 1000
                                            ).toFixed(1)} km away`}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={{ fontSize: 12, fontWeight: "bold" }}>No Birth Centers found</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    safeArea: {
        width: "100%",
        height: "100%",
        backgroundColor: "#0082a6",
        alignItems: "flex-start",
        padding: 10,
    },
    clinicCard: {
        width: 150,
        flex: 1,
        backgroundColor: COLORS.white,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        marginRight: 10,
        paddingVertical: 15,
    },
    button: {
        backgroundColor: COLORS.lightBlue,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        width: 70,
        height: 70,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    subtitle: {
        fontSize: 15,
        textAlign: "center",
        color: "white",
    },
    badgeCount: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "red",
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        width: 20,
        height: 20,
        borderRadius: 100,
        zIndex: 100,
    },
});
