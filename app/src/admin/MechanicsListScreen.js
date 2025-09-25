// File: src/Admin/MechanicsListScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";

export default function MechanicsListScreen() {
  const navigation = useNavigation();
  const { admin } = useUser();
  
  const [mechanics, setMechanics] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch mechanics from backend
  const fetchMechanics = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/mechanics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const mechanicsData = await response.json();
      setMechanics(mechanicsData);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      Alert.alert("Error", "Failed to fetch mechanics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Block/Unblock mechanic
// In your MechanicsListScreen.js - update the toggleMechanicStatus function
const toggleMechanicStatus = async (mechanicId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const response = await fetch(`${API_URL}/admin/mechanics/${mechanicId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        status: newStatus,
        admin_id: admin?.id // Pass admin ID for audit logging
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle active bookings error
      if (errorData.active_bookings) {
        Alert.alert(
          "Cannot Block Mechanic",
          `This mechanic has ${errorData.active_bookings} active bookings. Please wait for them to complete or reassign them before blocking.`,
          [{ text: "OK" }]
        );
        return;
      }
      
      throw new Error(errorData.error || "Failed to update status");
    }

    // Update local state
    setMechanics(mechanics.map(mechanic => 
      mechanic.id === mechanicId ? { ...mechanic, status: newStatus } : mechanic
    ));

    Alert.alert("Success", `Mechanic ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error("Error updating mechanic status:", error);
    Alert.alert("Error", error.message || "Failed to update mechanic status");
  }
};

  // Initial load
  useEffect(() => {
    fetchMechanics();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchMechanics();
  };

  // Filter mechanics based on search
  const filteredMechanics = mechanics.filter(
    (mechanic) =>
      mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.garage_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.garage_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mechanic.services_offered?.some(service => 
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-2xl mb-3 shadow-lg border border-gray-700">
      <View className="flex-row justify-between items-start">
        {/* Left Section */}
        <View className="flex-1 pr-2">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.email}</Text>
          <Text className="text-gray-400 text-sm">
            Garage: {item.garage_name || 'N/A'}
          </Text>
          <Text className="text-gray-400 text-sm">
            Location: {item.garage_location || 'N/A'}
          </Text>
          
          {/* Services */}
          <Text className="text-gray-400 text-sm mt-1">
            Services: {item.services_offered?.map(s => s.name).join(", ") || 'None'}
          </Text>

          {/* Stats and Status */}
          <View className="flex-row items-center mt-2 space-x-3">
            <Text
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                item.status === "active"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {item.status === "active" ? "Active" : "Inactive"}
            </Text>
            
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="gold" />
              <Text className="text-gray-300 ml-1 text-xs">4.8</Text>
            </View>
            
            <Text className="text-gray-500 text-xs">
              Jobs: {item.total_bookings || 0}
            </Text>
            
            <Text className="text-gray-500 text-xs">
              Completed: {item.completed_bookings || 0}
            </Text>
          </View>
          
          {/* Join Date */}
          <Text className="text-gray-500 text-xs mt-1">
            Joined: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Actions */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-xl"
            onPress={() => navigation.navigate("MechanicDetails", { mechanicId: item.id })}
          >
            <Ionicons name="eye" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-3 rounded-xl ${
              item.status === "active" ? "bg-red-500" : "bg-green-500"
            }`}
            onPress={() => toggleMechanicStatus(item.id, item.status)}
          >
            <Ionicons 
              name={item.status === "active" ? "ban" : "checkmark-circle"} 
              size={18} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Loading mechanics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-white text-2xl font-extrabold">Mechanics List</Text>
        <Text className="text-gray-400">Total: {mechanics.length}</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-3 mb-5 border border-gray-700">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search mechanics by name, email, or services..."
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
            {mechanics.filter(m => m.status === 'active').length}
          </Text>
          <Text className="text-gray-400 text-xs">Active</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {mechanics.filter(m => m.status === 'inactive').length}
          </Text>
          <Text className="text-gray-400 text-xs">Inactive</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {mechanics.reduce((total, mechanic) => total + (mechanic.total_bookings || 0), 0)}
          </Text>
          <Text className="text-gray-400 text-xs">Total Jobs</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {mechanics.reduce((total, mechanic) => total + (mechanic.completed_bookings || 0), 0)}
          </Text>
          <Text className="text-gray-400 text-xs">Completed</Text>
        </View>
      </View>

      {/* List */}
      {filteredMechanics.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="construct-outline" size={64} color="gray" />
          <Text className="text-gray-400 text-center mt-4 text-lg">
            {searchQuery ? "No mechanics match your search" : "No mechanics found"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-full mt-3"
              onPress={fetchMechanics}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredMechanics}
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