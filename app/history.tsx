import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

type Transaction = {
  id: number;
  name: string;
  quantity: number;
  amount: number;
  transaction_type: string;
  timestamp: string;
};

const TransactionsList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://acaa-2409-40e5-1059-b714-154e-f9df-4088-acb1.ngrok-free.app/transactions/');
      const data: Transaction[] = await response.json();
      setTransactions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Qty: {item.quantity}</Text>
      <Text>Amount: ₹{item.amount}</Text>
      <Text>Type: {item.transaction_type}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💸 Recent Transactions</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        transactions.length > 0 ? (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
            <Text>No transactions available</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});

export default TransactionsList;
