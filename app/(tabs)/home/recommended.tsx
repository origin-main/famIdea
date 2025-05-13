import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { ActivityIndicator, Button, Checkbox, Dialog, IconButton, Portal, TextInput } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
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
};

const DISTANCE_THRESHOLD_KM = 5; // 5km
const DISTANCE_THRESHOLD_METERS = DISTANCE_THRESHOLD_KM * 1000;

export default function Recommended() {
    const { location: userLocation } = useAuth();
    const router = useRouter();
    const { filter } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(userLocation || null);

    // Search, filter, sort
    const [searchValue, setSearchValue] = useState("");
    const [sortValue, setSortValue] = useState("location");
    const [filters, setFilters] = useState<{ label: string; value: number }[] | []>([]);

    const [birthCenters, setBirthCenters] = useState<BirthCenter[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<number[]>(filter ? [Number(filter)] : []);

    const options = [
        { label: "Location", value: "location" },
        { label: "No. of Services", value: "services" },
        { label: "Available Rooms", value: "rooms" },
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

    const getSortedCenters = () => {
        const filteredCenters = birthCenters.filter((center) => {
            const matchesSearch =
                center.name.toLowerCase().includes(searchValue.toLowerCase()) || center.address.toLowerCase().includes(searchValue.toLowerCase());

            const matchesService = selectedFilters.length === 0 || selectedFilters.some((f) => center.services.includes(f));

            return matchesSearch && matchesService;
        });

        const groupByRating = (centers: any[]) => {
            return {
                high: centers.filter((c) => c.rating >= 4),
                mid: centers.filter((c) => c.rating >= 3 && c.rating < 4),
                low: centers.filter((c) => c.rating < 3),
            };
        };

        const searchWithinGroup = (group: any[], sortValue: string) => {
            let sortedGroup = [...group];

            if (sortValue === "location" && location) {
                sortedGroup = sortedGroup
                    .map((center) => ({
                        ...center,
                        distance: getDistance(location, {
                            latitude: center.latitude,
                            longitude: center.longitude,
                        }),
                    }))
                    .sort((a, b) => a.distance - b.distance);
            } else if (sortValue === "services") {
                sortedGroup.sort((a, b) => b.services.length - a.services.length);
            } else if (sortValue === "rooms") {
                sortedGroup.sort((a, b) => b.availableRooms - a.availableRooms);
            }

            return sortedGroup;
        };

        let result: any[] = [];

        const { high, mid, low } = groupByRating(filteredCenters);
        const ratingGroups = [high, mid, low];

        for (const group of ratingGroups) {
            if (sortValue === "location" && location) {
                let radius = DISTANCE_THRESHOLD_METERS;
                while (result.length === 0 && radius <= 20000) {
                    const centersInRadius = group
                        .map((center) => ({
                            ...center,
                            distance: getDistance(location, {
                                latitude: center.latitude,
                                longitude: center.longitude,
                            }),
                        }))
                        .filter((center) => center.distance <= radius)
                        .sort((a, b) => a.distance - b.distance);

                    if (centersInRadius.length > 0) {
                        result = centersInRadius;
                        break;
                    }

                    radius += 1000;
                }
            } else {
                result = searchWithinGroup(group, sortValue);
                if (result.length > 0) break;
            }
        }

        return result;
    };

    const sortedCenters = useMemo(() => {
        if (birthCenters.length === 0 || !location) return [];

        return getSortedCenters();
    }, [birthCenters, sortValue, searchValue, selectedFilters, location]);

    const handleCardClick = (centerId: string) => {
        router.push({
            pathname: "/clinic-page",
            params: { id: centerId },
        });
    };

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
                    <Text style={styles.title}>Recommended for you</Text>
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
                        <View style={{ flex: 1 }}>
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
                        {sortedCenters.length == 0 ? (
                            <Text style={{ textAlign: "center" }}>No centers found</Text>
                        ) : (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBirthCenters} />}
                            >
                                {sortedCenters.map((item, index) => (
                                    <BirthCenterCard data={item} key={index} onPress={() => handleCardClick(item.id)} />
                                ))}
                            </ScrollView>
                        )}
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
