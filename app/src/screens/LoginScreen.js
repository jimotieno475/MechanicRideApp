import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = (role) => {
    // This is a placeholder for actual login logic.
    // In a real app, you would authenticate the user here.
    switch(role) {
      case 'user':
        navigation.navigate('UserTabs');
        break;
      case 'mechanic':
        navigation.navigate('MechanicTabs');
        break;
      case 'admin':
        navigation.navigate('AdminTabs');
        break;
      default:
        // Handle a general login, if applicable
        console.log('Login attempt with username:', username);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <View className="w-full max-w-sm rounded-3xl p-8 space-y-10 border border-white">
        {/* Title */}
        <Text className="text-4xl font-bold text-white text-center">Login</Text>

        {/* Username/Email Input */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Username or Email"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
        />

        {/* Password Input */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button (General) */}
        <TouchableOpacity
          className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg"
          onPress={() => handleLogin('general')}
        >
          <Text className="text-black font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="w-full h-px bg-gray-600 my-4" />

        {/* Role-based Navigation Buttons */}
        <View className="space-y-6">
          <TouchableOpacity
            className="w-full h-12 rounded-xl border border-white justify-center items-center"
            onPress={() => handleLogin('user')}
          >
            <Text className="text-white font-semibold text-lg">Login as User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-12 rounded-xl border border-white justify-center items-center"
            onPress={() => handleLogin('mechanic')}
          >
            <Text className="text-white font-semibold text-lg">Login as Mechanic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-12 rounded-xl border border-white justify-center items-center"
            onPress={() => handleLogin('admin')}
          >
            <Text className="text-white font-semibold text-lg">Login as Admin</Text>
          </TouchableOpacity>
        </View>

        {/* Link to Signup */}
        <TouchableOpacity
          className="w-full mt-8"
          onPress={() => navigation.navigate('Signup')}
        >
          <Text className="text-white text-center text-sm">
            Don't have an account? <Text className="font-semibold underline">Sign up here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
