import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

type RootStackParamList = {
  FetchPosts: undefined;
  Home: undefined;
  Poll: undefined;
  DoctorPage: undefined;
};

type FetchPostsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FetchPosts'>;

interface FetchPostsProps {
  navigation: FetchPostsScreenNavigationProp;
}

const FetchPosts: React.FC<FetchPostsProps> = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  const isFocused = useIsFocused();

  const webViewRef = useRef<WebView>(null);

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -Dimensions.get('window').width : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(!menuVisible));
  };

  const refreshPage = () => {
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      {/* Header with Logo and Menu */}
      <View style={styles.header}>
        <Image source={require('../assets/LOGO.png')} style={styles.logo} />
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Image style={styles.menuIcon} source={require('../assets/menu-icon.png')} />
        </TouchableOpacity>
      </View>

      {/* Slide-In Menu */}
      {menuVisible && (
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
          <Image style={styles.closeIcon} source={require('../assets/close.png')} />
          </TouchableOpacity>
          <Image style={styles.menuInnerlogo} source={require('../assets/menu-logo.png')} />
          <Text style={styles.menuItem} onPress={toggleMenu}>Research</Text>
          <Text style={styles.menuItem} onPress={toggleMenu}>Case Studies</Text>
          <Text style={styles.menuItem} onPress={toggleMenu}>Dosha Imbalance</Text>
          <Text style={styles.menuItem} onPress={toggleMenu}>Health Focus</Text>
          <Text style={styles.menuItem} onPress={toggleMenu}>Ayurvedic Recipes</Text>
          <Text style={styles.menuItem} onPress={() => navigation.navigate('Logout' as never)}>Logout</Text>
        </Animated.View>
      )}

      {/* WebView to display the poll */}
      <WebView 
        ref={webViewRef}
        source={{ uri: 'https://sankshep.app/poll/' }} 
        style={styles.webview} 
      />

      {/* Refresh Button at the bottom center */}
      <TouchableOpacity onPress={refreshPage} style={styles.refreshButton}>
        <Text style={styles.refreshText}>Refresh the Poll</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('NonDoctorPage' as never)}>
        <Image style={styles.Icon} source={require('../assets/news.png')}/>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, isFocused ? styles.activeNavButton : null]} onPress={() => navigation.navigate('Pollx' as never)}>
          <Image style={styles.Icon} source={require('../assets/polls.png')}/>
          <Text style={styles.navText}>Polls</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Icon:{
    width:35,
    height:20,
    color:'#fff',
    objectFit:'contain',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 15,
    zIndex: 10,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: 'contain',
  },
  menuButton: {
    padding: 10,
  },
  menuIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#efefef',
    padding: 20,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    zIndex: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  closeIcon:{
    width:30,
    height:30,
    objectFit:'contain',
  },
  menuItem: {
    paddingVertical: 15,
    color:'#000',
    fontSize:16,
    fontWeight:'600',
  },
  menuInnerlogo:{
    width:60,
    height:80,
    objectFit:'contain',
    marginTop:-50,
  },
  webview: {
    flex: 1,
    marginTop: 100, // adjust marginTop as needed to prevent overlap with header
  },
  refreshButton: {
    position: 'absolute',
    bottom: 100, // Positioned above the bottom navigation
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f17222',
    borderRadius: 5,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0d6b65',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeNavButton: {
    borderColor: '#fff',
    padding: 5,
    borderBottomWidth:2,
  },
  activeNavText: {
    color: '#ffcc00',
  },
});

export default FetchPosts;
