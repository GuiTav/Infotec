
import { useContext, useEffect } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { Ip } from "./Globais";


WebBrowser.maybeCompleteAuthSession();


export default function Config() {

    /*  Esta página deve ser a pagina para configurar login, o tema do aplicativo, etc.
        por enquanto, deixaremos a opção de trocar ip do servidor aqui, apenas para testes.
        quando formos liberar ao público, deixar esta opção ativa seria um problema. */

    const {ipAddress, setIpAddress} = useContext(Ip);

    const discovery = useAutoDiscovery("https://login.microsoftonline.com/organizations/v2.0");
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: "a0523025-10cb-4cb7-a7e5-e9400fa3e123",
            scopes: ['openid', 'profile', 'email'],
            redirectUri: makeRedirectUri({
                scheme: 'infotec',
                path: 'auth',
                useProxy: false
            })
        },
        discovery
    );


    return (
        <View style={{height: "100%"}}>
            <Text style={styles.titulo}>CONFIGURAÇÕES</Text>

            <View style={styles.central}>
                <Text style={styles.txtIp}>Endereço IP:</Text>
                <TextInput style={styles.inputIp} onChangeText={(text) => {setIpAddress(text)}}>{ipAddress}</TextInput>

                <Pressable style={styles.btnLogin} onPress={() => {promptAsync()}}>
                    <Text style={styles.txtLogin}>Fazer login</Text>
                </Pressable>


                <Text style={{marginTop: 30}}>{JSON.stringify(response)}</Text>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    titulo: {
        width: "100%",
        backgroundColor: "#190933",
        textAlign: "center",
        fontWeight: "bold",
        color: "white",
        fontSize: 35,
        padding: 5
    },

    central: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center"
    },

    txtIp: {
        fontSize: 20,
        marginBottom: 10,
        width: "100%"
    },

    inputIp: {
        width: "100%",
        fontSize: 20,
        padding: 10,
        paddingLeft: 15,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: "#ff3366",
        color: "#ff3366"
    },

    btnLogin: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        backgroundColor: "#0880d5",
        borderRadius: 15,
        marginTop: 40
    },

    txtLogin: {
        fontSize: 25,
        color: "white"
    }
})