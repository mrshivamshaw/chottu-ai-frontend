// app/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import Sidebar from '@/components/Sidebar';
import { useState, useEffect } from 'react';

export default function RootLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarVisible(false);
  }, [pathname]);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <View style={{ flex: 1 }}>
        {/* Your screen routing area */}
        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: colors.background,
            },
            headerShown: false,
          }}
        />

        {/* Hamburger Button - only show when sidebar is closed */}
        {!sidebarVisible && (
          <Pressable
            onPress={() => setSidebarVisible(true)}
            style={{
              position: 'absolute',
              top: 50,
              left: 20,
              zIndex: 99, // Lower than sidebar but above content
              backgroundColor: '#fff',
              padding: 10,
              borderRadius: 50,
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Ionicons name="menu-outline" size={28} color="#333" />
          </Pressable>
        )}
      </View>

      {/* Sidebar is always last in the component tree to ensure it's on top */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activePath={pathname}
      />
    </>
  );
}