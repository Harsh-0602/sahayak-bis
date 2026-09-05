import { Tabs } from 'expo-router';
import { BookOpen, Clock3, Compass, UserRound } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#06294C',
        tabBarInactiveTintColor: '#89919B',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { height: 76, paddingTop: 8, paddingBottom: 12, borderTopColor: '#E9E7E1', backgroundColor: '#FFFCF6' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} />
      <Tabs.Screen name="saved" options={{ title: 'Sources', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color, size }) => <Clock3 color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
