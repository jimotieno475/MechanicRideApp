import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSignup = () => {
    // Placeholder for actual signup logic.
    // In a real app, you would validate the input and
    // register the new user with your backend here.
    console.log('Signup attempt with email:', email);
    // After a successful signup, you could navigate to another screen.
  };

  return (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <View className="w-full max-w-sm rounded-3xl p-8 space-y-6 border border-white">
        {/* Title */}
        <Text className="text-4xl font-bold text-white text-center">Sign Up</Text>

        {/* Username Input */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Username"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
        />

        {/* Email Input */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
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

        {/* Confirm Password Input */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Confirm Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* Create Account Button */}
        <TouchableOpacity
          className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg mt-4"
          onPress={handleSignup}
        >
          <Text className="text-black font-semibold text-lg">Create Account</Text>
        </TouchableOpacity>

        {/* Link to Login */}
        <TouchableOpacity
          className="w-full mt-4"
          onPress={() => navigation.navigate('Login')}
        >
          <Text className="text-white text-center text-sm">
            Already have an account? <Text className="font-semibold underline">Login here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}