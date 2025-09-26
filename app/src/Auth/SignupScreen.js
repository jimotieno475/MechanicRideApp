import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permissions required', 'Camera and gallery permissions are needed for photo uploads.');
      }
    })();
  }, []);

  // Pick profile photo from gallery
  const pickProfilePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) setProfilePhoto(result.assets[0].uri);
    } catch (error) {
      console.error("Error picking photo:", error);
      Alert.alert("Error", "Failed to pick photo from gallery.");
    }
  };

  // Take selfie with camera
  const takeSelfie = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (!result.canceled) setProfilePhoto(result.assets[0].uri);
    } catch (error) {
      console.error("Error taking selfie:", error);
      Alert.alert("Error", "Failed to take photo with camera.");
    }
  };

  // Convert image to base64
  const convertImageToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw error;
    }
  };

  // Signup handler
  const handleSignup = async () => {
    console.log("Signup button pressed");

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Name, email, and password fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (phone && !phoneRegex.test(phone)) {
      Alert.alert("Error", "Please enter a valid phone number.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      console.log("Testing connectivity to:", API_URL);

      // Connectivity test with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const testResponse = await fetch(`${API_URL}/services`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("Connectivity test passed:", testResponse.status);

      let profilePictureBase64 = null;
      
      if (profilePhoto) {
        console.log("Processing profile photo...");
        profilePictureBase64 = await convertImageToBase64(profilePhoto);
        console.log("Profile photo processed");
      }

      const requestBody = {
        name: name,
        email: email,
        phone: phone || null,
        password: password,
        profile_picture: profilePictureBase64
      };

      console.log("Sending request to:", `${API_URL}/register`);
      console.log("Request body (without base64):", { name, email, phone, password, profile_picture: profilePictureBase64 ? "base64_present" : "null" });

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate("Login");
      } else {
        Alert.alert("Signup Failed", data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      let message = "Unable to connect to server.";
      if (error.name === 'AbortError') {
        message = "Request timed out. Server might be slow or unreachable.";
      } else if (error.message.includes('Network request failed')) {
        message = "Network error. Check if server is running and IP is correct.";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="w-full rounded-3xl p-8 space-y-6 border border-white">
          <Text className="text-3xl font-bold text-white text-center">Create Account</Text>
          <Text className="text-gray-400 text-center mb-4">
            Join us by creating your account
          </Text>

          {/* Personal Information */}
          <View className="space-y-4">
            <Text className="text-white font-semibold text-lg">Personal Information</Text>
            
            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Full Name *"
              placeholderTextColor="#A0A0A0"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Email Address *"
              placeholderTextColor="#A0A0A0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Phone Number (Optional)"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Password *"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-500"
              placeholder="Confirm Password *"
              placeholderTextColor="#A0A0A0"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Profile Photo Section */}
          <View className="space-y-3">
            <Text className="text-white font-semibold text-lg">Profile Photo (Optional)</Text>
            <View className="flex-row space-x-3">
              <TouchableOpacity 
                className="flex-1 h-12 bg-white rounded-xl justify-center items-center"
                onPress={pickProfilePhoto}
              >
                <Text className="text-black font-semibold">Upload Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 h-12 bg-gray-300 rounded-xl justify-center items-center"
                onPress={takeSelfie}
              >
                <Text className="text-black font-semibold">Take Selfie</Text>
              </TouchableOpacity>
            </View>
            {profilePhoto && (
              <View className="items-center mt-2">
                <Image 
                  source={{ uri: profilePhoto }} 
                  className="w-24 h-24 rounded-full border-2 border-white"
                />
                <Text className="text-green-400 text-sm mt-1">Profile photo selected</Text>
                <TouchableOpacity 
                  onPress={() => setProfilePhoto(null)}
                  className="mt-1"
                >
                  <Text className="text-red-400 text-xs">Remove photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            className="w-full h-14 bg-white rounded-xl justify-center items-center shadow-lg mt-6"
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text className="text-black font-bold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full mt-4"
            onPress={() => navigation.navigate("Login")}
          >
            <Text className="text-white text-center text-sm">
              Already have an account? <Text className="font-semibold underline">Login here</Text>
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 text-xs text-center mt-2">
            * Required fields
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}