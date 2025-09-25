// File: src/Admin/UsersListScreen.js
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

export default function UsersListScreen() {
  const navigation = useNavigation();
  const { admin } = useUser();
  
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Block/Unblock user
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      Alert.alert("Success", `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating user status:", error);
      Alert.alert("Error", "Failed to update user status");
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-2xl mb-3 shadow-lg border border-gray-700">
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-400 text-sm">{item.email}</Text>
          <Text className="text-gray-400 text-sm">Phone: {item.phone || 'N/A'}</Text>
          
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
            <Text className="text-gray-500 text-xs">
              Bookings: {item.bookings_count || 0}
            </Text>
            <Text className="text-gray-500 text-xs">
              Joined: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-xl"
            onPress={() => navigation.navigate("UserDetails", { userId: item.id })}
          >
            <Ionicons name="eye" size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className={`p-3 rounded-xl ${
              item.status === "active" ? "bg-red-500" : "bg-green-500"
            }`}
            onPress={() => toggleUserStatus(item.id, item.status)}
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
        <Text className="text-white mt-4">Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-5">
        <Text className="text-white text-2xl font-extrabold">Users List</Text>
        <Text className="text-gray-400">Total: {users.length}</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-3 mb-5 border border-gray-700">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search users by name or email..."
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
            {users.filter(u => u.status === 'active').length}
          </Text>
          <Text className="text-gray-400 text-xs">Active</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {users.filter(u => u.status === 'inactive').length}
          </Text>
          <Text className="text-gray-400 text-xs">Inactive</Text>
        </View>
        <View className="items-center">
          <Text className="text-white text-lg font-bold">
            {users.reduce((total, user) => total + (user.bookings_count || 0), 0)}
          </Text>
          <Text className="text-gray-400 text-xs">Total Bookings</Text>
        </View>
      </View>

      {/* List */}
      {filteredUsers.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="people-outline" size={64} color="gray" />
          <Text className="text-gray-400 text-center mt-4 text-lg">
            {searchQuery ? "No users match your search" : "No users found"}
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              className="bg-blue-500 px-4 py-2 rounded-full mt-3"
              onPress={fetchUsers}
            >
              <Text className="text-white">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
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