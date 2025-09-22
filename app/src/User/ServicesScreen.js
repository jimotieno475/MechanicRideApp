// File: src/User/ServicesScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Emergency problems in Kenya
const services = [
  { id: 1, name: "Flat / Burst Tyre", icon: "car-sport-outline", status: "Emergency" },
  { id: 2, name: "Battery Failure", icon: "battery-dead-outline", status: "Emergency" },
  { id: 3, name: "Fuel Problem (Out of Fuel)", icon: "flash-outline", status: "Can Drive" },
  { id: 4, name: "Engine Overheating", icon: "thermometer-outline", status: "Emergency" },
  { id: 5, name: "Brake Failure", icon: "hand-left-outline", status: "Emergency" },
  { id: 6, name: "Clutch Issues", icon: "git-pull-request-outline", status: "Can Drive" },
  { id: 7, name: "Alternator Problem", icon: "swap-horizontal-outline", status: "Can Drive" },
  { id: 8, name: "Suspension Damage", icon: "speedometer-outline", status: "Can Drive" },
  { id: 9, name: "Starter Motor Issue", icon: "power-outline", status: "Emergency" },
  { id: 10, name: "Electrical Failure", icon: "flash-off-outline", status: "Can Drive" },
  { id: 11, name: "Radiator Fan Problem", icon: "snow-outline", status: "Emergency" },
  { id: 12, name: "Transmission Issue", icon: "git-branch-outline", status: "Emergency" },
  { id: 13, name: "Accident / Towing Needed", icon: "car-outline", status: "Emergency" },
  { id: 14, name: "Air Conditioning Failure", icon: "snow-outline", status: "Can Drive" },
  { id: 15, name: "Exhaust Smoke Issue", icon: "cloud-outline", status: "Can Drive" },
];

// Example mechanics (for demo)
const MECHANICS = [
  { id: 'm1', name: 'Joe', phone: '+254701234567', lat: -1.28333, lng: 36.81667, issues: ['tyre','battery','engine','brake'] },
  { id: 'm2', name: 'AutoFix', phone: '+254712345678', lat: -1.285, lng: 36.82, issues: ['clutch','alternator','suspension','transmission'] },
  { id: 'm3', name: 'QuickTyre', phone: '+254723456789', lat: -1.28, lng: 36.81, issues: ['tyre','fuel','towing','electrical'] },
];

export default function ServicesScreen() {
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const scaleAnim = new Animated.Value(1);

  const onSelectService = (service) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setSelectedId(service.id);

      // Find mechanic matching the issue
      const matchingMechanics = MECHANICS.filter(m =>
        m.issues.some(issue => service.name.toLowerCase().includes(issue.toLowerCase()))
      );

      if (matchingMechanics.length === 0) {
        Alert.alert('No mechanic found', `No mechanic available for ${service.name}`);
        return;
      }

      const nearestMechanic = matchingMechanics[0]; // simple selection

      Alert.alert(
        'Service Selected',
        `You selected "${service.name}" (Emergency Case)`,
        [
          { text: 'Cancel' },
          {
            text: 'View on Map',
            onPress: () => {
              navigation.navigate('MapScreen', {
                task: {
                  type: service.name,
                  location: nearestMechanic.name,
                  latitude: nearestMechanic.lat,
                  customer: "You",
                  longitude: nearestMechanic.lng,
                  phone: nearestMechanic.phone,
                },
                role: 'user',
              });
            }
          }
        ]
      );
    });
  };

  // ✅ Filter services by search
  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-5 pt-6 pb-3 border-b border-gray-700">
        <Text className="text-3xl font-extrabold text-white">Emergency Help</Text>
        <Text className="text-gray-400 mt-1 text-base">Choose the problem you’re facing</Text>

        {/* 🔍 Search bar */}
        <View className="mt-4 bg-gray-800 rounded-xl px-4 py-2 flex-row items-center">
          <Ionicons name="search-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="Search a car problem..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-white"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {filteredServices.map((service) => {
            const isSelected = selectedId === service.id;
            return (
              <View
                key={service.id}
                className={`w-[48%] rounded-xl mb-5 border ${
                  isSelected ? 'border-white' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: isSelected ? '#222' : '#111',
                  shadowColor: isSelected ? '#fff' : '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: isSelected ? 0.3 : 0,
                  shadowRadius: 6,
                  elevation: isSelected ? 8 : 0,
                }}
              >
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: isSelected ? '#fff' : '#222' }}
                >
                  <Ionicons name={service.icon} size={28} color={isSelected ? '#000' : '#ddd'} />
                </View>

                <Text
                  className={`text-center mb-1 text-lg font-semibold ${
                    isSelected ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {service.name}
                </Text>
                <Text
                  className={`text-center mb-4 font-bold ${
                    service.status === "Emergency" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {service.status}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onSelectService(service)}
                  className={`mx-8 mb-4 rounded-lg py-2 items-center justify-center ${
                    isSelected ? 'bg-white' : 'bg-gray-800'
                  }`}
                >
                  <Animated.Text
                    style={{
                      color: isSelected ? '#000' : '#fff',
                      fontWeight: '700',
                      fontSize: 14,
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Animated.Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
