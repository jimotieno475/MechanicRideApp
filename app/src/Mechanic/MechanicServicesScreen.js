// File: src/Mechanic/MechanicServicesScreen.js
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";

export default function MechanicServicesScreen() {
  const [services, setServices] = useState([
    "Oil Change",
    "Brake Repair",
    "Engine Diagnostics",
  ]);
  const [newService, setNewService] = useState("");

  const addService = () => {
    if (newService.trim() !== "") {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 pt-4 mb-6">
        <Text className="text-2xl font-bold text-black">My Services</Text>
        <Text className="text-gray-500 mt-1">
          Manage the services you offer
        </Text>
      </View>

      {/* List of services */}
      <FlatList
        data={services}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 mx-4 mb-3 shadow">
            <Text className="text-gray-800 text-lg">{item}</Text>
          </View>
        )}
      />

      {/* Add new service */}
      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-200">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
          placeholder="Add new service"
          value={newService}
          onChangeText={setNewService}
        />
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={addService}
        >
          <Text className="text-white font-bold">Add</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
