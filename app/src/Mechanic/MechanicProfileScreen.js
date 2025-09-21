// File: src/Mechanic/MechanicProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function MechanicProfileScreen() {
  const navigation = useNavigation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);

  // Mock mechanic data
  const mechanicData = {
    name: 'Ogute Okwach',
    age: 34,
    email: 'Ogutekenya1@gmail.com',
    phone: '0714567890',
    address: '123 Main St, Nairobi, Kenya',
    rating: 4.8,
    jobsCompleted: 46,
    profileImage: 'https://randomuser.me/api/portraits/men/44.jpg',
    shopName: 'Doe Auto Garage',
    shopLocation: 'Industrial Area, Nairobi',
    aboutShop: 'We specialize in car engine repair, diagnostics, and general servicing. Serving Nairobi customers with trust and excellence for over 10 years.',
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigation.replace('Login'); 
  };

  const handleQuickActionPress = (action) => {
    switch(action) {
      case 'MyServices':
        navigation.navigate('MechanicServices'); 
        break;
      case 'Settings':
        navigation.navigate('MechanicSettings');
        break;
      default:
        break;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white rounded-lg shadow-sm border border-gray-100 mt-5 p-5">
          <View className="flex-row items-center">
            <Image
              source={{ uri: mechanicData.profileImage }}
              className="w-16 h-16 rounded-full mr-4"
              accessibilityLabel="Mechanic profile picture"
            />
            <View>
              <Text className="text-black text-xl font-semibold">{mechanicData.name}</Text>
              <Text className="text-gray-600 text-sm">Expert Mechanic</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">{mechanicData.jobsCompleted}</Text>
              <Text className="text-gray-500 text-xs">Jobs</Text>
            </View>
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">{mechanicData.rating}</Text>
              <Text className="text-gray-500 text-xs">Rating</Text>
            </View>
          </View>
        </View>

        {/* Shop Information */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Shop Information</Text>
          <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
            <Text className="text-black text-base font-semibold">{mechanicData.shopName}</Text>
            <Text className="text-gray-600 mt-1">{mechanicData.shopLocation}</Text>
            <Text className="text-gray-700 mt-3 leading-5">{mechanicData.aboutShop}</Text>
          </View>
        </View>

        {/* Account Details */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Account Details</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Email</Text>
              </View>
              <Text className="text-black">{mechanicData.email}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Phone</Text>
              </View>
              <Text className="text-black">{mechanicData.phone}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Address</Text>
              </View>
              <Text className="text-black">{mechanicData.address}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Quick Actions</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            {/* Personal Info Expandable */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPersonalInfo(!showPersonalInfo)}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Personal Information</Text>
              </View>
              <Ionicons 
                name={showPersonalInfo ? "chevron-down" : "chevron-forward"} 
                size={20} 
                color="#4B5563" 
              />
            </TouchableOpacity>

            {showPersonalInfo && (
              <View className="px-6 py-3 bg-gray-50">
                <Text className="text-gray-700">Name: {mechanicData.name}</Text>
                <Text className="text-gray-700 mt-1">Age: {mechanicData.age}</Text>
                <Text className="text-gray-700 mt-1">Contact: {mechanicData.phone}</Text>
              </View>
            )}

            {/* My Services */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('MyServices')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="build-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">My Services</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('Settings')}
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
