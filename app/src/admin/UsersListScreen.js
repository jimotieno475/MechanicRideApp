// File: src/Admin/UsersListScreen.js
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

export default function UsersListScreen() {
  const navigation = useNavigation();

  const usersData = [
    { id: 1, name: "John Otieno", email: "john.otieno@example.com", status: "Active", role: "user", createdAt: "2025-01-15T10:00:00Z" },
    { id: 2, name: "Mary Wanjiku", email: "mary.wanjiku@example.com", status: "Blocked", role: "user", createdAt: "2025-02-20T12:30:00Z" },
    { id: 3, name: "James Mwangi", email: "james.mwangi@example.com", status: "Active", role: "user", createdAt: "2025-01-10T09:15:00Z" },
    { id: 4, name: "Grace Achieng", email: "grace.achieng@example.com", status: "Active", role: "user", createdAt: "2025-03-01T15:45:00Z" },
    { id: 5, name: "Peter Njoroge", email: "peter.njoroge@example.com", status: "Blocked", role: "user", createdAt: "2025-02-05T11:20:00Z" },
    { id: 6, name: "Lucy Atieno", email: "lucy.atieno@example.com", status: "Active", role: "user", createdAt: "2025-01-25T17:30:00Z" },
    { id: 7, name: "Samuel Kiptoo", email: "samuel.kiptoo@example.com", status: "Active", role: "user", createdAt: "2025-03-05T07:50:00Z" },
    { id: 8, name: "Diana Wambui", email: "diana.wambui@example.com", status: "Blocked", role: "user", createdAt: "2025-02-14T14:10:00Z" },
    { id: 9, name: "Joseph Mutua", email: "joseph.mutua@example.com", status: "Active", role: "user", createdAt: "2025-01-18T19:40:00Z" },
    { id: 10, name: "Sarah Njoki", email: "sarah.njoki@example.com", status: "Active", role: "user", createdAt: "2025-02-25T21:00:00Z" },
    { id: 11, name: "Kevin Ochieng", email: "kevin.ochieng@example.com", status: "Blocked", role: "user", createdAt: "2025-01-08T08:25:00Z" },
    { id: 12, name: "Mercy Chebet", email: "mercy.chebet@example.com", status: "Active", role: "user", createdAt: "2025-03-02T13:55:00Z" },
    { id: 13, name: "David Kamau", email: "david.kamau@example.com", status: "Active", role: "user", createdAt: "2025-02-08T12:10:00Z" },
    { id: 14, name: "Ann Wairimu", email: "ann.wairimu@example.com", status: "Blocked", role: "user", createdAt: "2025-01-12T10:30:00Z" },
    { id: 15, name: "Michael Barasa", email: "michael.barasa@example.com", status: "Active", role: "admin", createdAt: "2025-01-01T08:00:00Z" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState(usersData);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="p-4 bg-gray-800 rounded-2xl mb-3 shadow-lg border border-gray-700">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-gray-400">{item.email}</Text>
          <View className="flex-row items-center mt-1">
            <Text
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                item.status === "Active"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              {item.status}
            </Text>
            <Text className="text-gray-500 ml-3 text-xs">
              Joined: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            className="bg-blue-500 p-2 rounded-xl mr-2"
            onPress={() => navigation.navigate("UserDetails", { userId: item.id })}
          >
            <Ionicons name="eye" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-500 p-2 rounded-xl"
            onPress={() => console.log(`Blocking user ${item.id}`)}
          >
            <Ionicons name="ban" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      {/* Header */}
      <Text className="text-white text-2xl font-extrabold mb-5">Users List</Text>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-800 rounded-full px-4 py-2 mb-5 border border-gray-700">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Search users..."
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
      {filteredUsers.length === 0 ? (
        <Text className="text-gray-400 text-center mt-10">No users found</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
