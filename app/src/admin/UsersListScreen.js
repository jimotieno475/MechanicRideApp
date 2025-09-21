
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UsersListScreen() {
  const navigation = useNavigation();

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'Active',
      role: 'user',
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      status: 'Blocked',
      role: 'user',
      createdAt: '2025-02-20T12:30:00Z',
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@example.com',
      status: 'Active',
      role: 'admin',
      createdAt: '2025-01-01T08:00:00Z',
    },
  ];

  const renderItem = ({ item }) => (
    <View className="flex-row justify-between items-center p-4 border-b border-gray-700 bg-gray-800 rounded-lg mb-2 shadow-md">
      <View>
        <Text className="text-white font-semibold">{item.name}</Text>
        <Text className="text-gray-400">{item.email}</Text>
        <Text className="text-gray-400">Status: {item.status}</Text>
        <Text className="text-gray-400 text-sm">
          Joined: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View className="flex-row">
        <TouchableOpacity
          className="bg-blue-500 p-2 rounded mr-2"
          onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
        >
          <Ionicons name="eye" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 p-2 rounded"
          onPress={() => console.log(`Blocking user ${item.id}`)} // Replace with block logic
        >
          <Ionicons name="ban" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black p-4">
      <Text className="text-white text-xl font-bold mb-4">Users List</Text>
      {users.length === 0 ? (
        <Text className="text-gray-400 text-center mt-8">No users found</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </SafeAreaView>
  );
}