import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "@/components/constants";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Calendar } from "react-native-calendars";
import { supabase } from "@/utils/supabase";
import AppointmentModal from "@/components/ui/AppointmentModal";
import { getPicture } from "@/utils/common";

type Service = {
    id: string;
    birthCenterId: string;
    description: string;
    price?: number;
    duration?: string;
    serviceId: number;
    name: string;
    birthCenter: {
        name: string;
        address: string;
        pictureUrl: string | null;
    };
};

export default function Index() {
    const { serviceId } = useLocalSearchParams();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [service, setService] = useState<Service | null>(null);
    const [timeSlots, setTimeSlots] = useState<{ label: string; value: string; available: boolean }[]>([]);

    // for appointment modal
    const [apptModalVisible, setApptModalVisible] = useState(false);

    useEffect(() => {
        if (serviceId) {
            fetchService();
        }
    }, [serviceId]);

    const fetchService = async () => {
        const { data, error } = await supabase
            .from("services")
            .select(
                `
                    id,
                    birth_center_id,
                    description,
                    price,
                    duration,
                    service_id,
                    services_list (name),
                    birth_centers (name, address, picture_url)
                    `
            )
            .eq("id", serviceId)
            .single();

        if (error) throw error;

        const serviceData = data as any;

        setService({
            id: serviceData.id,
            birthCenterId: serviceData.birth_center_id,
            description: serviceData.description,
            price: serviceData.price,
            duration: serviceData.duration,
            serviceId: serviceData.service_id,
            name: serviceData.services_list.name,
            birthCenter: {
                name: serviceData.birth_centers.name,
                address: serviceData.birth_centers.address,
                pictureUrl: getPicture(serviceData.birth_centers.picture_url),
            },
        });
    };

    const fetchTimeSlots = async (date: string) => {
        if (!service) return;

        const { data: timeslotData, error: timeslotError } = await supabase
            .from("timeslots")
            .select("slots")
            .eq("birth_center_id", service.birthCenterId)
            .eq("date", date)
            .maybeSingle();

        if (timeslotError) {
            console.error("Error fetching timeslots:", timeslotError.message);
            return;
        }

        if (!timeslotData) {
            setTimeSlots([]);
            return;
        }

        const slots = JSON.parse(timeslotData.slots);

        // Get all appointments for that date and birth center
        const { data: appointments, error: appointmentError } = await supabase
            .from("appointments")
            .select("appointment_date")
            .eq("birth_center_id", service.birthCenterId)
            .in("status", ["pending", "approved"])
            .gte("appointment_date", `${date}T00:00:00Z`)
            .lt("appointment_date", `${date}T23:59:59Z`);

        if (appointmentError) {
            console.error("Error fetching appointments:", appointmentError.message);
            return;
        }

        const takenTimes = appointments?.map((appt) => new Date(appt.appointment_date).toISOString().slice(11, 16));

        const now = new Date();
        const isToday = date === now.toISOString().slice(0, 10);
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        console.log(isToday, currentTimeMinutes);

        setTimeSlots(
            slots.map((slot: any) => {
                const slotDate = new Date(slot.start);
                const localTime = slotDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                const slotTimeStr = slotDate.toISOString().slice(11, 16); // "HH:MM" in UTC
                const isTaken = takenTimes.includes(slotTimeStr);

                const slotHour = slotDate.getHours();
                const slotMinutes = slotDate.getMinutes();
                const slotTotalMinutes = slotHour * 60 + slotMinutes;

                const isPast = isToday && slotTotalMinutes <= currentTimeMinutes;
                console.log(isPast);

                return {
                    label: localTime,
                    value: `${date}T${slotTimeStr}:00.000Z`,
                    available: !isTaken && !isPast,
                };
            })
        );
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
                    <Text style={styles.title}>Appointment Schedule</Text>
                </View>

                <View
                    style={{
                        width: "100%",
                        flex: 1,
                        padding: 10,
                        justifyContent: "center",
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            height: 170,
                            backgroundColor: COLORS.white,
                            justifyContent: "center",
                        }}
                    >
                        <View style={styles.clinicContainer}>
                            <Image
                                style={{
                                    width: "25%",
                                    height: "50%",
                                    backgroundColor: COLORS.lightBlue,
                                    objectFit: "fill",
                                    margin: 5,
                                    borderRadius: 10,
                                }}
                                source={
                                    service?.birthCenter.pictureUrl
                                        ? { uri: service?.birthCenter.pictureUrl }
                                        : require("@/assets/images/service-icons/health-clinic.png")
                                }
                            />
                            {/* Clinic Details */}
                            <View style={{ gap: 3, width: "50%" }}>
                                <View>
                                    <Text style={{ fontSize: 15, fontWeight: "bold" }} numberOfLines={2}>
                                        {service?.birthCenter.name}
                                    </Text>
                                    <Text style={{ fontSize: 13 }} numberOfLines={2}>
                                        {service?.birthCenter.address}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", gap: 5 }}>
                                    <Ionicons size={15} name="star-half" color={"gold"} />
                                    <Text style={{ fontSize: 12, fontWeight: "bold" }}>4.5</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Calendar
                            onDayPress={(day: any) => {
                                setSelectedDate(day.dateString);
                                fetchTimeSlots(day.dateString);
                            }}
                            minDate={new Date().toISOString()}
                            disableAllTouchEventsForDisabledDays
                            markedDates={{
                                [selectedDate]: {
                                    selected: true,
                                    disableTouchEvent: true,
                                    marked: true,
                                },
                            }}
                            style={{
                                width: 400,
                                minHeight: 300,
                            }}
                            theme={{
                                textDayFontSize: 12,
                                textMonthFontSize: 14,
                                textDayHeaderFontSize: 12,
                            }}
                        />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: "bold", marginHorizontal: 10 }}>
                        Available Slots: <Text>{timeSlots.filter((slot) => slot.available).length}</Text>
                    </Text>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexDirection: "row",
                            gap: 5,
                            justifyContent: "center",
                            flexWrap: "wrap",
                            paddingBottom: 20,
                            paddingTop: 10,
                        }}
                    >
                        {timeSlots.length === 0 ? (
                            <Text style={{ fontSize: 13, marginHorizontal: 10, marginTop: 20, width: "80%", textAlign: "center" }}>
                                No available slots for this day. Please select another day.
                            </Text>
                        ) : (
                            timeSlots.map((data, index) => (
                                <TouchableOpacity
                                    key={index}
                                    disabled={!data.available}
                                    style={[styles.button, { borderColor: data.available ? COLORS.darkBlue : "lightgrey" }]}
                                    onPress={() => {
                                        setSelectedTime(data.value);
                                        setApptModalVisible(true);
                                    }}
                                >
                                    <Text style={{ color: data.available ? COLORS.darkBlue : "lightgrey" }}>{data.label}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
                <AppointmentModal
                    id={service?.id || null}
                    visible={apptModalVisible}
                    setVisible={setApptModalVisible}
                    appointmentDate={selectedTime}
                />
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
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
    },
    button: {
        backgroundColor: COLORS.white,
        borderRadius: 10,
        borderStyle: "solid",
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        width: 80,
        height: 50,
    },
    clinicContainer: {
        flexDirection: "row",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
});
