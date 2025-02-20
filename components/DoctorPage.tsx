import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ActivityIndicator, TouchableOpacity, Share, Animated, TouchableWithoutFeedback,Alert, BackHandler } from 'react-native';
import SwiperFlatList from 'react-native-swiper-flatlist';
import he from 'he';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

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

const DoctorComponent: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [headerVisible, setHeaderVisible] = useState<boolean>(true);
  const navigation = useNavigation<FetchPostsScreenNavigationProp>();

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const bottomNavAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const shuffleArray = (array: Post[]): Post[] => {
    return array.sort(() => Math.random() - 0.5);
  };

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

    const backAction = () => {
      if (navigation.isFocused()) {
        Alert.alert('Hold on!', 'Are you sure you want to exit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  const decodeHTML = (html: string): string => he.decode(html);

  const stripHTML = (html: string): string => html.replace(/<[^>]*>?/gm, '');

  const openUrl = (url: string) => {
    navigation.navigate('WebViewScreen', { url });
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `${decodeHTML(post.title.rendered)}\n\nRead more: ${post.meta?.Source_Link || 'https://sankshep.app'}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -width : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setMenuVisible(!menuVisible));
  };

  const toggleHeaderAndNav = () => {
    Animated.timing(headerAnim, {
      toValue: headerVisible ? -100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(bottomNavAnim, {
      toValue: headerVisible ? 100 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setHeaderVisible(!headerVisible));
  };

  const renderRightActions = (progress: any, dragX: any, post: Post) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100, 101],
      outputRange: [0, 0, 0, 1],
    });

    return (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={() => openUrl(post.meta?.Source_Link || '')}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ translateX: trans }] }]}>
          Open Sources
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0d6b65" />
        <Text style={styles.loaderText}>Your Gateway to Ayurveda...</Text>
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={toggleHeaderAndNav}>
        <SafeAreaView style={styles.container}>
          <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }] }]}>
            <Image source={require('../assets/LOGO.png')} style={styles.logo} />
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Image style={styles.menuIcon} source={require('../assets/menu-icon.png')} />
            </TouchableOpacity>
          </Animated.View>

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
              <Text style={styles.menuItem} onPress={() => navigation.navigate('TermsandConditions' as never)}>
                Terms & Conditions
              </Text>
              <Text style={styles.menuItem} onPress={() => navigation.navigate('PrivacyPolicy' as never)}>
                Privacy Policy
              </Text>
              <Text style={styles.menuItem} onPress={() => navigation.navigate('Logout' as never)}>Logout</Text>
            </Animated.View>
          )}
          
          <SwiperFlatList
            data={posts}
            renderItem={({ item }) => (
              <Swipeable
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                onSwipeableRightOpen={() => openUrl(item.meta?.Source_Link || '')}
              >
                <TouchableWithoutFeedback onPress={toggleHeaderAndNav}>
                  <View style={styles.card}>
                    {item._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium?.source_url ? (
                      <Image
                        style={styles.image}
                        source={{ uri: item._embedded['wp:featuredmedia'][0].media_details.sizes.medium.source_url }}
                      />
                    ) : (
                      <Text style={styles.noImageText}>No image available</Text>
                    )}
                    <View style={styles.postContent}>
                      <Text style={styles.title}>{decodeHTML(item.title.rendered)}</Text>
                      <Text style={styles.content}>
                        {stripHTML(decodeHTML(item.content.rendered)).replace(/\n+/g, ' ').split(' ').slice(0, 60).join(' ') + '...'}
                      </Text>
                      <View style={styles.sharedContainer}>
                        <View style={styles.publishedSection}>
                          <Text style={styles.date}>Published on: {new Date(item.date).toLocaleDateString()}</Text>
                          {item.meta?.Source_Tag && item.meta?.Source_Link ? (
                            <Text style={styles.sourceLink} onPress={() => openUrl(item.meta.Source_Link || '')}>
                              Source: {item.meta.Source_Tag}
                            </Text>
                          ) : (
                            <Text style={styles.sourceLink}>Source: Unknown</Text>
                          )}
                        </View>
                        <View style={styles.shareSection}>
                          <TouchableOpacity onPress={() => handleShare(item)} style={styles.shareButton}>
                            <Image style={styles.shareIcon} source={require('../assets/share-icon.png')} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Swipeable>
            )}
            keyExtractor={(item) => item.id.toString()}
            vertical
            showPagination={false}
          />

          <Animated.View style={[styles.bottomNavigation, { transform: [{ translateY: bottomNavAnim }] }]}>
            <TouchableOpacity
              style={[styles.navButton, styles.activeNavButton]}
              onPress={() => navigation.navigate('Home' as never)}>
              <Image style={styles.Icon} source={require('../assets/news.png')} />
              <Text style={styles.navText}>News</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Poll' as never)}>
              <Image style={styles.Icon} source={require('../assets/polls.png')} />
              <Text style={styles.navText}>Poll</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  card: {
    width: width,
    height: height,
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  image: {
    width: '100%',
    height: height * 0.3,
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
  postContent: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 26,
    color: '#333',
    marginBottom: 5,
  },
  content: {
    paddingVertical: 10,
    fontSize: 20,
    lineHeight: 26,
    color: '#444',
  },
  sharedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  publishedSection: {
    flex: 1,
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
  shareSection: {
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    marginTop: -15,
    padding: 10,
    borderRadius: 50,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  shareIcon: {
    width: 25,
    height: 25,
    objectFit: 'contain',
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
    width: '40%',
    height: undefined,
    aspectRatio: 3,
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
  closeIcon: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },
  menuItem: {
    paddingVertical: 15,
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  menuInnerlogo: {
    width: 60,
    height: 80,
    resizeMode: 'contain',
    marginTop: -50,
  },
  rightAction: {
    backgroundColor: '#0d6b65',
    justifyContent: 'center',
    alignItems: 'center',
    width: 1,
    height: '100%',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    padding: 20,
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activeNavButton: {
    borderColor: '#fff',
    borderBottomWidth: 2,
  },
  Icon: {
    width: 35,
    height: 20,
    color: '#fff',
    objectFit: 'contain',
  },
});

export default DoctorComponent;
