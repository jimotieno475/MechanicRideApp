// File: src/screens/LoginPage.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../config";
import { useUser } from "../contexts/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { setUser, setMechanic, setAdmin } = useUser(); // <-- add setAdmin

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Alert.alert("Login failed", errorData.error || "Unknown error");
        return;
      }

      const data = await response.json();

      // Save to context and navigate based on role
      if (data.role === "user") {
        setUser(data.user);       // store logged-in user
        setMechanic(null);        // clear mechanic just in case
        setAdmin(null);           // clear admin
        navigation.replace("UserTabs");
      } else if (data.role === "mechanic") {
        setMechanic(data.mechanic); // store logged-in mechanic
        setUser(null);              // clear user
        setAdmin(null);             // clear admin
        navigation.replace("MechanicTabs");
      } else if (data.role === "admin") { // <-- ADD ADMIN LOGIN
        setAdmin(data.admin);        // store logged-in admin
        setUser(null);               // clear user
        setMechanic(null);           // clear mechanic
        navigation.replace("AdminTabs");
      } else {
        Alert.alert("Login failed", "Unknown role");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login failed", "Check your connection and try again.");
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center p-6">
      <View className="w-full max-w-sm rounded-3xl p-8 space-y-6 border border-white">
        <Text className="text-4xl font-bold text-white text-center">Login</Text>

        {/* Email */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Password */}
        <TextInput
          className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        {/* Login Button */}
        <TouchableOpacity
          className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg mt-4"
          onPress={handleLogin}
        >
          <Text className="text-black font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>

        {/* Signup Links */}
        <TouchableOpacity
          className="w-full mt-4"
          onPress={() => navigation.navigate("Signup")}
        >
          <Text className="text-white text-center text-sm">
            Don't have an account?{" "}
            <Text className="font-semibold underline">Sign up here</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full mt-2"
          onPress={() => navigation.navigate("MechanicSignup")}
        >
          <Text className="text-white text-center text-sm">
            Register as a mechanic{" "}
            <Text className="font-semibold underline">Register here</Text>
          </Text>
        </TouchableOpacity>

        {/* Admin Login Hint */}
        <View className="mt-4 p-3 bg-gray-800 rounded-lg">
          <Text className="text-gray-300 text-center text-xs">
            Admin? Use: admin@mechapp.com / admin123
          </Text>
        </View>
      </View>
    </View>
  );
}





// import React, { useState } from "react";
// import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
// import { useNavigation } from '@react-navigation/native';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigation = useNavigation();

//   const handleLogin = async (role) => {
//     try {
//       // Send login request to backend
//       const response = await fetch("http://127.0.0.1:5000/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password })
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         Alert.alert("Login failed", errorData.error || "Unknown error");
//         return;
//       }

//       const data = await response.json();
//       console.log("Login successful:", data);

//       // Navigate based on role
//       switch(role) {
//         case 'user':
//           navigation.navigate('UserTabs', { user: data.user });
//           break;
//         case 'mechanic':
//           navigation.navigate('MechanicTabs', { mechanic: data.user });
//           break;
//         case 'admin':
//           navigation.navigate('AdminTabs', { admin: data.user });
//           break;
//         default:
//           Alert.alert("Login successful", `Welcome ${data.user.name}`);
//       }

//     } catch (err) {
//       console.error("Login error:", err);
//       Alert.alert("Login error", "Could not connect to server");
//     }
//   };

//   return (
//     <View className="flex-1 bg-black justify-center items-center p-6">
//       <View className="w-full max-w-sm rounded-3xl p-8 space-y-10 border border-white">
//         {/* Title */}
//         <Text className="text-4xl font-bold text-white text-center">Login</Text>

//         {/* Email Input */}
//         <TextInput
//           className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
//           placeholder="Email"
//           placeholderTextColor="#A0A0A0"
//           keyboardType="email-address"
//           value={email}
//           onChangeText={setEmail}
//         />

//         {/* Password Input */}
//         <TextInput
//           className="w-full h-12 px-4 rounded-xl border border-white text-white placeholder-gray-400"
//           placeholder="Password"
//           placeholderTextColor="#A0A0A0"
//           secureTextEntry
//           value={password}
//           onChangeText={setPassword}
//         />

//         {/* General Login Button */}
//         <TouchableOpacity
//           className="w-full h-12 bg-white rounded-xl justify-center items-center shadow-lg"
//           onPress={() => handleLogin('general')}
//         >
//           <Text className="text-black font-semibold text-lg">Sign In</Text>
//         </TouchableOpacity>

//         <View className="w-full h-px bg-gray-600 my-4" />

//         {/* Role-based Navigation Buttons */}
//         <View className="space-y-6">
//           <TouchableOpacity
//             className="w-full h-12 rounded-xl border border-white justify-center items-center"
//             onPress={() => handleLogin('user')}
//           >
//             <Text className="text-white font-semibold text-lg">Login as User</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="w-full h-12 rounded-xl border border-white justify-center items-center"
//             onPress={() => handleLogin('mechanic')}
//           >
//             <Text className="text-white font-semibold text-lg">Login as Mechanic</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="w-full h-12 rounded-xl border border-white justify-center items-center"
//             onPress={() => handleLogin('admin')}
//           >
//             <Text className="text-white font-semibold text-lg">Login as Admin</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Links */}
//         <TouchableOpacity
//           className="w-full mt-8"
//           onPress={() => navigation.navigate('Signup')}
//         >
//           <Text className="text-white text-center text-sm">
//             Don't have an account? <Text className="font-semibold underline">Sign up here</Text>
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="w-full mt-4"
//           onPress={() => navigation.navigate('MechanicSignup')}
//         >
//           <Text className="text-white text-center text-sm">
//             Register as a mechanic <Text className="font-semibold underline">Register here</Text>
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }
