// File: src/User/UserProfile.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UserProfile() {
  const navigation = useNavigation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  // Handler for Quick Actions navigation
  const handleQuickActionPress = (action) => {
    switch(action) {
      case 'PersonalInformation':
        // Navigate to personal info screen (replace with your screen name)
        navigation.navigate('PersonalInformation');
        break;
      case 'MyVehicles':
        navigation.navigate('MyVehicles');
        break;
      case 'Addresses':
        navigation.navigate('Addresses');
        break;
      case 'PaymentMethods':
        navigation.navigate('PaymentMethods');
        break;
      case 'Settings':
        navigation.navigate('UserSettings');
        break;
      default:
        break;
    }
  };

  // Handler for Support section navigation
  const handleSupportPress = (action) => {
    switch(action) {
      case 'HelpSupport':
        navigation.navigate('HelpSupport');
        break;
      case 'TermsPolicies':
        navigation.navigate('TermsPolicies');
        break;
      default:
        break;
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
              accessibilityLabel="User profile picture"
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
              <Text className="text-black text-2xl font-bold">2</Text>
              <Text className="text-gray-500 text-xs">Vehicles</Text>
            </View>
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
              <Text className="text-black">{userData.email}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Phone</Text>
              </View>
              <Text className="text-black">{userData.phone}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Member since</Text>
              </View>
              <Text className="text-black">{userData.joinDate}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Quick Actions</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('PersonalInformation')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Personal Information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('MyVehicles')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Ionicons name="car-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">My Vehicles</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('Addresses')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Addresses</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('PaymentMethods')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Ionicons name="card-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Payment Methods</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleQuickActionPress('Settings')}
              className="flex-row justify-between items-center py-4 px-5"
              accessibilityRole="button"
              accessibilityLabel="Open user settings"
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
              onPress={() => handleSupportPress('HelpSupport')}
              className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
              accessibilityRole="button"
            >
              <View className="flex-row items-center">
                <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleSupportPress('TermsPolicies')}
              className="flex-row justify-between items-center py-4 px-5"
              accessibilityRole="button"
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
          accessibilityRole="button"
          accessibilityLabel="Logout"
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
                accessibilityRole="button"
                accessibilityLabel="Cancel logout"
              >
                <Text className="text-center font-semibold text-gray-800">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                className="px-6 py-3 bg-red-600 rounded-md"
                onPress={confirmLogout}
                accessibilityRole="button"
                accessibilityLabel="Confirm logout"
              >
                <Text className="text-center font-semibold text-white">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}