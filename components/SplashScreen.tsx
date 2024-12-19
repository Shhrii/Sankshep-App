import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  ActivityIndicator,
  Text,
} from 'react-native';
import Video from 'react-native-video';

const SplashScreen: React.FC = ({ navigation }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Delay before navigating
    const timer = setTimeout(() => {
      navigation.replace('AuthLoadingScreen');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup
  }, [fadeAnim, navigation]);

  return (
    <View style={styles.container}>
      {/* Background Video with white opacity overlay */}
      <View style={styles.videoWrapper}>
        <Video
          source={require('../assets/bg-video.mp4')} // Replace with your video file
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          muted={true}
          repeat={true}
          rate={1.0}
          ignoreSilentSwitch="obey"
        />
        <View style={styles.overlay} />
      </View>
      {/* Version Label */}
      <Text style={styles.versionLabel}>Version: 2.0.2</Text>
      {/* Animated Logo */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Image
          source={require('../assets/LOGO.png')} // Replace with your logo
          style={styles.logo}
        />
      </Animated.View>
      {/* Fallback Activity Indicator */}
      <ActivityIndicator size="large" color="#0d6b65" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Fallback background color
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    opacity: 0.7, // Adjust opacity as needed
  },
  versionLabel: {
    position: 'absolute',
    top: 20, // Adjust to position the label
    left: 20, // Adjust to position the label
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
