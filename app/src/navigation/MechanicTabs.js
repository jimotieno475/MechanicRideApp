// File: src/Mechanic/MechanicTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MechanicHomeScreen from '../Mechanic/MechanicHomeScreen';
import AvailabilityScreen from '../Mechanic/AvailabilityScreen';
import MechanicProfileScreen from '../Mechanic/MechanicProfileScreen';

const Tab = createBottomTabNavigator();

export default function MechanicTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Availability') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarInactiveTintColor: 'gray',
        tabBarActiveTintColor: '#3b82f6',
        tabBarStyle: {
          backgroundColor: '#f3f4f6', // Tailwind gray-100
        },
        labelStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen name="Home" component={MechanicHomeScreen} />
      <Tab.Screen name="Availability" component={AvailabilityScreen} />
      <Tab.Screen name="Profile" component={MechanicProfileScreen} />
    </Tab.Navigator>
  );
}