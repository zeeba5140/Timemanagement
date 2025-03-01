// History Screen Implementation

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Sharing from 'expo-sharing';

const HistoryScreen = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const storedHistory = await AsyncStorage.getItem('history');
    if (storedHistory) setHistory(JSON.parse(storedHistory));
  };

 

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Timer History</Text>
      <FlatList
        data={history}
        renderItem={({ item }) => <Text style={styles.historyItem}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Export History" onPress={exportHistory} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  historyItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
});

export default HistoryScreen;