import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ColorValue, StyleSheet } from 'react-native';

const TAB_BAR_HEIGHT = 56;

export default function TabLayout() {
  return (
    <Tabs screenOptions={getTabScreenOptions()}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <SearchIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

function getTabScreenOptions() {
  return {
    headerShown: false,
    tabBarActiveTintColor: '#1c1c1c',
    tabBarInactiveTintColor: '#5f5f5d',
    tabBarLabelStyle: styles.tabBarLabel,
    tabBarStyle: styles.tabBar,
  };
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f7f4ed',
    borderTopColor: '#eceae4',
    borderTopWidth: 1,
    height: TAB_BAR_HEIGHT,
  },
  tabBarLabel: {
    fontSize: 12,
  },
});

function HomeIcon({ color }: { color: ColorValue }) {
  return (
    <SymbolView
      name={{ android: 'home', ios: 'house', web: 'home' }}
      size={22}
      tintColor={color}
    />
  );
}

function SearchIcon({ color }: { color: ColorValue }) {
  return (
    <SymbolView
      name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }}
      size={22}
      tintColor={color}
    />
  );
}
