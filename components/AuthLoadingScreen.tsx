import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const AuthLoadingScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch role from AsyncStorage
          const role = await AsyncStorage.getItem('userRole');
          if (role === 'Doctor') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'DoctorPage' }],
            });
          } else if (role === 'NonDoctor') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'NonDoctorPage' }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        } catch (error) {
          console.error('Error retrieving user role:', error);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } else {
        // Navigate to login if no user is signed in
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      setIsLoading(false); // End loading state
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [navigation]);

  if (isLoading) {
    // Keep showing the loader until navigation is resolved
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0d6b65" />
      </View>
    );
  }

  return null; // Prevent rendering anything after loading
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    
  },
});

export default AuthLoadingScreen;
