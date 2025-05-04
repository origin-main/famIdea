import { COLORS } from "@/components/constants";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as React from "react";
import { Image, View, StyleSheet, TouchableOpacity } from "react-native";
import { Divider, Modal, Portal, Text } from "react-native-paper";

interface MaternalDeliveryModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppointmentModal: React.FC<MaternalDeliveryModalProps> = ({
  visible,
  setVisible,
}) => {
  const hideModal = () => setVisible(false);

  //make dynamic
  const bulletPoints = [
    "Delivery costs, including natural spontaneous delivery (NSD) and cesarean section (CS)",
    "Room and board",
    "Meals",
    "Amenities",
    "Postnatal care",
    "Newborn care, including screening and hearing tests"
  ];

  return (
    <Modal
      style={styles.modal}
      visible={visible}
      onDismiss={hideModal}
      contentContainerStyle={styles.container}
    >
      <View>
        <Ionicons
          size={20}
          name="close"
          color={"grey"}
          onPress={hideModal}
          style={{ alignSelf: "flex-end", padding: 10 }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <View style={styles.button}>
            <Image
              style={styles.image}
              source={require("@/assets/images/service-icons/health-clinic.png")}
            />
          </View>
          <Text
            style={{ fontWeight: "bold", maxWidth: 150, textAlign: "center" }}
          >
            Sunshine Birth Center
          </Text>
        </View>
        <Divider style={{ marginVertical: 20 }}></Divider>
        <View>
          <Text style={{ fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
            June 25, 2025@ 02:00 PM
          </Text>
        </View>
        <Divider style={{ marginVertical: 10 }}></Divider>
        <View>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Service:
          </Text>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            MATERNAL DELIVERY PACKAGE
          </Text>
          {bulletPoints.map((point, index) => (
            <Text
              key={index}
              style={{ fontSize: 14, textAlign: "left", marginBottom: 5 }}
            >
              • {point}
            </Text>
          ))}
        </View>
      </View>
    </Modal>
  );
};

export default AppointmentModal;

const styles = StyleSheet.create({
  modal: {
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  image: {
    width: 50,
    height: 50,
  },
  button: {
    backgroundColor: COLORS.lightBlue,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
});
