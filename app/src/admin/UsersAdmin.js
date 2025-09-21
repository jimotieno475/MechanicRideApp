import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersAdmin({ searchTerm }) {
  const navigation = useNavigation();

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'Active',
      role: 'user',
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'Blocked',
      role: 'user',
      createdAt: '2025-02-20T12:30:00Z',
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@example.com',
      status: 'Active',
      role: 'admin',
      createdAt: '2025-01-01T08:00:00Z',
    },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-lg mb-2 shadow-md">
      <View>
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400">{item.email}</Text>
        <Text className="text-gray-400">Status: {item.status}</Text>
      </View>
      <TouchableOpacity
        className="bg-red-500 p-2 rounded flex-row items-center"
        onPress={() => console.log(`Blocking user ${item.id}`)}
      >
        <Ionicons name="ban" size={20} color="white" />
        <Text className="text-white ml-2">Block</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Text className="text-white text-xl font-bold mb-4">Users List</Text>
      {filteredUsers.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No users found</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}