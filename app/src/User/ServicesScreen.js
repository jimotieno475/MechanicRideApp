// File: src/User/ServicesScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Updated services (10 services)
const services = [
  { id: 1, name: "Oil Change", icon: "color-filter", price: "$50" },
  { id: 2, name: "Brake Service", icon: "hardware-chip", price: "$120" },
  { id: 3, name: "Tire Replacement", icon: "car-sport", price: "$200" },
  { id: 4, name: "Engine Repair", icon: "construct", price: "$300" },
  { id: 5, name: "Battery Replacement", icon: "battery-charging-outline", price: "$150" },
  { id: 6, name: "AC Service", icon: "snow-outline", price: "$100" },
  { id: 7, name: "Transmission Repair", icon: "git-branch-outline", price: "$350" },
  { id: 8, name: "Suspension Service", icon: "speedometer", price: "$180" },
  { id: 9, name: "Electrical Work", icon: "flash-outline", price: "$120" },
  { id: 10, name: "Wheel Alignment", icon: "git-compare-outline", price: "$80" },
];

// Updated mechanics with phone numbers
const MECHANICS = [
  { id: 'm1', name: 'Joe', phone: '+254701234567', lat: -1.28333, lng: 36.81667, issues: ['battery','tyre','oil','engine'] },
  { id: 'm2', name: 'AutoFix', phone: '+254712345678', lat: -1.285, lng: 36.82, issues: ['engine','electrical','brake','suspension','transmission'] },
  { id: 'm3', name: 'QuickTyre', phone: '+254723456789', lat: -1.28, lng: 36.81, issues: ['tyre','oil','wheel','alignment'] },
];

export default function ServicesScreen() {
  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);
  const scaleAnim = new Animated.Value(1);

  const onSelectService = (service) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      setSelectedId(service.id);

      // Find nearest mechanic who handles this service
      const matchingMechanics = MECHANICS.filter(m =>
        m.issues.map(issue => issue.toLowerCase()).includes(service.name.toLowerCase().split(' ')[0])
      );

      if (matchingMechanics.length === 0) {
        Alert.alert('No mechanic found', `No mechanic available for ${service.name}`);
        return;
      }

      const nearestMechanic = matchingMechanics[0]; // simple selection

      Alert.alert(
        'Service Selected',
        `You selected "${service.name}" for ${service.price}`,
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
                  longitude: nearestMechanic.lng,
                  phone: nearestMechanic.phone, // pass phone number
                },
                role: 'user',
              });
            }
          }
        ]
      );
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-5 pt-6 pb-3 border-b border-gray-700">
        <Text className="text-3xl font-extrabold text-white">Our Services</Text>
        <Text className="text-gray-400 mt-1 text-base">Choose a service you need</Text>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {services.map((service) => {
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
                    isSelected ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {service.price}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onSelectService(service)}
                  className={`mx-8 mb-4 rounded-lg py-2 items-center justify-center ${
                    isSelected ? 'bg-white' : 'bg-gray-800'
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${service.name} service`}
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
