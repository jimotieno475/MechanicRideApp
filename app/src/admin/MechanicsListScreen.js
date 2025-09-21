import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MechanicsListScreen() {
  const navigation = useNavigation();

  const mechanics = [
    {
      id: 1,
      name: 'AutoFix Pro',
      email: 'autofix@example.com',
      specialties: ['Flat Tire', 'Battery'],
      location: { lat: 37.78825, lng: -122.4324 },
      status: 'Available',
      rating: 4.8,
      jobsCompleted: 120,
    },
    {
      id: 2,
      name: 'Engine Masters',
      email: 'engine.masters@example.com',
      specialties: ['Engine Trouble', 'Brake Issue'],
      location: { lat: 37.7749, lng: -122.4194 },
      status: 'Busy',
      rating: 4.5,
      jobsCompleted: 85,
    },
    {
      id: 3,
      name: 'Quick Repair',
      email: 'quick.repair@example.com',
      specialties: ['Flat Tire', 'Engine Trouble', 'Battery'],
      location: { lat: 37.7801, lng: -122.4100 },
      status: 'Available',
      rating: 4.9,
      jobsCompleted: 200,
    },
  ];

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-lg mb-2 shadow-md">
      <View>
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400">Specialties: {item.specialties.join(', ')}</Text>
        <Text className="text-gray-400">Status: {item.status}</Text>
        <Text className="text-gray-400">Rating: {item.rating} ({item.jobsCompleted} jobs)</Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity
          className="bg-blue-500 p-2 rounded mr-2"
          onPress={() => navigation.navigate('MechanicDetails', { mechanicId: item.id })}
        >
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-yellow-500 p-2 rounded"
          onPress={() => console.log(`Toggling status for mechanic ${item.id}`)} // Replace with status toggle logic
        >
          <Ionicons name="settings" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-white text-xl font-bold mb-4">Mechanics List</Text>
      {mechanics.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No mechanics found</Text>
      ) : (
        <FlatList
          data={mechanics}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}