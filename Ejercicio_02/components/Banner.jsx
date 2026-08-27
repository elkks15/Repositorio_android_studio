import { StyleSheet, View, Text } from 'react-native';

export default function Banner ({children, titulo}) {
    return (
        <View style={styles.banner}>
            <Text>{titulo}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        color: "blue",

    },
})