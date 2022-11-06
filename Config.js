
import { useContext, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { exchangeCodeAsync, makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { Ip, User } from "./Globais";
import { Buffer } from "buffer";


WebBrowser.maybeCompleteAuthSession();


export default function Config() {

    /*  Esta página deve ser a pagina para configurar login, o tema do aplicativo, etc.
        por enquanto, deixaremos a opção de trocar ip do servidor aqui, apenas para testes.
        quando formos liberar ao público, deixar esta opção ativa seria um problema. */

    const {ipAddress, setIpAddress} = useContext(Ip);
    const {usuario, setUsuario} = useContext(User);


    const [token, setToken] = useState(null);
    const discovery = useAutoDiscovery("https://login.microsoftonline.com/organizations/v2.0");
    const [request, response, promptAsync] = useAuthRequest(
        {
            clientId: "a0523025-10cb-4cb7-a7e5-e9400fa3e123",
            scopes: ['openid', 'User.Read'],
            redirectUri: makeRedirectUri({
                scheme: 'infotec',
                path: 'auth',
                useProxy: false
            }),
            extraParams: {prompt: "select_account"}
        },
        discovery
    );


    useEffect(() => {
        if (usuario == null) {
            if (response != null) {
                if (response.type == "success") {
                    getToken();
                }
            }
        }
    }, [response]);


    async function getToken(){
        var tokenObject = await exchangeCodeAsync({
            clientId: request.clientId,
            scopes: request.scopes,
            redirectUri: request.redirectUri,
            code: response.params.code,
            extraParams: {code_verifier: request.codeVerifier}
        },
        discovery);

        setToken(tokenObject);
    }


    useEffect(() => {
        if (token != null) {
            buscaInfo();
        }
    }, [token]);


    async function buscaInfo() {
        try{
            const controller = new AbortController();
            var timeoutGraph = setTimeout(() => {controller.abort()}, 20000);
            var dados = await fetch("https://graph.microsoft.com/v1.0/me", {headers: { "Authorization": token.accessToken }, signal: controller.signal});
            var dadosJson = await dados.json();
    
            var blobInfo = await fetch("https://graph.microsoft.com/v1.0/me/photos/240x240/$value", {headers: { "Authorization": token.accessToken }, signal: controller.signal});
            var blob = await blobInfo.blob();
        } catch (error) {
            ToastAndroid.show("Houve um erro ao acessar suas informações, tente novamente", ToastAndroid.SHORT);
            return;
        } finally {
            clearTimeout(timeoutGraph);
        }

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
            const b64data = reader.result;
            const cleanb64 = b64data.split(",")[1];
            const hexadec = Buffer.from(cleanb64, "base64").toString("hex");
            salvaPerfil({nome: dadosJson.displayName, email: dadosJson.mail, fotoPerfil: hexadec});
        }
    }

    async function salvaPerfil({nome, email, fotoPerfil}) {
        var existeJson;

        try {
            var controller = new AbortController();
            var timer = setTimeout(() => {controller.abort()}, 10000);
            var perfilExiste = await fetch("http://" + ipAddress + ":8000/usuario/" + email, {signal: controller.signal});
            existeJson = await perfilExiste.json();
        } catch (error) {
            ToastAndroid.show("Houve uma falha ao identificar seu perfil nos nossos servidores.", ToastAndroid.SHORT);
            return;
        } finally {
            clearTimeout(timer);
        }


        if (existeJson.resposta.length == 0){
            var request = JSON.stringify({
                tabela: "usuario",
                dados: [nome, email, "0x" + fotoPerfil]
            });


            var postJson;

            try {
                var controllerPost = new AbortController();
                var timerPost = setTimeout(() => {controllerPost.abort()}, 15000);
                var add = await fetch("http://" + ipAddress + ":8000/", {body: request, method: "POST", signal: controllerPost.signal})
                postJson = await add.json();
            } catch (error) {
                ToastAndroid.show("Houve uma falha ao cadastrar o seu perfil, tente novamente", ToastAndroid.SHORT);
                return;
            } finally {
                clearTimeout(timerPost);
            }
            ToastAndroid.show("Perfil criado!", ToastAndroid.SHORT);


            var getJson;

            try {
                var controllerGet = new AbortController();
                var timerGet = setTimeout(() => {controllerGet.abort()}, 15000);
                var get = await fetch("http://" + ipAddress + ":8000/usuario/" + email, {signal: controllerGet.signal});
                getJson = await get.json();
            } catch (error) {
                ToastAndroid.show("Houve um erro ao carregar o seu perfil", ToastAndroid.SHORT);
                return;
            } finally {
                clearTimeout(timerGet);
            }

            setUsuario(getJson.resposta[0]);
        }


        else {
            var request = JSON.stringify({
                tabela: "usuario",
                dados: {
                    "nomeUsuario": nome,
                    "email": email,
                    "fotoPerfil": "0x" + fotoPerfil
                },
                id: existeJson.resposta[0].idUsuario
            });


            var updateJson;

            try {
                var controllerUpdate = new AbortController();
                var timerUpdate = setTimeout(() => {controllerUpdate.abort()}, 15000);
                var update = await fetch("http://" + ipAddress + ":8000/", {body: request, method: "PUT", signal: controllerUpdate.signal});
                updateJson = await update.json();
            } catch (error) {
                ToastAndroid.show("Houve uma falha ao atualizarmos o seu perfil.", ToastAndroid.SHORT);
            } finally {
                clearTimeout(timerUpdate);
            }


            var getJson;

            try {
                var controllerGet = new AbortController();
                var timerGet = setTimeout(() => {controllerGet.abort()}, 15000);
                var get = await fetch("http://" + ipAddress + ":8000/usuario/" + email, {signal: controllerGet.signal});
                getJson = await get.json();
            } catch (error) {
                ToastAndroid.show("Houve um erro ao carregar o seu perfil", ToastAndroid.SHORT);
                return;
            } finally {
                clearTimeout(timerGet);
            }

            ToastAndroid.show("Perfil carregado!", ToastAndroid.SHORT);
            setUsuario(getJson.resposta[0]);
        }
    }



    function saidaUsuario() {
        setToken(null);
        setUsuario(null);
    }


    return (
        <View style={{height: "100%"}}>
            <Text style={styles.titulo}>CONFIGURAÇÕES</Text>

            <View style={styles.central}>
                <Text style={styles.txtIp}>Endereço IP:</Text>
                <TextInput style={styles.inputIp} onChangeText={(text) => {setIpAddress(text)}}>{ipAddress}</TextInput>

                {usuario != null ?
                    <View style={styles.perfil}>
                        <Image style={styles.imgPerfil} source={{uri: "data:image/jpg;base64," + Buffer.from(usuario.fotoPerfil || "", "hex").toString("base64")}}/>
                        <View style={styles.nomeEmail}>
                            <Text style={styles.txtPerfil}>{usuario.nomeUsuario}</Text>
                            <Text style={styles.txtPerfil}>{usuario.email}</Text>
                        </View>
                    </View>
                :
                    <></>
                }


                {usuario == null ?
                    <Pressable style={styles.btnLogin} onPress={() => {promptAsync()}}>
                        <Text style={styles.txtLogin}>Fazer login</Text>
                    </Pressable>
                :
                    <Pressable style={[styles.btnLogin, {backgroundColor: "red"}]} onPress={() => {saidaUsuario()}}>
                        <Text style={styles.txtLogin}>Sair</Text>
                    </Pressable>
                }
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
        color: "#ff3366",
        marginBottom: 20
    },

    perfil: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        padding: 20
    },

    imgPerfil: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 20,
        resizeMode: "contain",
        backgroundColor: "red"
    },

    nomeEmail: {
        flex: 1
    },

    txtPerfil: {
        fontSize: 15
    },

    btnLogin: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: "#0880d5",
        borderRadius: 15
    },

    txtLogin: {
        fontSize: 25,
        color: "white"
    }
})