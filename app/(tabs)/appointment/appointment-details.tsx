import { COLORS } from "@/components/constants";
import { useAuth } from "@/context/AuthContext";
import { addNotification, getPicture } from "@/utils/common";
import { supabase } from "@/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { ActivityIndicator, Button, Divider, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dialog } from "@rneui/themed";

type Appointment = {
    id: string;
    appointmentDate: string;
    status: string;
    service: {
        id: number;
        description: string;
        price?: number;
        duration?: string;
        name: string;
    };
    birthCenter: {
        id: string;
        name: string;
        address: string;
        pictureUrl: string | null;
    };
    details: any;
};

const AppointmentDetails = () => {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(false);

    const [visible, setVisible] = useState(false);

    const showDialog = () => setVisible(true);
    const hideDialog = () => setVisible(false);

    useEffect(() => {
        if (id) {
            fetchService();
        }
    }, [id]);

    const fetchService = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("appointments")
            .select(
                `id,
                appointment_date,
                status,
                services:service_id (id, description, price, duration, services_list (name)),
                birth_centers:birth_center_id (id, name, address, picture_url),
                prenatal:prenatal-table (estimated_due_date, height, weight, pulse_rate, body_temperature, fundal_height, prescription)`
            )
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching appointments:", error.message);
        } else {
            const apptData = data as any;
            const appointment: Appointment = {
                id: apptData.id,
                appointmentDate: apptData.appointment_date,
                status: apptData.status,
                service: {
                    id: apptData.services.id,
                    description: apptData.services.description,
                    price: apptData.services.price,
                    duration: apptData.services.duration,
                    name: apptData.services.services_list.name,
                },
                birthCenter: {
                    id: apptData.birth_centers.id,
                    name: apptData.birth_centers.name,
                    address: apptData.birth_centers.address,
                    pictureUrl: getPicture(apptData.birth_centers.picture_url),
                },
                details: apptData.prenatal[0] ?? null,
            };

            setAppointment(appointment);
        }

        setLoading(false);
    };

    const handleCancelClick = () => {
        if (!id) return;

        Alert.alert(
            "Cancel Appointment",
            "Are you sure you want to cancel?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    onPress: async () => {
                        const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
                        await addNotification({
                            type: "appointment",
                            title: "Appointment Cancelled",
                            body: `${user?.profile?.first_name} ${user?.profile?.last_name} has cancelled the appointment.`,
                            patient_id: user?.id,
                            birth_center_id: appointment?.birthCenter.id,
                            appointment_id: appointment?.id,
                        });

                        if (error) {
                            console.error("Failed to cancel appointment:", error.message);
                        } else {
                            alert("Appointment cancelled successfully!");
                            router.replace("/(tabs)/appointment");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleMessageClick = () => {
        if (!appointment) return;
        router.push({
            pathname: "/chat",
            params: { birthCenterId: appointment.birthCenter.id, name: appointment.birthCenter.name },
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.titleBar}>
                <View style={{ position: "absolute", left: 20 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.title}>Appointment</Text>
            </View>
            {loading ? (
                <ActivityIndicator style={{ flex: 1 }} color={COLORS.darkBlue} />
            ) : (
                <View style={{ flex: 1, padding: 30, justifyContent: "center", backgroundColor: "white" }}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ justifyContent: "center", alignItems: "center", width: "100%", padding: 10, gap: 20 }}>
                            <View style={styles.imageContainer}>
                                <Image
                                    style={styles.image}
                                    source={
                                        appointment?.birthCenter.pictureUrl
                                            ? { uri: appointment.birthCenter.pictureUrl }
                                            : require("@/assets/images/service-icons/health-clinic.png")
                                    }
                                />
                            </View>

                            <Text style={{ fontWeight: "bold", fontSize: 18, width: "70%", textAlign: "center" }}>
                                {appointment?.birthCenter.name || "Name"}
                            </Text>
                        </View>
                        <Divider style={{ marginVertical: 10 }}></Divider>
                        <View>
                            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                                Service: <Text>{appointment?.service.name || "Service Name"}</Text>
                            </Text>
                            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                                Price: <Text>{appointment?.service.price ? `₱${appointment.service.price.toLocaleString()}` : "Free"}</Text>
                            </Text>
                            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                                Appointment Date:{" "}
                                <Text>
                                    {appointment?.appointmentDate
                                        ? new Date(appointment?.appointmentDate).toLocaleDateString("en-US", {
                                              month: "long",
                                              day: "numeric",
                                              year: "numeric",
                                          })
                                        : ""}
                                </Text>
                            </Text>
                            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                                Appointment Time:{" "}
                                <Text>
                                    {appointment?.appointmentDate
                                        ? new Date(appointment?.appointmentDate).toLocaleTimeString("en-US", {
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: true,
                                          })
                                        : ""}
                                </Text>
                            </Text>
                            <Text style={{ fontWeight: "bold" }}>
                                Status:{" "}
                                <Text>
                                    {appointment?.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : "Inactive"}
                                </Text>
                            </Text>
                        </View>
                        <Divider style={{ marginVertical: 10 }}></Divider>
                        <View>
                            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Description</Text>
                            <ScrollView style={{ height: 150, padding: 10, backgroundColor: COLORS.grey, borderRadius: 5 }}>
                                <Text style={{ marginBottom: 10, paddingBottom: 10 }}>{appointment?.service.description || "Description"}</Text>
                            </ScrollView>
                        </View>
                        <View
                            style={{
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                gap: 20,
                                marginTop: 20,
                            }}
                        >
                            {appointment?.status === "pending" && (
                                <Button
                                    mode="contained"
                                    style={{ flex: 1 }}
                                    buttonColor={COLORS.error}
                                    textColor="black"
                                    onPress={() => handleCancelClick()}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                mode="contained"
                                style={{ flex: 1 }}
                                buttonColor={COLORS.lightBlue}
                                textColor="black"
                                onPress={() => handleMessageClick()}
                            >
                                Message
                            </Button>
                        </View>
                        {appointment?.details && (
                            <View
                                style={{
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginTop: 20,
                                }}
                            >
                                <Button
                                    mode="contained"
                                    style={{ flex: 1 }}
                                    buttonColor={COLORS.lightBlue}
                                    textColor="black"
                                    onPress={() => showDialog()}
                                >
                                    View Details
                                </Button>
                            </View>
                        )}
                    </ScrollView>
                    <Dialog isVisible={visible} onBackdropPress={hideDialog}>
                        <Dialog.Title title="Prenatal Record Details" />
                        <View style={styles.modal}>
                            <View>
                                <Text style={{ color: "grey" }}>Estimated Due Date</Text>
                                <Text style={{ fontSize: 16 }}>{new Date(appointment?.details?.estimated_due_date)?.toLocaleDateString()}</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Weight</Text>
                                <Text style={{ fontSize: 16 }}>{appointment?.details?.weight} kg</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Body Temperature</Text>
                                <Text style={{ fontSize: 16 }}>{appointment?.details?.body_temperature} °C</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Height</Text>
                                <Text style={{ fontSize: 16 }}>{appointment?.details?.height} cm</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Pulse Rate</Text>
                                <Text style={{ fontSize: 16 }}>{appointment?.details?.pulse_rate} bpm</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Fundal Height</Text>
                                <Text style={{ fontSize: 16 }}>{appointment?.details?.fundal_height} cm</Text>
                            </View>

                            <View>
                                <Text style={{ color: "grey" }}>Prescription</Text>
                                <ScrollView style={{ height: 100, padding: 10, backgroundColor: COLORS.grey, borderRadius: 5 }}>
                                    <Text style={{ marginBottom: 10, paddingBottom: 10 }}>{appointment?.details?.prescription}</Text>
                                </ScrollView>
                            </View>
                        </View>

                        <Dialog.Actions>
                            <Button onPress={hideDialog}>Close</Button>
                        </Dialog.Actions>
                    </Dialog>
                </View>
            )}
        </SafeAreaView>
    );
};

export default AppointmentDetails;

const styles = StyleSheet.create({
    modal: {
        padding: 10,
        gap: 10,
    },
    container: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        minHeight: 500,
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 10,
    },
    imageContainer: {
        backgroundColor: COLORS.lightBlue,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        width: 150,
        height: 150,
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
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
    },
});
