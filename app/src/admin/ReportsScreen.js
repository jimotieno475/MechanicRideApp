// File: src/Admin/ReportsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ReportsScreen() {
  const navigation = useNavigation();

  const [analytics, setAnalytics] = useState({
    totalUsers: 100,
    totalMechanics: 50,
    totalBookings: 20,
    activeBookings: 5,
    fraudReports: [
      {
        id: 1,
        mechanicId: 2,
        userName: "Jane Smith",
        reason: "Fraudulent payment attempt",
        reportedAt: "2025-09-10T12:00:00Z",
        status: "Pending",
      },
      {
        id: 2,
        mechanicId: 1,
        userName: "John Doe",
        reason: "False booking report",
        reportedAt: "2025-09-15T15:00:00Z",
        status: "Pending",
      },
      {
        id: 3,
        mechanicId: 4,
        userName: "Mary Wanjiku",
        reason: "Mechanic charged extra without approval",
        reportedAt: "2025-09-18T09:30:00Z",
        status: "Pending",
      },
      {
        id: 4,
        mechanicId: 5,
        userName: "Peter Otieno",
        reason: "Mechanic failed to show up after payment",
        reportedAt: "2025-09-19T11:20:00Z",
        status: "Pending",
      },
      {
        id: 5,
        mechanicId: 6,
        userName: "Lucy Akinyi",
        reason: "Mechanic used fake parts in repair",
        reportedAt: "2025-09-20T17:45:00Z",
        status: "Pending",
      },
    ],
  });

  // Block mechanic
  const blockMechanic = (reportId, mechanicId) => {
    Alert.alert(
      "Confirm Block",
      "Are you sure you want to block this mechanic due to a verified fraud report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => {
            setAnalytics((prev) => ({
              ...prev,
              fraudReports: prev.fraudReports.map((r) =>
                r.id === reportId ? { ...r, status: "Blocked" } : r
              ),
            }));
            console.log(`Mechanic ${mechanicId} blocked`);
          },
        },
      ]
    );
  };

  // Dismiss report
  const dismissReport = (reportId) => {
    setAnalytics((prev) => ({
      ...prev,
      fraudReports: prev.fraudReports.map((r) =>
        r.id === reportId ? { ...r, status: "Dismissed" } : r
      ),
    }));
  };

  const renderFraudReport = ({ item }) => (
    <View className="p-4 border border-gray-700 bg-gray-800 rounded-lg mb-3 shadow-md">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-semibold">{item.userName}</Text>
        <Text
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            item.status === "Blocked"
              ? "bg-red-600 text-white"
              : item.status === "Dismissed"
              ? "bg-gray-500 text-white"
              : "bg-yellow-500 text-black"
          }`}
        >
          {item.status}
        </Text>
      </View>
      <Text className="text-gray-300">{item.reason}</Text>
      <Text className="text-gray-500 text-sm mt-1">
        {new Date(item.reportedAt).toLocaleDateString()}
      </Text>

      {/* Actions */}
      {item.status === "Pending" && (
        <View className="flex-row mt-3">
          <TouchableOpacity
            className="flex-row items-center bg-red-600 px-3 py-2 rounded-lg mr-3"
            onPress={() => blockMechanic(item.id, item.mechanicId)}
          >
            <Ionicons name="ban" size={18} color="white" />
            <Text className="text-white ml-2 font-semibold">Block Mechanic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center bg-gray-600 px-3 py-2 rounded-lg"
            onPress={() => dismissReport(item.id)}
          >
            <Ionicons name="close-circle" size={18} color="white" />
            <Text className="text-white ml-2 font-semibold">Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 p-5 bg-black">
      <Text className="text-white text-2xl font-extrabold mb-5">Reports Dashboard</Text>

      {/* Analytics Overview */}
      <View className="flex-row flex-wrap justify-between mb-6">

        <TouchableOpacity
          onPress={() => navigation.navigate('Users')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
        <View>
          <Ionicons name="people" size={22} color="white" />
          <Text className="text-white font-bold mt-2">{analytics.totalUsers}</Text>
          <Text className="text-gray-400 text-sm">Total Users</Text>
        </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Mechanics')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
        <View >
          <Ionicons name="construct" size={22} color="white" />
          <Text className="text-white font-bold mt-2">{analytics.totalMechanics}</Text>
          <Text className="text-gray-400 text-sm">Total Mechanics</Text>
        </View>
        </TouchableOpacity>
        {/* Make Total Bookings Clickable */}
        <TouchableOpacity
          onPress={() => navigation.navigate('JobsAdmin')}
          className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3"
        >
        <View >
          <Ionicons name="car" size={22} color="white" />
          <Text className="text-white font-bold mt-2">{analytics.totalBookings}</Text>
          <Text className="text-gray-400 text-sm">Total Bookings</Text>
        </View>
        </TouchableOpacity>
        <View className="w-[48%] bg-gray-800 p-4 rounded-xl mb-3">
          <Ionicons name="time" size={22} color="white" />
          <Text className="text-white font-bold mt-2">{analytics.activeBookings}</Text>
          <Text className="text-gray-400 text-sm">Active Bookings</Text>
        </View>
      </View>

      {/* Fraud Reports */}
      <Text className="text-white text-lg font-semibold mb-3">Fraud Reports</Text>
      {analytics.fraudReports.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No fraud reports found</Text>
      ) : (
        <FlatList
          data={analytics.fraudReports}
          renderItem={renderFraudReport}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
