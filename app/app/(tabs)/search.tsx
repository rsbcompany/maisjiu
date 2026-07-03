import { StyleSheet, Text, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f7f4ed',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#1c1c1c',
    fontSize: 24,
    fontWeight: '600',
  },
});
