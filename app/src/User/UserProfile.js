// File: src/User/UserProfile.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UserProfile() {
  const navigation = useNavigation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Dropdown states
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [vehicles, setVehicles] = useState(['Toyota Corolla', 'Honda Civic', 'Mazda CX-5']);
  const [newVehicle, setNewVehicle] = useState('');

  // Mock user data
  const userData = {
    name: 'Alex Mwakidengu',
    email: 'alex.mwakidengu@gmail.com',
    phone: '+254 7 1234 5678',
    membership: 'Premium Member',
    joinDate: 'September 2025',
    bookings: 12,
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigation.replace('Login'); 
  };

  const handleAddVehicle = () => {
    if (newVehicle.trim() !== '') {
      setVehicles([...vehicles, newVehicle.trim()]);
      setNewVehicle('');
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-black px-5 pt-12 pb-4">
        <Text className="text-white text-2xl font-bold">My Profile</Text>
        <Text className="text-gray-300 mt-1">Bookings, history and settings</Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white rounded-lg shadow-sm border border-gray-100 mt-5 p-5">
          <View className="flex-row items-center">
            <Image
              source={{ uri: userData.profileImage }}
              className="w-16 h-16 rounded-full mr-4"
            />
            <View>
              <Text className="text-black text-xl font-semibold">{userData.name}</Text>
              <Text className="text-gray-600 text-sm">{userData.membership}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">{userData.bookings}</Text>
              <Text className="text-gray-500 text-xs">Bookings</Text>
            </View>
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">4.9</Text>
              <Text className="text-gray-500 text-xs">Rating</Text>
            </View>
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">{vehicles.length}</Text>
              <Text className="text-gray-500 text-xs">Vehicles</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Quick Actions</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Personal Information Dropdown */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPersonalInfo(!showPersonalInfo)}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Personal Information</Text>
              </View>
              <Ionicons name={showPersonalInfo ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
            </TouchableOpacity>
            {showPersonalInfo && (
              <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
                <Text className="text-black">Email: {userData.email}</Text>
                <Text className="text-black mt-1">Phone: {userData.phone}</Text>
                <Text className="text-black mt-1">Member since: {userData.joinDate}</Text>
              </View>
            )}

            {/* My Vehicles Dropdown */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowVehicles(!showVehicles)}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">My Vehicles</Text>
              </View>
              <Ionicons name={showVehicles ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
            </TouchableOpacity>
            {showVehicles && (
              <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
                {vehicles.map((v, idx) => (
                  <Text key={idx} className="text-black">{v}</Text>
                ))}
                <View className="flex-row mt-3">
                  <TextInput
                    className="flex-1 border border-gray-400 rounded px-2 py-1 mr-2 text-black"
                    placeholder="Add Vehicle"
                    placeholderTextColor="#999"
                    value={newVehicle}
                    onChangeText={setNewVehicle}
                  />
                  <TouchableOpacity
                    onPress={handleAddVehicle}
                    className="bg-black px-3 py-1 rounded"
                  >
                    <Text className="text-white">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Addresses Dropdown */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAddresses(!showAddresses)}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Addresses</Text>
              </View>
              <Ionicons name={showAddresses ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
            </TouchableOpacity>
            {showAddresses && (
              <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
                <Text className="text-black">Home: 123 Main St, Nairobi</Text>
                <Text className="text-black mt-1">Work: 456 Office Rd, Nairobi</Text>
              </View>
            )}

            {/* Payment Methods Dropdown */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPayment(!showPayment)}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Payment Methods</Text>
              </View>
              <Ionicons name={showPayment ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
            </TouchableOpacity>
            {showPayment && (
              <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
                <Text className="text-black">Mpesa</Text>
              </View>
            )}

            {/* Settings Navigation */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UserSettings')}
              className="flex-row justify-between items-center py-4 px-5"
            >
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Support</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpCenter')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TermsOfService')}
              className="flex-row justify-between items-center py-4 px-5"
            >
              <View className="flex-row items-center">
                <Ionicons name="document-text-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Terms & Policies</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          activeOpacity={0.7}
          className="flex-row items-center justify-center py-4 bg-red-50 rounded-lg mt-6 mb-8 border border-red-100"
          onPress={() => setShowLogoutConfirm(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text className="text-red-600 font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={showLogoutConfirm}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowLogoutConfirm(false)}
        >
          <View className="w-64 bg-white rounded-lg p-4 space-y-3">
            <Text className="text-center text-lg font-semibold text-gray-800">
              Are you sure you want to logout?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                activeOpacity={0.7}
                className="px-6 py-3 bg-gray-200 rounded-md"
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text className="text-center font-semibold text-gray-800">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="px-6 py-3 bg-red-600 rounded-md"
                onPress={confirmLogout}
              >
                <Text className="text-center font-semibold text-white">Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
