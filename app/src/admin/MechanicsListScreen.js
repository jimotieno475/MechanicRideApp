// File: src/Admin/MechanicsListScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MechanicsListScreen() {
  const navigation = useNavigation();

  const mechanicsData = [
    {
      id: 1,
      name: "Otieno AutoFix",
      email: "otieno.autofix@example.com",
      specialties: ["Flat Tire", "Battery", "Oil Change"],
      status: "Available",
      rating: 4.7,
      jobsCompleted: 150,
    },
    {
      id: 2,
      name: "Karanja Motors",
      email: "karanja.motors@example.com",
      specialties: ["Engine Trouble", "Brake Issue", "Suspension"],
      status: "Busy",
      rating: 4.5,
      jobsCompleted: 95,
    },
    {
      id: 3,
      name: "Mwangi Garage",
      email: "mwangi.garage@example.com",
      specialties: ["Electrical Work", "Transmission", "AC Service"],
      status: "Available",
      rating: 4.8,
      jobsCompleted: 180,
    },
    {
      id: 4,
      name: "Achieng Quick Repair",
      email: "achieng.quick@example.com",
      specialties: ["Flat Tire", "Battery", "Engine Trouble"],
      status: "Available",
      rating: 4.9,
      jobsCompleted: 220,
    },
    {
      id: 5,
      name: "Mutua Mechanics",
      email: "mutua.mech@example.com",
      specialties: ["Brake Issue", "Suspension", "Wheel Alignment"],
      status: "Busy",
      rating: 4.3,
      jobsCompleted: 75,
    },
    {
      id: 6,
      name: "Chebet AutoCare",
      email: "chebet.autocare@example.com",
      specialties: ["Oil Change", "AC Service", "Battery"],
      status: "Available",
      rating: 4.6,
      jobsCompleted: 130,
    },
    {
      id: 7,
      name: "Kamau Auto Garage",
      email: "kamau.garage@example.com",
      specialties: ["Engine Trouble", "Transmission", "Electrical Work"],
      status: "Available",
      rating: 4.4,
      jobsCompleted: 90,
    },
    {
      id: 8,
      name: "Njeri Motors",
      email: "njeri.motors@example.com",
      specialties: ["Suspension", "Brake Issue", "Wheel Alignment"],
      status: "Busy",
      rating: 4.2,
      jobsCompleted: 65,
    },
    {
      id: 9,
      name: "Omondi Car Repair",
      email: "omondi.repair@example.com",
      specialties: ["Battery", "Flat Tire", "Oil Change"],
      status: "Available",
      rating: 4.7,
      jobsCompleted: 140,
    },
    {
      id: 10,
      name: "Wanjiku AutoMasters",
      email: "wanjiku.automaster@example.com",
      specialties: ["Engine Trouble", "Suspension", "Electrical Work"],
      status: "Available",
      rating: 4.9,
      jobsCompleted: 250,
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [mechanics] = useState(mechanicsData);

  const filteredMechanics = mechanics.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.specialties.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-2xl mb-3 shadow-lg border border-gray-700">
      <View className="flex-row justify-between items-center">
        {/* Left Section */}
        <View className="flex-1 pr-2">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.email}</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Specialties: {item.specialties.join(", ")}
          </Text>

          {/* Status + Rating */}
          <View className="flex-row items-center mt-2">
            <Text
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                item.status === "Available"
                  ? "bg-green-600 text-white"
                  : "bg-yellow-600 text-black"
              }`}
            >
              {item.status}
            </Text>
            <View className="flex-row items-center ml-3">
              <Ionicons name="star" size={14} color="gold" />
              <Text className="text-gray-300 ml-1 text-sm">
                {item.rating} ({item.jobsCompleted} jobs)
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row">
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-xl mr-2"
            onPress={() =>
              navigation.navigate("MechanicDetails", { mechanicId: item.id })
            }
          >
            <Ionicons name="eye" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-yellow-500 p-2 rounded-xl"
            onPress={() => console.log(`Toggling status for ${item.id}`)}
          >
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      {/* Header */}
      <Text className="text-white text-2xl font-extrabold mb-5">
        Mechanics List
      </Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-2 mb-5 border border-gray-700">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search mechanics..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 text-white ml-2"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      {filteredMechanics.length === 0 ? (
        <Text className="text-gray-400 text-center mt-10">
          No mechanics found
        </Text>
      ) : (
        <FlatList
          data={filteredMechanics}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
