import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportsScreen() {
  const navigation = useNavigation();

  const analytics = {
    totalUsers: 100,
    totalMechanics: 50,
    totalBookings: 20,
    activeBookings: 5,
    fraudReports: [
      {
        id: 1,
        userId: 2,
        userName: 'Jane Smith',
        reason: 'Fraudulent payment attempt',
        reportedAt: '2025-09-10T12:00:00Z',
      },
      {
        id: 2,
        userId: 1,
        userName: 'John Doe',
        reason: 'False booking report',
        reportedAt: '2025-09-15T15:00:00Z',
      },
    ],
  };

  const renderFraudReport = ({ item }) => (
    <View className="p-4 border-b border-gray-700 bg-gray-800 rounded-lg mb-2 shadow-md">
      <Text className="text-white font-semibold">{item.userName}</Text>
      <Text className="text-gray-400">{item.reason}</Text>
      <Text className="text-gray-400">{new Date(item.reportedAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 p-4 bg-black">
      <Text className="text-white text-xl font-bold mb-4">Reports</Text>
      <View className="mb-4 bg-gray-800 p-4 rounded-lg shadow-md">
        <Text className="text-gray-400">Total Users: {analytics.totalUsers}</Text>
        <Text className="text-gray-400">Total Mechanics: {analytics.totalMechanics}</Text>
        <Text className="text-gray-400">Total Bookings: {analytics.totalBookings}</Text>
        <Text className="text-gray-400">Active Bookings: {analytics.activeBookings}</Text>
      </View>
      <Text className="text-white text-lg font-semibold mb-2">Fraud Reports</Text>
      {analytics.fraudReports.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No fraud reports found</Text>
      ) : (
        <FlatList
          data={analytics.fraudReports}
          renderItem={renderFraudReport}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}