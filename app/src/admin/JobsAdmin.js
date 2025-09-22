// File: src/Admin/JobsAdmin.js
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function JobsAdmin({ searchTerm = "" }) {
  const navigation = useNavigation();

  const bookings = [
    {
      id: 1,
      mechanicShop: "AutoFix Pro",
      mechanicContact: "+254700111111",
      customerName: "John Mwangi",
      customerContact: "+254701222222",
      service: "Flat Tire Replacement",
      status: "Pending",
      date: "2025-09-20T10:00:00Z",
    },
    {
      id: 2,
      mechanicShop: "Engine Masters",
      mechanicContact: "+254703333333",
      customerName: "Mary Atieno",
      customerContact: "+254704444444",
      service: "Engine Trouble Repair",
      status: "In Progress",
      date: "2025-09-21T14:30:00Z",
    },
    {
      id: 3,
      mechanicShop: "Quick Repair",
      mechanicContact: "+254705555555",
      customerName: "Peter Otieno",
      customerContact: "+254706666666",
      service: "Battery Replacement",
      status: "Completed",
      date: "2025-09-22T09:15:00Z",
    },
    {
      id: 4,
      mechanicShop: "BrakeFix Garage",
      mechanicContact: "+254707777777",
      customerName: "Lucy Akinyi",
      customerContact: "+254708888888",
      service: "Brake Pads Replacement",
      status: "Completed",
      date: "2025-09-23T11:45:00Z",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600";
      case "In Progress":
        return "bg-yellow-500";
      case "Pending":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mechanicShop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-xl mb-3 shadow-md">
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-bold text-lg">{item.mechanicShop}</Text>
        <Text
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
            item.status
          )} text-white`}
        >
          {item.status}
        </Text>
      </View>

      {/* Info */}
      <Text className="text-gray-300">📅 {new Date(item.date).toLocaleDateString()}</Text>
      <Text className="text-gray-300 mt-2">🛠 Service: {item.service}</Text>
      <Text className="text-gray-300 mt-1">👨‍🔧 Mechanic Contact: {item.mechanicContact}</Text>
      <Text className="text-gray-300 mt-1">👤 Customer: {item.customerName}</Text>
      <Text className="text-gray-300">📞 Customer Contact: {item.customerContact}</Text>

      {/* Actions */}
      <View className="flex-row mt-3">
        <TouchableOpacity
          className="flex-row items-center bg-blue-600 px-3 py-2 rounded-lg mr-3"
          onPress={() => navigation.navigate("JobDetails", { jobId: item.id })}
        >
          <Ionicons name="eye" size={18} color="white" />
          <Text className="text-white ml-2">View</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-gray-600 px-3 py-2 rounded-lg">
          <Ionicons name="create" size={18} color="white" />
          <Text className="text-white ml-2">Update Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      <Text className="text-white text-2xl font-extrabold mb-5">Jobs List</Text>

      {filteredBookings.length === 0 ? (
        <Text className="text-gray-400 text-center mt-10">No jobs found</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
