// File: src/Mechanic/ContactSupportScreen.js
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";

export default function ContactSupportScreen() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message before sending.");
      return;
    }
    Alert.alert("Support Request Sent", "Our support team will get back to you shortly.");
    setMessage("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-14 pb-5 bg-black">
        <Text className="text-2xl font-bold text-white">Contact Support</Text>
        <Text className="text-gray-300 mt-1">We’re here to help you</Text>
      </View>

      <View className="flex-1 px-5 py-6">
        <Text className="text-base text-gray-700 mb-3">
          Describe your issue or question below, and our support team will reach out to you via email or phone.
        </Text>

        <TextInput
          className="border border-gray-300 rounded-lg p-4 text-base text-black h-40"
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          onPress={handleSend}
          className="bg-black p-4 rounded-lg mt-6"
        >
          <Text className="text-white text-center font-semibold text-base">
            Send Message
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
