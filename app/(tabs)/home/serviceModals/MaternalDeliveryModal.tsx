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

const MaternalDeliveryModal: React.FC<MaternalDeliveryModalProps> = ({
  visible,
  setVisible,
}) => {
  const hideModal = () => setVisible(false);

  const bulletPoints = [
    "Starts as early as possible in pregnancy",
    "Helps reduce the risk of complications",
    "Includes regular visits with a doctor",
    "Includes healthy habits like eating well, exercising, and avoiding harmful substances",
    "Helps control existing conditions like diabetes and high blood pressure",
  ];

  const postNatalCarePoints = [
    "Also called postpartum care",
    "Helps new mothers adjust to physical, social, and psychological changes after giving birth",
    "Includes iron and folic acid supplements, prophylactic antibiotics, and psychosocial support",
    "Begins soon after birth and lasts until the mother's body has returned to nearly pre-pregnant state",
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
              source={require("@/assets/images/service-icons/pediatrics.png")}
            />
          </View>
          <Text
            style={{ fontWeight: "bold", maxWidth: 150, textAlign: "center" }}
          >
            Prenatal and Postpartum Care
          </Text>
        </View>
        <Divider style={{ marginVertical: 20 }}></Divider>
        <View>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Prenatal Care
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
        <Divider style={{ marginVertical: 10 }}></Divider>
        <View>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Postnatal Care
          </Text>
          {postNatalCarePoints.map((point, index) => (
            <Text
              key={index}
              style={{ fontSize: 14, textAlign: "left", marginBottom: 5 }}
            >
              • {point}
            </Text>
          ))}
        </View>
        <View
          style={{
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.lightBlue,
              width: 200,
              alignItems: "center",
              borderRadius: 10,
            }}
            onPress={() => {
              router.push("/home/schedule-appointment");
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 15,
                  padding: 10,
                  textAlign: "center",
                }}
              >
                Schedule Appointment
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MaternalDeliveryModal;

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
