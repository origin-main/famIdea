import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, RefreshControl, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { ActivityIndicator, Button, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import { getPicture } from "@/utils/common";
import { Dialog } from "@rneui/themed";
import { Rating } from "react-native-ratings";

type Appointment = {
    id: string;
    appointmentDate: string;
    status: string;
    birthCenter: {
        id: string;
        name: string;
        address: string;
        pictureUrl: string | null;
    };
    rating: number | null;
    serviceName: string | null;
};

export default function Index() {
    const { user } = useAuth();

    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [visible, setVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [currentlyRating, setCurrentlyRating] = useState<Appointment | null>(null);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    const handleRatingCompleted = (value: number) => {
        setRating(value);
    };

    const handleSubmit = async () => {
        if (!user || !currentlyRating) return;
        const { error } = await supabase.from("ratings").insert([
            {
                patient_id: user.id,
                birth_center_id: currentlyRating?.birthCenter.id,
                rating,
                appointment_id: currentlyRating?.id,
            },
        ]);

        if (error) {
            console.error("Insert rating error:", error.message);
            throw new Error("Failed to insert rating");
        }
        await fetchAppointments();
        Alert.alert("Thanks for rating!", `You rated ${rating} stars.`);
        hideDialog();
    };

    const BUTTONS = ["Active", "Pending", "Completed", "History"];

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("appointments")
            .select(
                `id, appointment_date, status,
                birth_centers:birth_center_id (id, name, address, picture_url), ratings(rating),
                services:service_id (
                    id,
                    services_list (name)
                )`
            )
            .eq("patient_id", user.id)
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching appointments:", error.message);
        } else {
            const appointments: Appointment[] = data.map((appt: any) => ({
                id: appt.id,
                appointmentDate: appt.appointment_date,
                status: appt.status,
                birthCenter: {
                    id: appt.birth_centers.id,
                    name: appt.birth_centers.name,
                    address: appt.birth_centers.address,
                    pictureUrl: getPicture(appt.birth_centers.picture_url),
                },
                rating: appt.ratings?.[0]?.rating ?? null,
                serviceName: appt.services?.services_list?.name ?? null,
            }));

            setAppointments(appointments);
        }

        setLoading(false);
    };

    const filteredAppointments = appointments.filter((appt) => {
        if (active === 0) {
            // "Active" - only approved
            return appt.status === "approved";
        } else if (active === 1) {
            // "Pending" - only pending
            return appt.status === "pending";
        } else if (active === 2) {
            // "Completed" - only completed
            return appt.status == "completed";
        } else {
            // "History" - all statuses except approved and pending
            return appt.status !== "approved" && appt.status !== "pending";
        }
    });

    const handleApptClick = (id: string) => {
        router.push({
            pathname: "/appointment/appointment-details",
            params: { id: id },
        });
    };

    return (
        <View>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.titleBar}>
                    <Text style={styles.title}>My Appointment</Text>
                </View>
                <View
                    style={{
                        backgroundColor: COLORS.darkBlue,
                        width: "100%",
                        paddingVertical: 15,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 20,
                    }}
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {BUTTONS.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.button, active === index && styles.active]}
                                onPress={() => {
                                    setActive(index);
                                }}
                            >
                                <Text style={[active === index && { color: COLORS.white }]}>{button}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View
                    style={{
                        width: "100%",
                        paddingHorizontal: 20,
                        marginTop: 30,
                        flex: 1,
                    }}
                >
                    {loading ? (
                        <ActivityIndicator style={{ flex: 1 }} color={COLORS.darkBlue} />
                    ) : filteredAppointments.length === 0 ? (
                        <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>No appointments yet</Text>
                    ) : (
                        <FlatList
                            data={filteredAppointments}
                            keyExtractor={(item, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAppointments} />}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        handleApptClick(item.id);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Card style={{ width: "100%", marginBottom: 10 }}>
                                        <Card.Content style={{ width: "100%" }}>
                                            {active === 3 && (
                                                <View style={{ position: "absolute", top: 10, right: 10 }}>
                                                    <Text style={{ color: "gray" }}>
                                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={{ flexDirection: "row", marginBottom: item.rating || item.status === "completed" ? 20 : 0 }}>
                                                <Image
                                                    style={{
                                                        width: 60,
                                                        height: 60,
                                                        backgroundColor: COLORS.lightBlue,
                                                        objectFit: "fill",
                                                        marginRight: 20,
                                                        borderRadius: 50,
                                                    }}
                                                    source={
                                                        item.birthCenter.pictureUrl
                                                            ? { uri: item.birthCenter.pictureUrl }
                                                            : require("@/assets/images/service-icons/health-clinic.png")
                                                    }
                                                />
                                                <View style={{ flexDirection: "column", gap: 5, flex: 1 }}>
                                                    <Text style={{ fontWeight: "bold" }}>{item.birthCenter.name}</Text>
                                                    <Text style={{ width: "65%" }} numberOfLines={2}>
                                                        {item.birthCenter.address}
                                                    </Text>
                                                    <Text style={{ width: "65%" }} numberOfLines={1}>
                                                        Service: {item.serviceName}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.rating}>
                                                {!item.rating && item.status === "completed" && (
                                                    <Button
                                                        mode="contained-tonal"
                                                        onPress={() => {
                                                            setCurrentlyRating(item);
                                                            showDialog();
                                                        }}
                                                    >
                                                        Rate
                                                    </Button>
                                                )}
                                                {item.rating && (
                                                    <>
                                                        <Text>You rated: {item.rating}</Text>
                                                        <Ionicons name="star" size={15} color="gold" />
                                                    </>
                                                )}
                                                <Dialog isVisible={visible} onBackdropPress={hideDialog}>
                                                    <Dialog.Title title={item.birthCenter.name} />
                                                    <Text style={{ marginBottom: 10 }}>Rating:</Text>
                                                    <Rating type="star" startingValue={1} imageSize={30} onFinishRating={handleRatingCompleted} />
                                                    <Dialog.Actions>
                                                        <Button onPress={handleSubmit}>Submit</Button>
                                                    </Dialog.Actions>
                                                </Dialog>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    active: {
        backgroundColor: COLORS.primary,
    },
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
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 5,
        justifyContent: "center",
        height: 40,
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
    rating: {
        position: "absolute",
        right: 10,
        bottom: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
});
