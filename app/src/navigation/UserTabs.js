import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// Import user screens (only the ones you have)
import HomeScreen from '../User/HomeScreen';
import ServicesScreen from '../User/ServicesScreen';
import ActivityScreen from '../User/ActivityScreen';
import UserProfile from '../User/UserProfile';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: 'black' }, 
        headerTintColor: 'white' 
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Services Stack Navigator
function ServicesStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: 'black' }, 
        headerTintColor: 'white' 
      }}
    >
      <Stack.Screen 
        name="ServicesScreen" 
        component={ServicesScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Activity Stack Navigator
function ActivityStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: 'black' }, 
        headerTintColor: 'white' 
      }}
    >
      <Stack.Screen 
        name="ActivityScreen" 
        component={ActivityScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: 'black' }, 
        headerTintColor: 'white' 
      }}
    >
      <Stack.Screen 
        name="UserProfileScreen" 
        component={UserProfile} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

// Main User Tabs Navigator
export default function UserTabs() {
  return (
    <SafeAreaProvider>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Services" component={ServicesStack} />
      <Tab.Screen name="Activity" component={ActivityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
    </SafeAreaProvider>
  );
}



// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Ionicons } from '@expo/vector-icons';

// // Import user screens
// import HomeScreen from '../screens/HomeScreen';
// import ServicesScreen from '../screens/ServicesScreen';
// import ActivityScreen from '../screens/ActivityScreen';
// import UserProfile from '../screens/UserProfile';
// import ServiceDetailsScreen from '../screens/ServiceDetailsScreen';
// import BookingScreen from '../screens/BookingScreen';
// import ActivityDetailsScreen from '../screens/ActivityDetailsScreen';
// import VehicleManagementScreen from '../screens/VehicleManagementScreen';
// import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
// import SettingsScreen from '../screens/SettingsScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// // Home Stack Navigator
// function HomeStack() {
//   return (
//     <Stack.Navigator 
//       screenOptions={{ 
//         headerStyle: { backgroundColor: 'black' }, 
//         headerTintColor: 'white' 
//       }}
//     >
//       <Stack.Screen 
//         name="HomeScreen" 
//         component={HomeScreen} 
//         options={{ title: 'Home', headerShown: false }} 
//       />
//       <Stack.Screen 
//         name="ServiceDetails" 
//         component={ServiceDetailsScreen} 
//         options={{ title: 'Service Details' }} 
//       />
//       <Stack.Screen 
//         name="Booking" 
//         component={BookingScreen} 
//         options={{ title: 'Book Service' }} 
//       />
//     </Stack.Navigator>
//   );
// }

// // Services Stack Navigator
// function ServicesStack() {
//   return (
//     <Stack.Navigator 
//       screenOptions={{ 
//         headerStyle: { backgroundColor: 'black' }, 
//         headerTintColor: 'white' 
//       }}
//     >
//       <Stack.Screen 
//         name="ServicesScreen" 
//         component={ServicesScreen} 
//         options={{ title: 'Services', headerShown: false }} 
//       />
//       <Stack.Screen 
//         name="ServiceDetails" 
//         component={ServiceDetailsScreen} 
//         options={{ title: 'Service Details' }} 
//       />
//       <Stack.Screen 
//         name="Booking" 
//         component={BookingScreen} 
//         options={{ title: 'Book Service' }} 
//       />
//     </Stack.Navigator>
//   );
// }

// // Activity Stack Navigator
// function ActivityStack() {
//   return (
//     <Stack.Navigator 
//       screenOptions={{ 
//         headerStyle: { backgroundColor: 'black' }, 
//         headerTintColor: 'white' 
//       }}
//     >
//       <Stack.Screen 
//         name="ActivityScreen" 
//         component={ActivityScreen} 
//         options={{ title: 'My Activities', headerShown: false }} 
//       />
//       <Stack.Screen 
//         name="ActivityDetails" 
//         component={ActivityDetailsScreen} 
//         options={{ title: 'Activity Details' }} 
//       />
//     </Stack.Navigator>
//   );
// }

// // Profile Stack Navigator
// function ProfileStack() {
//   return (
//     <Stack.Navigator 
//       screenOptions={{ 
//         headerStyle: { backgroundColor: 'black' }, 
//         headerTintColor: 'white' 
//       }}
//     >
//       <Stack.Screen 
//         name="UserProfileScreen" 
//         component={UserProfile} 
//         options={{ title: 'My Profile', headerShown: false }} 
//       />
//       <Stack.Screen 
//         name="VehicleManagement" 
//         component={VehicleManagementScreen} 
//         options={{ title: 'My Vehicles' }} 
//       />
//       <Stack.Screen 
//         name="PaymentMethods" 
//         component={PaymentMethodsScreen} 
//         options={{ title: 'Payment Methods' }} 
//       />
//       <Stack.Screen 
//         name="Settings" 
//         component={SettingsScreen} 
//         options={{ title: 'Settings' }} 
//       />
//     </Stack.Navigator>
//   );
// }

// // Main User Tabs Navigator
// export default function UserTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;
          
//           if (route.name === 'Home') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'Services') {
//             iconName = focused ? 'construct' : 'construct-outline';
//           } else if (route.name === 'Activity') {
//             iconName = focused ? 'list' : 'list-outline';
//           } else if (route.name === 'Profile') {
//             iconName = focused ? 'person' : 'person-outline';
//           }
          
//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//         tabBarActiveTintColor: '#3b82f6',
//         tabBarInactiveTintColor: 'gray',
//         tabBarStyle: { 
//           backgroundColor: 'white', 
//           borderTopColor: '#e5e7eb',
//           height: 60,
//           paddingVertical: 5,
//         },
//         tabBarLabelStyle: {
//           fontSize: 12,
//           marginBottom: 5,
//         },
//         headerShown: false,
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeStack} />
//       <Tab.Screen name="Services" component={ServicesStack} />
//       <Tab.Screen name="Activity" component={ActivityStack} />
//       <Tab.Screen name="Profile" component={ProfileStack} />
//     </Tab.Navigator>
//   );
// }