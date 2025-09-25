// File: src/Admin/JobsAdmin.js
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";

export default function JobsAdmin({ searchTerm = "" }) {
  const navigation = useNavigation();
  const { admin } = useUser();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchTerm);

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/bookings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const bookingsData = await response.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to fetch bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          action: newStatus,
          admin_id: admin?.id 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      Alert.alert("Success", `Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      Alert.alert("Error", "Failed to update booking status");
    }
  };

  // Show status update options
  const showStatusOptions = (bookingId, currentStatus) => {
    const statusOptions = [
      { label: "Pending", value: "Pending" },
      { label: "Accepted", value: "Accepted" },
      { label: "Rejected", value: "Rejected" },
      { label: "Completed", value: "Completed" }
    ].filter(option => option.value !== currentStatus);

    Alert.alert(
      "Update Status",
      "Select new status:",
      statusOptions.map(option => ({
        text: option.label,
        onPress: () => updateBookingStatus(bookingId, option.value)
      }))
    );
  };

  // Initial load
  useEffect(() => {
    fetchBookings();
  }, []);

  // Update search when prop changes
  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600";
      case "Accepted":
        return "bg-blue-500";
      case "Pending":
        return "bg-yellow-500";
      case "Rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Accepted": return "In Progress";
      case "Pending": return "Pending";
      case "Completed": return "Completed";
      case "Rejected": return "Cancelled";
      default: return status;
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.mechanic?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-xl mb-3 shadow-md border border-gray-700">
      {/* Top Row */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white font-bold text-lg">
          {item.mechanic?.garage_name || item.mechanic?.name || "Unknown Garage"}
        </Text>
        <Text
          className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
            item.status
          )} text-white`}
        >
          {getStatusText(item.status)}
        </Text>
      </View>

      {/* Booking Info */}
      <Text className="text-gray-300 text-sm">
        📅 {new Date(item.created_at).toLocaleDateString()} at{" "}
        {new Date(item.created_at).toLocaleTimeString()}
      </Text>
      
      <Text className="text-gray-300 mt-2">🛠 Service: {item.type}</Text>
      <Text className="text-gray-300 mt-1">📍 Location: {item.location}</Text>
      
      <Text className="text-gray-300 mt-2">
        👨‍🔧 Mechanic: {item.mechanic?.name || "N/A"}
      </Text>
      <Text className="text-gray-300">
        📞 Mechanic Contact: {item.mechanic?.phone || "N/A"}
      </Text>
      
      <Text className="text-gray-300 mt-2">
        👤 Customer: {item.customer?.name || "N/A"}
      </Text>
      <Text className="text-gray-300">
        📞 Customer Contact: {item.customer?.phone || "N/A"}
      </Text>

      {/* Coordinates */}
      <Text className="text-gray-500 text-xs mt-2">
        📍 Coordinates: {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
      </Text>

      {/* Last Updated */}
      {item.updated_at && (
        <Text className="text-gray-500 text-xs mt-1">
          🔄 Updated: {new Date(item.updated_at).toLocaleString()}
        </Text>
      )}

      {/* Actions */}
      <View className="flex-row mt-3 space-x-2">
        <TouchableOpacity
          className="flex-row items-center bg-blue-600 px-3 py-2 rounded-lg flex-1 justify-center"
          onPress={() => navigation.navigate("Maps", { bookingId: item.id })}
        >
          <Ionicons name="map" size={16} color="white" />
          <Text className="text-white ml-2 text-sm">View on Map</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center bg-yellow-600 px-3 py-2 rounded-lg flex-1 justify-center"
          onPress={() => showStatusOptions(item.id, item.status)}
        >
          <Ionicons name="create" size={16} color="white" />
          <Text className="text-white ml-2 text-sm">Update Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading bookings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-white text-2xl font-extrabold">Jobs List</Text>
        <Text className="text-gray-400">Total: {bookings.length}</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-3 mb-5 border border-gray-700">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search by service, customer, mechanic, or status..."
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

      {/* Stats Summary */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {bookings.filter(b => b.status === 'Pending').length}
          </Text>
          <Text className="text-gray-400 text-xs">Pending</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {bookings.filter(b => b.status === 'Accepted').length}
          </Text>
          <Text className="text-gray-400 text-xs">In Progress</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {bookings.filter(b => b.status === 'Completed').length}
          </Text>
          <Text className="text-gray-400 text-xs">Completed</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {bookings.filter(b => b.status === 'Rejected').length}
          </Text>
          <Text className="text-gray-400 text-xs">Cancelled</Text>
        </View>
      </View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="car-outline" size={64} color="gray" />
          <Text className="text-gray-400 text-center mt-4 text-lg">
            {searchQuery ? "No bookings match your search" : "No bookings found"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-full mt-3"
              onPress={fetchBookings}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
              colors={["#fff"]}
            />
          }
          ListFooterComponent={<View className="h-10" />}
        />
      )}
    </SafeAreaView>
  );
}