// File: src/User/UserProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Pressable, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { API_URL } from '../config';

// Avatar Component (same as in MechanicProfile)
const Avatar = ({ size = 64, name = "User", profilePicture, className = "" }) => {
  // If profile picture is available, use it
  if (profilePicture) {
    return (
      <Image
        source={{ uri: profilePicture }}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  
  // Otherwise, show initials
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  return (
    <View 
      className={`bg-blue-500 rounded-full items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Text className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {initials}
      </Text>
    </View>
  );
};

export default function UserProfile() {
  const navigation = useNavigation();
  const { user} = useUser(); // Get user from context
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Dropdown states
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState('');

  // Fetch user data
  const fetchUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load user profile');
      // Fallback to context data if available
      if (user) {
        setUserData({
          ...user,
          bookings_count: 0, // Default value
          membership: 'Standard Member' // Default value
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserData();
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

  // Format join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (error) {
      return 'Unknown';
    }
  };

  // Use context data as fallback while loading
  const displayData = userData || user;

  // Loading state
  if (loading && !displayData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4">Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (!displayData) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color="#6b7280" />
        <Text className="text-gray-600 text-lg text-center mt-4">
          Unable to load profile data. Please try again.
        </Text>
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          onPress={handleRefresh}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-black px-5 pt-12 pb-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">My Profile</Text>
            <Text className="text-gray-300 mt-1">Bookings, history and settings</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color={refreshing ? "#6b7280" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 px-5" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
          />
        }
      >
        {/* Profile Card */}
        <View className="bg-white rounded-lg shadow-sm border border-gray-100 mt-5 p-5">
          <View className="flex-row items-center">
            <Avatar 
              name={displayData.name} 
              profilePicture={displayData.profile_picture}
              size={64} 
              className="mr-4" 
            />
            <View className="flex-1">
              <Text className="text-black text-xl font-semibold">{displayData.name}</Text>
              <Text className="text-gray-600 text-sm">{displayData.membership || 'Standard Member'}</Text>
              <Text className="text-gray-500 text-xs mt-1">
                Member since {formatJoinDate(displayData.created_at)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <Text className="text-black text-2xl font-bold">
                {displayData.bookings_count || 0}
              </Text>
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

        {/* Account Details */}
        <View className="mt-6">
          <Text className="text-black text-lg font-semibold mb-3">Account Details</Text>
          
          <View className="bg-white rounded-lg shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Email</Text>
              </View>
              <Text className="text-black">{displayData.email}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Phone</Text>
              </View>
              <Text className="text-black">{displayData.phone || 'Not provided'}</Text>
            </View>
            
            <View className="flex-row justify-between items-center py-4 px-5">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 ml-3">Member Since</Text>
              </View>
              <Text className="text-black">
                {formatJoinDate(displayData.created_at)}
              </Text>
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
                <Text className="text-gray-700">Name: {displayData.name}</Text>
                <Text className="text-gray-700 mt-1">Email: {displayData.email}</Text>
                <Text className="text-gray-700 mt-1">Phone: {displayData.phone || 'Not provided'}</Text>
                <Text className="text-gray-700 mt-1">Status: {displayData.status || 'Active'}</Text>
                <Text className="text-gray-700 mt-1">Member since: {formatJoinDate(displayData.created_at)}</Text>
                
                <TouchableOpacity
                  className="bg-black px-4 py-2 rounded-lg mt-3"
                  onPress={() => navigation.navigate('EditProfile', { userData: displayData })}
                >
                  <Text className="text-white text-center font-semibold">Edit Profile</Text>
                </TouchableOpacity>
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
                {vehicles.length > 0 ? (
                  vehicles.map((v, idx) => (
                    <Text key={idx} className="text-black py-1">{v}</Text>
                  ))
                ) : (
                  <Text className="text-gray-500">No vehicles added yet</Text>
                )}
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
              onPress={() => navigation.navigate('UserSettings', { userData: displayData })}
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
// // File: src/User/UserProfile.js
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Pressable, TextInput } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// export default function UserProfile() {
//   const navigation = useNavigation();
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   // Dropdown states
//   const [showPersonalInfo, setShowPersonalInfo] = useState(false);
//   const [showVehicles, setShowVehicles] = useState(false);
//   const [showAddresses, setShowAddresses] = useState(false);
//   const [showPayment, setShowPayment] = useState(false);
//   const [vehicles, setVehicles] = useState(['Toyota Corolla', 'Honda Civic', 'Mazda CX-5']);
//   const [newVehicle, setNewVehicle] = useState('');

//   // Mock user data
//   const userData = {
//     name: 'Alex Mwakidengu',
//     email: 'alex.mwakidengu@gmail.com',
//     phone: '+254 7 1234 5678',
//     membership: 'Premium Member',
//     joinDate: 'September 2025',
//     bookings: 12,
//     profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
//   };

//   const confirmLogout = () => {
//     setShowLogoutConfirm(false);
//     navigation.replace('Login'); 
//   };

//   const handleAddVehicle = () => {
//     if (newVehicle.trim() !== '') {
//       setVehicles([...vehicles, newVehicle.trim()]);
//       setNewVehicle('');
//     }
//   };

//   return (
//     <View className="flex-1 bg-white">
//       {/* Header */}
//       <View className="bg-black px-5 pt-12 pb-4">
//         <Text className="text-white text-2xl font-bold">My Profile</Text>
//         <Text className="text-gray-300 mt-1">Bookings, history and settings</Text>
//       </View>

//       <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
//         {/* Profile Card */}
//         <View className="bg-white rounded-lg shadow-sm border border-gray-100 mt-5 p-5">
//           <View className="flex-row items-center">
//             <Image
//               source={{ uri: userData.profileImage }}
//               className="w-16 h-16 rounded-full mr-4"
//             />
//             <View>
//               <Text className="text-black text-xl font-semibold">{userData.name}</Text>
//               <Text className="text-gray-600 text-sm">{userData.membership}</Text>
//             </View>
//           </View>

//           <View className="flex-row justify-between mt-6">
//             <View className="items-center">
//               <Text className="text-black text-2xl font-bold">{userData.bookings}</Text>
//               <Text className="text-gray-500 text-xs">Bookings</Text>
//             </View>
//             <View className="items-center">
//               <Text className="text-black text-2xl font-bold">4.9</Text>
//               <Text className="text-gray-500 text-xs">Rating</Text>
//             </View>
//             <View className="items-center">
//               <Text className="text-black text-2xl font-bold">{vehicles.length}</Text>
//               <Text className="text-gray-500 text-xs">Vehicles</Text>
//             </View>
//           </View>
//         </View>

//         {/* Quick Actions */}
//         <View className="mt-6">
//           <Text className="text-black text-lg font-semibold mb-3">Quick Actions</Text>
          
//           <View className="bg-white rounded-lg shadow-sm border border-gray-100">
//             {/* Personal Information Dropdown */}
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => setShowPersonalInfo(!showPersonalInfo)}
//               className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="person-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Personal Information</Text>
//               </View>
//               <Ionicons name={showPersonalInfo ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
//             </TouchableOpacity>
//             {showPersonalInfo && (
//               <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
//                 <Text className="text-black">Email: {userData.email}</Text>
//                 <Text className="text-black mt-1">Phone: {userData.phone}</Text>
//                 <Text className="text-black mt-1">Member since: {userData.joinDate}</Text>
//               </View>
//             )}

//             {/* My Vehicles Dropdown */}
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => setShowVehicles(!showVehicles)}
//               className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="car-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">My Vehicles</Text>
//               </View>
//               <Ionicons name={showVehicles ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
//             </TouchableOpacity>
//             {showVehicles && (
//               <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
//                 {vehicles.map((v, idx) => (
//                   <Text key={idx} className="text-black">{v}</Text>
//                 ))}
//                 <View className="flex-row mt-3">
//                   <TextInput
//                     className="flex-1 border border-gray-400 rounded px-2 py-1 mr-2 text-black"
//                     placeholder="Add Vehicle"
//                     placeholderTextColor="#999"
//                     value={newVehicle}
//                     onChangeText={setNewVehicle}
//                   />
//                   <TouchableOpacity
//                     onPress={handleAddVehicle}
//                     className="bg-black px-3 py-1 rounded"
//                   >
//                     <Text className="text-white">Add</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {/* Addresses Dropdown */}
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => setShowAddresses(!showAddresses)}
//               className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="location-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Addresses</Text>
//               </View>
//               <Ionicons name={showAddresses ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
//             </TouchableOpacity>
//             {showAddresses && (
//               <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
//                 <Text className="text-black">Home: 123 Main St, Nairobi</Text>
//                 <Text className="text-black mt-1">Work: 456 Office Rd, Nairobi</Text>
//               </View>
//             )}

//             {/* Payment Methods Dropdown */}
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => setShowPayment(!showPayment)}
//               className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="card-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Payment Methods</Text>
//               </View>
//               <Ionicons name={showPayment ? 'chevron-down' : 'chevron-forward'} size={20} color="#4B5563" />
//             </TouchableOpacity>
//             {showPayment && (
//               <View className="px-5 py-3 bg-gray-100 rounded-b-lg">
//                 <Text className="text-black">Mpesa</Text>
//               </View>
//             )}

//             {/* Settings Navigation */}
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => navigation.navigate('UserSettings')}
//               className="flex-row justify-between items-center py-4 px-5"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="settings-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Settings</Text>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color="#4B5563" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Support Section */}
//         <View className="mt-6">
//           <Text className="text-black text-lg font-semibold mb-3">Support</Text>
          
//           <View className="bg-white rounded-lg shadow-sm border border-gray-100">
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => navigation.navigate('HelpCenter')}
//               className="flex-row justify-between items-center py-4 px-5 border-b border-gray-100"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="help-circle-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Help & Support</Text>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color="#4B5563" />
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => navigation.navigate('TermsOfService')}
//               className="flex-row justify-between items-center py-4 px-5"
//             >
//               <View className="flex-row items-center">
//                 <Ionicons name="document-text-outline" size={20} color="#4B5563" />
//                 <Text className="text-gray-700 ml-3">Terms & Policies</Text>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color="#4B5563" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Logout Button */}
//         <TouchableOpacity 
//           activeOpacity={0.7}
//           className="flex-row items-center justify-center py-4 bg-red-50 rounded-lg mt-6 mb-8 border border-red-100"
//           onPress={() => setShowLogoutConfirm(true)}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#ef4444" />
//           <Text className="text-red-600 font-semibold ml-2">Logout</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* Logout Confirmation Modal */}
//       <Modal
//         transparent
//         visible={showLogoutConfirm}
//         animationType="fade"
//         onRequestClose={() => setShowLogoutConfirm(false)}
//       >
//         <Pressable
//           className="flex-1 bg-black/50 justify-center items-center"
//           onPress={() => setShowLogoutConfirm(false)}
//         >
//           <View className="w-64 bg-white rounded-lg p-4 space-y-3">
//             <Text className="text-center text-lg font-semibold text-gray-800">
//               Are you sure you want to logout?
//             </Text>
//             <View className="flex-row justify-between">
//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 className="px-6 py-3 bg-gray-200 rounded-md"
//                 onPress={() => setShowLogoutConfirm(false)}
//               >
//                 <Text className="text-center font-semibold text-gray-800">Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 activeOpacity={0.7}
//                 className="px-6 py-3 bg-red-600 rounded-md"
//                 onPress={confirmLogout}
//               >
//                 <Text className="text-center font-semibold text-white">Logout</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Pressable>
//       </Modal>
//     </View>
//   );
// }
