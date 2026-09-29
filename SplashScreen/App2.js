import { Animated, View, Text, StyleSheet } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export default function App2() {
    const rotate = useRef(new Animated.Value(0)).current;
    const position = useRef(new Animated.Value(300)).current;
    useEffect(() => { Animated.timing(position, { toValue: -300, duration: 5000, useNativeDriver: true }).start(); }, []);
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(() => { Animated.timing(opacity, { toValue: 1, duration: 5000, useNativeDriver: true }).start(); }, []);
    useEffect(() => { Animated.timing(rotate, { toValue: 1, duration: 5000, useNativeDriver: true }).start(); }, []);
    const rotate2 = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    const scale = useRef(new Animated.Value(0.1)).current;
    useEffect(() => { Animated.timing(scale, { toValue: 10, duration: 5000, useNativeDriver: true }).start(); }, []);
    const scale2 = scale.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
    });
    useEffect(() => { Animated.timing(scale, { toValue: 1, duration: 5000, useNativeDriver: true }).start(); }, []);
    return (    
        <View style={styles.container}>
            <Animated.Text style={{ fontSize: 100, fontWeight: 'bold', color: '#000', opacity : opacity, transform: [{ translateY: position }, { rotate: rotate2 }, { scale: scale }] }}>
            🚀 
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});