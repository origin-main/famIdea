import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { ActivityIndicator, Button, Checkbox, Dialog, IconButton, Portal, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Dropdown } from "react-native-paper-dropdown";
import { supabase } from "@/utils/supabase";
import BirthCenterCard from "@/components/ui/BirthCenterCard";
import * as Location from "expo-location";
import { getDistance } from "geolib";
import { getPicture } from "@/utils/common";
import { useAuth } from "@/context/AuthContext";

type BirthCenter = {
    id: string;
    name: string;
    address: string;
    contactNumber: string;
    description?: string;
    latitude: string;
    longitude: string;
    pictureUrl: string | null;
    rating: number;
    openingTime: string;
    closingTime: string;
    availableDays: string[];
    availableRooms: number;
    services: number[];
    distance: number;
};

export default function Index() {
    const router = useRouter();
    const { location: userLocation } = useAuth();
    const { filter } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(userLocation || null);

    // Search, filter, sort
    const [searchValue, setSearchValue] = useState("");
    const [sortValue, setSortValue] = useState("");
    const [filters, setFilters] = useState<{ label: string; value: number }[] | []>([]);

    const [birthCenters, setBirthCenters] = useState<BirthCenter[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<number[]>(filter ? [Number(filter)] : []);

    const options = [
        { label: "Name", value: "name" },
        { label: "Location", value: "location" },
        { label: "Rating", value: "rating" },
    ];

    useEffect(() => {
        fetchBirthCenters();
        fetchServices();
    }, [location]);

    // Get user's current location
    useEffect(() => {
            (async () => {
                if (location) return;
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    console.log("Permission to access location was denied");
                    return;
                }
    
                let currLocation = await Location.getCurrentPositionAsync({});
                setLocation({ latitude: currLocation.coords.latitude, longitude: currLocation.coords.longitude });
            })();
        }, []);

    const fetchBirthCenters = async () => {
        setLoading(true);
        const { data: centers, error } = await supabase
            .from("birth_centers")
            .select(
                "id, name, address, contact_number, description, latitude, longitude, picture_url, opening_time, closing_time, available_days, available_rooms, ratings:ratings(rating)"
            )
            .eq("status", "approved");

        if (error) {
            console.error("Failed to fetch birth centers:", error.message);
            setLoading(false);
            return;
        }

        const centersWithServices: BirthCenter[] = await Promise.all(
            centers
                .filter((center) => center.latitude != null && center.longitude != null)
                .map(async (center) => {
                    const { data: serviceIds, error } = await supabase
                        .from("services")
                        .select("service_id")
                        .eq("birth_center_id", center.id)
                        .eq("is_active", true);

                    if (error) {
                        console.error("Failed to fetch services:", error.message);
                    }

                    const ratings = center.ratings || [];
                    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

                    return {
                        id: center.id,
                        name: center.name,
                        address: center.address,
                        contactNumber: center.contact_number,
                        description: center.description,
                        latitude: center.latitude,
                        longitude: center.longitude,
                        pictureUrl: getPicture(center.picture_url),
                        openingTime: center.opening_time,
                        closingTime: center.closing_time,
                        availableDays: center.available_days,
                        availableRooms: center.available_rooms,
                        rating: averageRating,
                        services: serviceIds?.map((service) => service.service_id as number) ?? [],
                        distance: location ? getDistance(location, { latitude: center.latitude, longitude: center.longitude }) : 0,
                    };
                })
        );

        setBirthCenters(centersWithServices);

        setLoading(false);
    };

    const fetchServices = async () => {
        const { data, error } = await supabase.from("services_list").select("*");
        if (error) {
            console.error("Failed to fetch filters:", error.message);
        }

        setFilters(
            (data ?? []).map((service) => ({
                label: service.name,
                value: service.id,
            }))
        );
    };

    // Filter birth centers based on search input and services
    const filteredCenters = birthCenters.filter((center) => {
        const matchesSearch =
            center.name.toLowerCase().includes(searchValue.toLowerCase()) || center.address.toLowerCase().includes(searchValue.toLowerCase());

        const matchesService = selectedFilters.length === 0 || selectedFilters.some((f) => center.services.includes(f));

        return matchesSearch && matchesService;
    });

    const sortedCenters = [...filteredCenters].sort((a, b) => {
        if (sortValue === "name") {
            return a.name.localeCompare(b.name); // Alphabetical (A-Z)
        }

        if (sortValue === "location" && location) {
            const distA = getDistance(location, {
                latitude: a.latitude,
                longitude: a.longitude,
            });

            const distB = getDistance(location, {
                latitude: b.latitude,
                longitude: b.longitude,
            });

            return distA - distB; // Nearest first
        }

        if (sortValue === "rating") {
            return b.rating - a.rating; // Highest first
        }

        return 0; // Default case (no sorting)
    });

    const handleCardClick = (centerId: string) => {
        router.push({
            pathname: "/clinic-page",
            params: { id: centerId },
        });
    };

    // Get random static rating
    const getRating = () => Number((Math.random() * 2 + 3).toFixed(1));

    const [filterDialogVisible, setFilterDialogVisible] = useState(false);

    const openFilterDialog = () => setFilterDialogVisible(true);
    const closeFilterDialog = () => setFilterDialogVisible(false);

    const toggleFilter = (value: any) => {
        setSelectedFilters((prev: any) => (prev.includes(value) ? prev.filter((v: any) => v !== value) : [...prev, value]));
    };

    return (
        <View>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.titleBar}>
                    <View style={{ position: "absolute", left: 20 }}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>Birthing Centers</Text>
                </View>

                {/* Search filters */}
                <View
                    style={{
                        width: "100%",
                        paddingHorizontal: 10,
                        paddingVertical: 10,
                        gap: 10,
                    }}
                >
                    <TextInput
                        mode="outlined"
                        theme={{ roundness: 5 }}
                        onChangeText={setSearchValue}
                        value={searchValue}
                        placeholder="Search here.."
                        right={<TextInput.Icon icon="magnify" />}
                        placeholderTextColor={COLORS.gray}
                    />
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            justifyContent: "space-between",
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, width: 150 }}>
                            <Dropdown
                                mode="outlined"
                                placeholder="Sort by"
                                options={options}
                                value={sortValue}
                                onSelect={(value) => setSortValue(value as string)}
                            />
                        </View>
                        <IconButton icon="filter-variant" size={32} iconColor="black" onPress={openFilterDialog} />

                        <Portal>
                            <Dialog visible={filterDialogVisible} onDismiss={closeFilterDialog}>
                                <Dialog.Title>Filter Services</Dialog.Title>
                                <Dialog.ScrollArea>
                                    <ScrollView>
                                        {filters.map((filter) => (
                                            <Checkbox.Item
                                                key={filter.value}
                                                label={filter.label}
                                                status={selectedFilters.includes(filter.value) ? "checked" : "unchecked"}
                                                onPress={() => toggleFilter(filter.value)}
                                                color={COLORS.darkBlue}
                                            />
                                        ))}
                                    </ScrollView>
                                </Dialog.ScrollArea>
                                <Dialog.Actions style={{ justifyContent: "space-between" }}>
                                    <Button
                                        onPress={() => setSelectedFilters([])}
                                        style={{ alignSelf: "flex-end", marginRight: 10 }}
                                        compact
                                        textColor={COLORS.darkBlue}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        style={{ paddingHorizontal: 5 }}
                                        mode="contained"
                                        onPress={closeFilterDialog}
                                        buttonColor={COLORS.lightBlue}
                                        textColor="black"
                                    >
                                        Apply
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                        </Portal>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator color={COLORS.lightBlue} style={{ flex: 1, width: "100%" }} />
                ) : (
                    <View
                        style={{
                            flex: 1,
                            width: "100%",
                            padding: 10,
                            height: "100%",
                            justifyContent: "center",
                        }}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBirthCenters} />}
                        >
                            {sortedCenters.map((item, index) => (
                                <BirthCenterCard data={item} key={index} onPress={() => handleCardClick(item.id)} />
                            ))}
                        </ScrollView>
                    </View>
                )}
            </SafeAreaView>
        </View>
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
    background: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: COLORS.white,
        alignItems: "center",
    },
    safeArea: {
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.white,
        alignItems: "flex-start",
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
        color: "black",
    },
    subtitle: {
        fontSize: 15,
        textAlign: "center",
        color: "white",
    },
});
