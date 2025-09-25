import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { API_URL } from "../config";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Name, email, and password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          email: email,
          phone: phone || null, // Send null if empty
          password: password,
          profile_picture: profilePicture || null // Send null if empty
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Signup Failed", data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <View className="w-full max-w-sm rounded-3xl p-8 space-y-6 border border-white">
        <View className="w-full max-w-sm rounded-3xl p-8 space-y-6 border border-white">
          <Text className="text-4xl font-bold text-white text-center">Sign Up</Text>

          {/* Name Field */}
          <View>
            <Text className="text-white text-sm mb-2">Full Name *</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Enter your full name"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email Field */}
          <View>
            <Text className="text-white text-sm mb-2">Email *</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Phone Field */}
          <View>
            <Text className="text-white text-sm mb-2">Phone Number</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Enter your phone number (optional)"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* Profile Picture URL Field */}
          <View>
            <Text className="text-white text-sm mb-2">Profile Picture URL</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Enter profile picture URL (optional)"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="none"
              value={profilePicture}
              onChangeText={setProfilePicture}
            />
          </View>

          {/* Password Field */}
          <View>
            <Text className="text-white text-sm mb-2">Password *</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Enter your password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Confirm Password Field */}
          <View>
            <Text className="text-white text-sm mb-2">Confirm Password *</Text>
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
              placeholder="Confirm your password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg mt-4"
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-semibold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full mt-4"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white text-center text-sm">
              Already have an account? <Text className="font-semibold underline">Login here</Text>
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs text-center mt-4">
            * Required fields
          </Text>
        </View>
      </View>
    </View>
  );
}