import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


/* ------------------ TESTE DE ACESSO AO FIREBASE ------------------

import { useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';

import db from './src/firebaseConfig';


const caminho = ref(db, 'posts/');

function salvaTeste(autor, titulo) {
  set(caminho, {
    "autor": autor,
    "titulo": titulo
  });
}

salvaTeste("Mudando", "Esse tbm");

*/

export default function App() {
  
  /* ------------------ TESTE DE ACESSO AO FIREBASE ------------------

  useEffect (() => {
    onValue(caminho, (snapshot) => {
      const autor = snapshot.val().autor;
      console.log("Autor: " + autor);
    });
  });

  */


  return (
    <View style={styles.container}>
      <Text>Hello World!</Text>
      <StatusBar style="auto" />
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
