import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../components/constants";
import { ActivityIndicator, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

type Appointment = {
    id: string;
    appointmentDate: string;
    status: string;
    birthCenter: {
        id: string;
        name: string;
        address: string;
        pictureUrl: string;
    };
};

export default function Index() {
    const { user } = useAuth();

    const [active, setActive] = useState(0);
    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const BUTTONS = ["Active", "Pending", "History"];

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
                birth_centers:birth_center_id (id, name, address, picture_url)`
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
                    pictureUrl: appt.birth_centers.picture_url,
                },
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
        } else {
            // "History" - all statuses except approved and pending
            return appt.status !== "approved" && appt.status !== "pending";
        }
    });

    const getRating = () => {
        return (Math.random() * 2 + 3).toFixed(1);
    };

    const handleApptClick = (id: string) => {
        router.navigate({
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
                                            {active === 2 && (
                                                <View style={{ position: "absolute", top: 10, right: 10 }}>
                                                    <Text style={{ color: "gray" }}>
                                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    </Text>
                                                </View>
                                            )}
                                            <View style={{ flexDirection: "row" }}>
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
                                                    <Text style={{ width: "70%" }} numberOfLines={2}>
                                                        {item.birthCenter.address}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.rating}>
                                                <Text>{getRating()}</Text>
                                                <Ionicons name="star" size={15} color="gold" />
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
