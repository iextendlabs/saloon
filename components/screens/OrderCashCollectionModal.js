import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  Image,
  Platform 
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker library

import OrderListStyle from "../styles/OrderListStyle";
import { OrderCashCollectionUrl } from "../config/Api";
import axios from "axios";

const OrderCashCollectionModal = ({ visible, order, onClose }) => {
  const [selectedOrder, setSelectedOrder] = useState(order);
  const [description, setDescription] = useState("Cash Collected");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState(null); // State for the selected image
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleModalClose = () => {
    onClose();
  };

  const selectImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result);
    }
  };

  const handleSubmitCashCollection = async () => {
    if (description.trim() === "" || amount.trim() === "" || !image) {
      setErrorMessage(
        "Please enter a description, an amount, and select an image."
      );
      return;
    }

    setIsLoading(true);
    const userId = await AsyncStorage.getItem("@user_id");
      const formData = new FormData();
      if (image) {
        formData.append("image", image.uri);
      }
      
      formData.append("order_id", order.id);
      formData.append("description", description);
      formData.append("amount", amount);
      formData.append("user_id", userId);

      const response = await axios.post(OrderCashCollectionUrl,formData,{
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
      });
      
      if (response.status === 200) {
        setSuccessMessage("Request submitted. Awaiting admin approval!");
        setDescription("");
        setAmount("");
        setImage(null);
        onClose();
      } else {
        throw new Error("Failed to cash collection.");
      }
    
    setIsLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Submit Cash</Text>
          <ScrollView>
            {order && (
              <View style={styles.orderDetails}>
                <Text>Total Amount: {order.total_amount}</Text>
              </View>
            )}
            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>Description:</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter your description"
                multiline
              />
              <Text style={styles.label}>Amount:</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter the amount"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Image:</Text>
              <TouchableOpacity
                style={styles.fileInputContainer}
                onPress={selectImage}
              >
                <Text style={styles.fileInputText}>
                  Select an image
                </Text>
              </TouchableOpacity>
              {image && (
                <Image
                  source={{ uri: image.uri }}
                  style={styles.selectedImage}
                />
              )}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitCashCollection}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
              {successMessage !== "" && (
                <Text style={styles.successMessage}>{successMessage}</Text>
              )}
              {errorMessage !== "" && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleModalClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create(OrderListStyle);

export default OrderCashCollectionModal;
