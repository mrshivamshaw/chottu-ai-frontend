// components/Sidebar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RelativePathString } from 'expo-router';

const menuItems = [
  { name: 'Home', icon: 'home-outline', path: '/' as const },
  { name: 'Transaction History', icon: 'time-outline', path: '/history' as const },
  { name: 'Products', icon: 'cube-outline', path: '/products' as const },
  { name: 'Upload', icon: 'cloud-upload-outline', path: '/upload' as const },
//   { name: 'Logout', icon: 'log-out-outline', path: '/logout' as const },
];

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  activePath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose, activePath }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-250)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Use state to track if animation is complete
  const [isAnimationComplete, setIsAnimationComplete] = useState(!visible);

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsAnimationComplete(false);
      });
    } else {
      // Slide out and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -250,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsAnimationComplete(true);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  // If sidebar is not visible and animation is complete, don't render anything
  if (!visible && isAnimationComplete) {
    return null;
  }

  // Function to handle navigation with type safety
  const handleNavigation = (path: string) => {
    onClose();
    
    // Find the matching menu item path
    const menuItem = menuItems.find(item => item.path === path);
    
    if (menuItem) {
        router.push(menuItem.path as RelativePathString);
      } else {
        // Fallback to navigate to home if path doesn't match any menu item
        router.push('/');
      }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] }
          ]}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Menu</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-outline" size={28} color="#333" />
            </Pressable>
          </View>
          
          {menuItems.map((item) => (
            <Pressable
              key={item.name}
              style={[
                styles.menuItem,
                activePath === item.path && styles.activeMenuItem,
              ]}
              onPress={() => handleNavigation(item.path)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={activePath === item.path ? '#ffffff' : '#333333'}
              />
              <Text
                style={[
                  styles.menuText,
                  activePath === item.path && styles.activeMenuText,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 100,
  },
  overlay: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    height: '100%',
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 50, // Make room for status bar
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  activeMenuItem: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333333',
  },
  activeMenuText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default Sidebar;