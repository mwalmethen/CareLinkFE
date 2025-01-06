import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const ProfileScreen = () => {
  const [lovedOnes, setLovedOnes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newLovedOne, setNewLovedOne] = useState({
    name: "",
    relation: "",
  });

  const addLovedOne = () => {
    if (newLovedOne.name && newLovedOne.relation) {
      setLovedOnes([...lovedOnes, newLovedOne]);
      setNewLovedOne({ name: "", relation: "" });
      setModalVisible(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=User&background=4a90e2&color=fff&size=120",
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton}>
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Icon name="person" size={24} color="#666" />
          <Text style={styles.infoLabel}>name</Text>
          <Text style={styles.infoValue}>Mohammed</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="phone" size={24} color="#666" />
          <Text style={styles.infoLabel}>phone number</Text>
          <Text style={styles.infoValue}>+965 12345678</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="email" size={24} color="#666" />
          <Text style={styles.infoLabel}>email</Text>
          <Text style={styles.infoValue}>mohammed@example.com</Text>
        </View>
      </View>

      <View style={styles.lovedOnesSection}>
        <View style={styles.sectionHeader}>
          <TextInput style={styles.sectionTitle}>loved ones</TextInput>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {lovedOnes.map((person, index) => (
          <View key={index} style={styles.lovedOneItem}>
            <Icon name="favorite" size={24} color="#ff6b6b" />
            <View>
              <Text style={styles.lovedOneName}>{person.name}</Text>
              <Text style={styles.lovedOneRelation}>{person.relation}</Text>
            </View>
          </View>
        ))}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>add loved one</Text>
            <TextInput
              style={styles.input}
              placeholder="name"
              value={newLovedOne.name}
              onChangeText={(text) =>
                setNewLovedOne({ ...newLovedOne, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="relation"
              value={newLovedOne.relation}
              onChangeText={(text) =>
                setNewLovedOne({ ...newLovedOne, relation: text })
              }
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButtonModal]}
                onPress={addLovedOne}
              >
                <Text style={styles.buttonText}>add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#4a90e2",
    padding: 8,
    borderRadius: 20,
  },
  infoSection: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    flex: 2,
  },
  lovedOnesSection: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4a90e2",
    padding: 8,
    borderRadius: 20,
  },
  lovedOneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  lovedOneName: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  lovedOneRelation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  addButtonModal: {
    backgroundColor: "#4a90e2",
  },
  cancelButton: {
    backgroundColor: "#ff6b6b",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
});

export default ProfileScreen;
