import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import he from 'he';

interface Post {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  meta?: {
    Source_Link?: string;
    Source_Tag?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      media_details: {
        sizes: {
          medium?: {
            source_url: string;
          };
        };
      };
    }>;
  };
}

type RootStackParamList = {
  FetchPosts: undefined;
  Home: undefined;
  Poll: undefined;
  DoctorPage: undefined;
  WebViewScreen: { url: string };
};

type FetchPostsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FetchPosts'>;

interface FetchPostsProps {
  navigation: FetchPostsScreenNavigationProp;
}

const shuffleArray = (array: Post[]): Post[] => array.sort(() => Math.random() - 0.5);

const FetchPosts: React.FC<FetchPostsProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const slideAnim = useRef(new Animated.Value(-Dimensions.get('window').width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isFocused = useIsFocused();

  const fetchPosts = async () => {
    try {
      setError(null);
      const categoriesResponse = await fetch('https://sankshep.app/wp-json/wp/v2/categories');
      if (!categoriesResponse.ok) {
        throw new Error(`Failed to fetch categories. Status: ${categoriesResponse.status}`);
      }
      const categories = await categoriesResponse.json();

      const doctorCategory = categories.find((category: any) => category.name.toLowerCase() === 'doctor');
      if (!doctorCategory) {
        throw new Error('Doctor category not found.');
      }

      const response = await fetch(
        `https://sankshep.app/wp-json/wp/v2/posts?_embed&categories=${doctorCategory.id}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch posts. Status: ${response.status}`);
      }

      const data: Post[] = shuffleArray(await response.json());
      setPosts(data);
      setIsLoading(false);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const decodeHTML = (html: string): string => he.decode(html);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -Dimensions.get('window').width : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(!menuVisible));
  };

  const handleSourceClick = (url: string) => {
    try {
      new URL(url); // Validate URL
      navigation.navigate('WebViewScreen', { url });
    } catch (err) {
      Alert.alert('Invalid URL');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0d6b65" />
        <Text style={styles.loaderText}>Your Gateway to Ayurvedic Insights...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPosts}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/LOGO.png')} style={styles.logo} />
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Image style={styles.menuIcon} source={require('../assets/menu-icon.png')} />
        </TouchableOpacity>
      </View>

      {/* Menu */}
      {menuVisible && (
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
            {/* <Text style={styles.closeText}>X</Text> */}
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

      {/* Posts */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {posts.map(post => (
          <Animated.View key={post.id} style={[styles.postContainer, { opacity: fadeAnim }]}>
            {post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ? (
              <Image
                style={styles.image}
                source={{ uri: post._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url }}
              />
            ) : (
              <Text style={styles.noImageText}>No image available</Text>
            )}
            <View style={styles.postContent}>
              <Text style={styles.title}>{decodeHTML(post.title.rendered)}</Text>
              <Text style={styles.content}>{decodeHTML(post.excerpt.rendered.replace(/<[^>]+>/g, ''))}</Text>
              <Text style={styles.date}>Published on: {new Date(post.date).toLocaleDateString()}</Text>
              {post.meta?.Source_Tag && post.meta?.Source_Link ? (
                <Text style={styles.sourceLink} onPress={() => handleSourceClick(post.meta.Source_Link || '')}>
                  Source: {post.meta.Source_Tag}
                </Text>
              ) : (
                <Text style={styles.sourceLink}></Text>//Source: Unknown
              )}
            </View>
          </Animated.View>
        ))}
      </ScrollView>
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navButton, isFocused ? styles.activeNavButton : null]}
          onPress={() => navigation.navigate('Doctorpage' as never)}>
          <Image style={styles.Icon} source={require('../assets/news.png')}/>
          <Text style={styles.navText}>News</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Poll')}>
        <Image style={styles.Icon} source={require('../assets/polls.png')}/>
          <Text style={styles.navText}>Poll</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    width: 150,
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
  closeText: {
    fontSize: 24,
    color: '#f2782c',
  },
  closeIcon:{
    width:30,
    height:30,
    objectFit:'contain',
  },
  menuItem: {
    paddingVertical: 15,
    color: '#000',
    fontSize: 16,
    fontWeight:'600',
  },
  menuInnerlogo: {
    width: 60,
    height: 80,
    resizeMode: 'contain',
    marginTop: -50,
  },
  scrollContent: {
    paddingTop: 70,
    paddingBottom: 50,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  postContainer: {
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    padding: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#0d6b65',
    marginBottom: 5,
  },
  sourceLink: {
    fontSize: 14,
    color: '#3366CC',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 0,
    marginBottom: 10,
  },
  noImageText: {
    fontSize: 14,
    color: '#bbb',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  postContent:{
    padding:10,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#444',
  },
  errorContainer:{},errorText:{},retryButton:{},retryText:{}
});

export default FetchPosts;
