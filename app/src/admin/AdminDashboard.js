import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../config';
import { useUser } from '../contexts/UserContext';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    total_users: 0,
    total_mechanics: 0,
    total_bookings: 0,
    active_bookings: 0,
    pending_bookings: 0,
    completed_bookings: 0,
    recent_bookings: 0
  });
  
  const navigation = useNavigation();
  const { admin, setAdmin } = useUser();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/admin/reports/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalyticsData(data.stats);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setAdmin(null); // Clear admin context
    navigation.replace('Login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Navigation handlers
  const navigateToUsers = () => {
    navigation.navigate('Users');
  };

  const navigateToMechanics = () => {
    navigation.navigate('Mechanics');
  };

  const navigateToJobs = () => {
    navigation.navigate('JobsAdmin');
  };

  const navigateToReports = () => {
    navigation.navigate('Reports');
  };

  const renderDashboard = () => (
    <View className="flex-1">
      <Text className="text-white text-xl font-bold mb-4">Dashboard Overview</Text>
      
      {/* Quick Stats */}
      <View className="flex-row flex-wrap justify-between mb-6">
        <TouchableOpacity 
          className="bg-gray-800 rounded-lg p-4 items-center w-[48%] mb-4"
          onPress={navigateToUsers}
        >
          <Ionicons name="people" size={24} color="#3B82F6" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.total_users}</Text>
          <Text className="text-gray-400 text-sm">Total Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-gray-800 rounded-lg p-4 items-center w-[48%] mb-4"
          onPress={navigateToMechanics}
        >
          <Ionicons name="construct" size={24} color="#10B981" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.total_mechanics}</Text>
          <Text className="text-gray-400 text-sm">Total Mechanics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-gray-800 rounded-lg p-4 items-center w-[48%]"
          onPress={navigateToJobs}
        >
          <Ionicons name="car" size={24} color="#F59E0B" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.total_bookings}</Text>
          <Text className="text-gray-400 text-sm">Total Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="bg-gray-800 rounded-lg p-4 items-center w-[48%]"
          onPress={navigateToReports}
        >
          <Ionicons name="bar-chart" size={24} color="#8B5CF6" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.active_bookings}</Text>
          <Text className="text-gray-400 text-sm">Active Bookings</Text>
        </TouchableOpacity>
      </View>

      {/* Status Breakdown */}
      <View className="bg-gray-800 rounded-lg p-4 mb-4">
        <Text className="text-white text-lg font-semibold mb-3">Booking Status</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Pending:</Text>
          <Text className="text-yellow-400 font-semibold">{analyticsData.pending_bookings}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-300">Active:</Text>
          <Text className="text-blue-400 font-semibold">{analyticsData.active_bookings}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-300">Completed:</Text>
          <Text className="text-green-400 font-semibold">{analyticsData.completed_bookings}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="bg-gray-800 rounded-lg p-4">
        <Text className="text-white text-lg font-semibold mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity 
            className="bg-blue-600 rounded-lg p-3 items-center w-[48%] mb-3"
            onPress={navigateToUsers}
          >
            <Ionicons name="people" size={20} color="white" />
            <Text className="text-white text-sm mt-1">Manage Users</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-green-600 rounded-lg p-3 items-center w-[48%] mb-3"
            onPress={navigateToMechanics}
          >
            <Ionicons name="construct" size={20} color="white" />
            <Text className="text-white text-sm mt-1">Manage Mechanics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-yellow-600 rounded-lg p-3 items-center w-[48%]"
            onPress={navigateToJobs}
          >
            <Ionicons name="car" size={20} color="white" />
            <Text className="text-white text-sm mt-1">View Jobs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-purple-600 rounded-lg p-3 items-center w-[48%]"
            onPress={navigateToReports}
          >
            <Ionicons name="document-text" size={20} color="white" />
            <Text className="text-white text-sm mt-1">Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 text-base">Loading Dashboard...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'Dashboard':
        return renderDashboard();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="p-4 border-b border-gray-700 bg-gray-800 flex-row justify-between items-center">
        <View>
          <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
          <Text className="text-gray-400 text-sm">Welcome back, {admin?.name || 'Admin'}</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4" onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Real-time Stats Cards */}
      <View className="flex-row justify-between px-4 py-3">
        <TouchableOpacity 
          className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1"
          onPress={navigateToUsers}
        >
          <Text className="text-white text-lg font-bold">{analyticsData.total_users}</Text>
          <Text className="text-gray-400 text-xs">Users</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1"
          onPress={navigateToMechanics}
        >
          <Text className="text-white text-lg font-bold">{analyticsData.total_mechanics}</Text>
          <Text className="text-gray-400 text-xs">Mechanics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1"
          onPress={navigateToJobs}
        >
          <Text className="text-white text-lg font-bold">{analyticsData.total_bookings}</Text>
          <Text className="text-gray-400 text-xs">Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1"
          onPress={navigateToReports}
        >
          <Text className="text-white text-lg font-bold">{analyticsData.active_bookings}</Text>
          <Text className="text-gray-400 text-xs">Active</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-800 mx-4 my-2 rounded-lg flex-row items-center border border-gray-700">
        <Ionicons name="search" size={20} color="#9CA3AF" className="mr-2" />
        <TextInput
          className="flex-1 text-white placeholder-gray-500"
          placeholder="Search across the system..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around bg-gray-800 mx-4 my-3 p-1 rounded-lg">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Dashboard' ? 'bg-white' : ''}`}
          onPress={() => setActiveTab('Dashboard')}
        >
          <Ionicons name="speedometer" size={20} color={activeTab === 'Dashboard' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Dashboard' ? 'text-black font-semibold' : 'text-gray-400'}`}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Users' ? 'bg-white' : ''}`}
          onPress={navigateToUsers}
        >
          <Ionicons name="people" size={20} color={activeTab === 'Users' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Users' ? 'text-black font-semibold' : 'text-gray-400'}`}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Jobs' ? 'bg-white' : ''}`}
          onPress={navigateToJobs}
        >
          <Ionicons name="car" size={20} color={activeTab === 'Jobs' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Jobs' ? 'text-black font-semibold' : 'text-gray-400'}`}>Jobs</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View className="h-4" /> {/* Spacer at bottom */}
      </ScrollView>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <View className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center px-4">
          <View className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <Text className="text-white text-lg font-bold mb-2">Confirm Logout</Text>
            <Text className="text-gray-300 mb-6">Are you sure you want to log out?</Text>
            <View className="flex-row justify-end">
              <TouchableOpacity 
                className="px-4 py-2 mr-3 rounded bg-gray-700" 
                onPress={cancelLogout}
              >
                <Text className="text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="px-4 py-2 rounded bg-red-600" 
                onPress={confirmLogout}
              >
                <Text className="text-white">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}