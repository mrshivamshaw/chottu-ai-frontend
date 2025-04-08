import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
};

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://f0a9-2409-40e4-1007-6b8f-847f-e2f2-c308-7a1a.ngrok-free.app/products/');
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>Price: ₹{item.price}</Text>
      <Text>Unit: {item.unit}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📦 Product List</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : 
      products.length! > 0 ? (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text>No products available</Text>
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
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProductsList;
