import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function JobsAdmin({ searchTerm }) {
  const navigation = useNavigation();

  const bookings = [
    {
      id: 1,
      userId: 1,
      mechanicId: 1,
      date: '2025-09-20T10:00:00Z',
      location: { lat: 37.78825, lng: -122.4324 },
      issue: 'Flat tire',
      status: 'Pending',
    },
    {
      id: 2,
      userId: 2,
      mechanicId: 2,
      date: '2025-09-21T14:30:00Z',
      location: { lat: 37.7749, lng: -122.4194 },
      issue: 'Engine trouble',
      status: 'In Progress',
    },
    {
      id: 3,
      userId: 1,
      mechanicId: 3,
      date: '2025-09-22T09:15:00Z',
      location: { lat: 37.7801, lng: -122.4100 },
      issue: 'Battery issue',
      status: 'Completed',
    },
  ];

  const filteredBookings = bookings.filter(booking =>
    booking.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-lg mb-2 shadow-md">
      <View>
        <Text className="text-white font-semibold">Job #{item.id}</Text>
        <Text className="text-gray-400">Issue: {item.issue}</Text>
        <Text className="text-gray-400">Status: {item.status}</Text>
        <Text className="text-gray-400">{new Date(item.date).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        className="bg-blue-500 p-2 rounded"
        onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
      >
        <Ionicons name="eye" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Text className="text-white text-xl font-bold mb-4">Jobs List</Text>
      {filteredBookings.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No jobs found</Text>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}