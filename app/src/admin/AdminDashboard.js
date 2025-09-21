import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity,  TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Users');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigation = useNavigation();

  

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Simulate loading on tab switch
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

const confirmLogout = () => {
  setShowLogoutConfirm(false);
  // Navigate to Login screen
  navigation.replace('Login'); 
};


  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Mock data for demonstration
  const usersData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'Mechanic', status: 'Inactive' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'User', status: 'Active' },
    { id: 5, name: 'Michael Wilson', email: 'michael@example.com', role: 'Mechanic', status: 'Active' },
  ];

  const jobsData = [
    { id: 1, title: 'Oil Change', customer: 'John Doe', mechanic: 'Robert Johnson', status: 'Completed', date: '2023-06-15' },
    { id: 2, title: 'Brake Repair', customer: 'Jane Smith', mechanic: 'Michael Wilson', status: 'In Progress', date: '2023-06-16' },
    { id: 3, title: 'Tire Rotation', customer: 'Emily Davis', mechanic: 'Robert Johnson', status: 'Scheduled', date: '2023-06-17' },
    { id: 4, title: 'Engine Diagnostic', customer: 'Michael Wilson', mechanic: 'Robert Johnson', status: 'Pending', date: '2023-06-18' },
  ];

  const analyticsData = {
    totalUsers: 124,
    activeJobs: 18,
    completedJobs: 342,
    revenue: '$12,458',
  };

  // Filter data based on search term
  const filteredUsers = usersData.filter(user => 
    user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const filteredJobs = jobsData.filter(job => 
    job.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    job.customer.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    job.mechanic.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const renderUsers = () => (
    <View className="flex-1">
      <Text className="text-white text-xl font-bold mb-4">User Management</Text>
      {filteredUsers.map(user => (
        <View key={user.id} className="bg-gray-800 rounded-lg p-4 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-base font-semibold">{user.name}</Text>
            <View className={`px-2 py-1 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}>
              <Text className="text-white text-xs font-medium">{user.status}</Text>
            </View>
          </View>
          <Text className="text-gray-300 text-sm">{user.email}</Text>
          <Text className="text-gray-400 text-sm mt-1">Role: {user.role}</Text>
        </View>
      ))}
    </View>
  );

  const renderJobs = () => (
    <View className="flex-1">
      <Text className="text-white text-xl font-bold mb-4">Job Management</Text>
      {filteredJobs.map(job => (
        <View key={job.id} className="bg-gray-800 rounded-lg p-4 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-white text-base font-semibold">{job.title}</Text>
            <View className={`px-2 py-1 rounded-full ${
              job.status === 'Completed' ? 'bg-green-500' : 
              job.status === 'In Progress' ? 'bg-blue-500' : 
              job.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}>
              <Text className="text-white text-xs font-medium">{job.status}</Text>
            </View>
          </View>
          <Text className="text-gray-300 text-sm">Customer: {job.customer}</Text>
          <Text className="text-gray-300 text-sm">Mechanic: {job.mechanic}</Text>
          <Text className="text-gray-400 text-sm mt-1">Date: {job.date}</Text>
        </View>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View className="flex-1">
      <Text className="text-white text-xl font-bold mb-4">Analytics Dashboard</Text>
      
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="bg-gray-800 rounded-lg p-4 items-center w-[48%] mb-4">
          <Ionicons name="people" size={24} color="#3B82F6" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.totalUsers}</Text>
          <Text className="text-gray-400 text-sm">Total Users</Text>
        </View>
        
        <View className="bg-gray-800 rounded-lg p-4 items-center w-[48%] mb-4">
          <Ionicons name="briefcase" size={24} color="#10B981" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.activeJobs}</Text>
          <Text className="text-gray-400 text-sm">Active Jobs</Text>
        </View>
        
        <View className="bg-gray-800 rounded-lg p-4 items-center w-[48%]">
          <Ionicons name="checkmark-done" size={24} color="#F59E0B" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.completedJobs}</Text>
          <Text className="text-gray-400 text-sm">Completed Jobs</Text>
        </View>
        
        <View className="bg-gray-800 rounded-lg p-4 items-center w-[48%]">
          <Ionicons name="cash" size={24} color="#8B5CF6" />
          <Text className="text-white text-2xl font-bold mt-2">{analyticsData.revenue}</Text>
          <Text className="text-gray-400 text-sm">Revenue</Text>
        </View>
      </View>
      
      <View className="bg-gray-800 rounded-lg p-8 items-center justify-center">
        <Ionicons name="bar-chart" size={48} color="#9CA3AF" />
        <Text className="text-white text-lg font-semibold mt-4">Performance Charts</Text>
        <Text className="text-gray-400 text-sm mt-1">Visualization of key metrics</Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white mt-4 text-base">Loading...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'Users':
        return renderUsers();
      case 'Jobs':
        return renderJobs();
      case 'Analytics':
        return renderAnalytics();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="p-4 border-b border-gray-700 bg-gray-800 flex-row justify-between items-center">
        <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4" onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

{/* Stats Cards */}
<View className="flex-row justify-between px-4 py-2">
  <View className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1">
    <Text className="text-white text-lg font-bold">124</Text>
    <Text className="text-gray-400 text-xs">Users</Text>
  </View>

  <View className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1">
    <Text className="text-white text-lg font-bold">18</Text>
    <Text className="text-gray-400 text-xs">Jobs</Text>
  </View>

  <View className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1">
    <Text className="text-white text-lg font-bold">50</Text>
    <Text className="text-gray-400 text-xs">Mechs</Text>
  </View>

  <View className="bg-gray-800 rounded px-3 py-3 items-center flex-1 mx-1">
    <Text className="text-white text-lg font-bold">94%</Text>
    <Text className="text-gray-400 text-xs">Satisf.</Text>
  </View>
</View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-gray-800 mx-4 my-2 rounded-lg flex-row items-center border border-gray-700">
        <Ionicons name="search" size={20} color="#9CA3AF" className="mr-2" />
        <TextInput
          className="flex-1 text-white placeholder-gray-500"
          placeholder="Search users, jobs, or analytics..."
          placeholderTextColor="#9CA3AF"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around bg-gray-800 mx-4 my-3 p-1 rounded-lg">
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Users' ? 'bg-white' : ''}`}
          onPress={() => setActiveTab('Users')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'Users' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Users' ? 'text-black font-semibold' : 'text-gray-400'}`}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Jobs' ? 'bg-white' : ''}`}
          onPress={() => setActiveTab('Jobs')}
        >
          <Ionicons name="briefcase" size={20} color={activeTab === 'Jobs' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Jobs' ? 'text-black font-semibold' : 'text-gray-400'}`}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-full ${activeTab === 'Analytics' ? 'bg-white' : ''}`}
          onPress={() => setActiveTab('Analytics')}
        >
          <Ionicons name="bar-chart" size={20} color={activeTab === 'Analytics' ? 'black' : '#9CA3AF'} />
          <Text className={`ml-2 ${activeTab === 'Analytics' ? 'text-black font-semibold' : 'text-gray-400'}`}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-2">
        {renderContent()}
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