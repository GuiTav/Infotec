
import { useState, useEffect } from "react";
import { StyleSheet, View, TextInput, Text, Pressable, Modal, ScrollView, Image, ToastAndroid} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';



function CriaPost(props) {

    const ipAddress = props.ip;

    const[titulo, setTitulo] = useState("");
    const[categVisible, setCategVisible] = useState(false);
    const[categoria, setCategoria] = useState("");
    const[conteudo, setConteudo] = useState("");
    const[calendarVisible, setCalendarVisible] = useState(false);
    const[dataValid, setDataValid] = useState(new Date());
    const[anexos, setAnexos] = useState([]);
    const idAutor = 1; // Este ID deve vir de fora da tela. Por enquanto ele vai ser só mudado por aqui

    var categorias = ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS", "ADMINISTRAÇÃO",
    , "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"];



    /* ------------------------ FUNÇÕES NÃO VISUAIS ---------------------- */

    useEffect(() => {
        /* Apenas limpando o cache antes de executar qualquer coisa */
        FileSystem.deleteAsync(FileSystem.cacheDirectory + "DocumentPicker", {idempotent: true});
    }, []);


    async function achaArquivo() {
        var promise = await DocumentPicker.getDocumentAsync();
        if (promise.type == 'cancel') {
            return;
        }
        if (promise.size > 16777216) {
            ToastAndroid.show("Não é possível selecionar arquivos maiores que 16Mb", ToastAndroid.SHORT);
            await FileSystem.deleteAsync(promise.uri);
            return;
        }

        setAnexos([...anexos, promise]);
        return;
    }

    async function excluiArquivo(id) {
        var arquivo = anexos[id];
        await FileSystem.deleteAsync(arquivo.uri);
        var novoArray = anexos;
        novoArray.splice(id, 1);
        setAnexos([...novoArray]);
        return;
    }


    async function enviaPost() {
        if (titulo == "" || categoria == "" || conteudo == "") {
            ToastAndroid.show("Os campos 'título', 'categoria' e 'conteudo' são obrigatórios.", ToastAndroid.SHORT);
            return;
        }

        var request = {tabela: "publicacao", dados: [
            titulo,
            new Date().toISOString().split("T")[0],
            categoria,
            dataValid.toISOString().split("T")[0],
            new Date().toISOString().split("T")[0],
            conteudo,
            idAutor
        ]};

        if (anexos.length != 0) {

            var blobs = [];
            for (let i = 0; i < anexos.length; i++) {
                var elemento = anexos[i];
                var arquivo = await FileSystem.readAsStringAsync(elemento.uri, {encoding: "base64"});
                blobs = [...blobs, "0x" + Buffer.from(arquivo, "base64").toString("hex")];
            }

            request["anexo"] = anexos.map((value, index) => {
                return ([blobs[index], value.name]);
            })
        }

        var json = JSON.stringify(request);
        try {
            var result = await fetch("http://" + ipAddress + ":8000", {body: json, method: "POST"});
            var resultJson = await result.json();
            if (resultJson.erro != "") {
                throw resultJson.erro;
            }
        } catch (error) {
            console.log(error);
            return;
        }

        ToastAndroid.show("Post realizado com sucesso!", ToastAndroid.SHORT);
        return;
    }


    /* ----------------------- ESTILOS INTERATIVOS -------------------- */

    const intStyles = StyleSheet.create(
        categoria != "" ? {
            btnCategoria: {
                borderColor: "#ff3366"
            },

            txtCategoria: {
                color: "#ff3366"
            },

            setaCateg: {
                tintColor: "#ff3366",
                opacity: 0.9
            }
        } : {}
    )



    /* ------------------------ RETURN PRINCIPAL ------------------------ */

    return(
    <ScrollView>
        <Modal
            animationType="fade"
            transparent={true}
            visible={categVisible}
            onRequestClose={() => {
                setCategVisible(false)
            }}>
            <Pressable style={styles.modalBackground} onPress={() => {setCategVisible(false)}}>
                <View style={styles.modalView}>
                    <ScrollView>
                        {categorias.map((value, index) => {
                            return(
                                <Pressable style={{width: "100%", height: 60, justifyContent: "center"}} key={index}
                                    onPress={() => {
                                        setCategoria(value);
                                        setCategVisible(false);    
                                    }}>
                                    <Text style={{fontSize: 20, textAlign: "center"}}>{value}</Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>



        <Text style={styles.titulo}>NOVA POSTAGEM</Text>
        <View style={styles.geral}>
            <TextInput style={styles.textbox} placeholder='Título' multiline={true} onChangeText={(text) => {
                setTitulo(text);
            }}></TextInput>

            <Pressable
                style={[styles.btnCategoria, intStyles.btnCategoria]}
                onPress={() => {setCategVisible(true)}}>
                <Text style={[styles.txtCategoria, intStyles.txtCategoria]}>
                    {categoria == "" ? "Selecione uma categoria" : categoria}
                </Text>
                <Image source={require("./assets/SetaBaixo.png")} style={[{width: 20, height: 20}, intStyles.setaCateg]}/>
            </Pressable>

            <TextInput style={[styles.textbox]} multiline={true} placeholder='Mensagem' onChangeText={(text) => {
                setConteudo(text);
            }}/>
            
            <Pressable style={styles.btnCalendario} onPress={() => {setCalendarVisible(true)}}>
                <Image source={require("./assets/BtnCalendarioBTApp.png")} style={styles.btnCalendarioImg}/>
                <View>
                    <Text style={{fontSize: 15, color: "#ff3366"}}>
                        Escolha uma data de validade
                    </Text>
                    <Text style={{fontSize: 15, color: "#ff3366"}}>
                        {"Data: " + dataValid.getDate() + "/" + (dataValid.getMonth() + 1) + "/" + dataValid.getFullYear()}
                    </Text>
                </View>
            </Pressable>
            {calendarVisible ?
                <RNDateTimePicker
                    mode="date"
                    onChange={(event, date) => {setCalendarVisible(false); setDataValid(date)}}
                    value={dataValid}
                    minimumDate={new Date()}/>
                :
                <></>
            }

            
            <View style={styles.anexos}>
                <Text style={{fontSize: 20, marginBottom: 5}}>Anexos:</Text>
                {
                    anexos.map((value, index) => {
                        return(
                            <View key={index} style={{flexDirection: "row", marginTop: 5, alignItems: "center", justifyContent: "space-between"}}>
                                <Text style={{fontSize: 15, maxWidth: "70%"}}>{value.name}</Text>
                                <Pressable style={{padding: 5}} onPress={() => {excluiArquivo(index)}}><Text style={{fontSize: 15, color: "red"}}>Deletar</Text></Pressable>
                            </View>
                        )
                    })
                }
                <Pressable style={styles.btnAddAnexo} onPress={() => {achaArquivo()}}>
                    <Image source={require("./assets/BtnAddTopApp.png")} style={{height: 25, width: 25, resizeMode: "contain", marginRight: 5}}/>
                    <Text style={{fontSize: 18}}>Adicionar um anexo</Text>
                </Pressable>
            </View>


            <Pressable style={styles.btnEnviar}><Text style={styles.txtBtnEnviar} onPress={() => {enviaPost()}}>Enviar</Text></Pressable>
        </View>
    </ScrollView>
    );
}


/* --------------------- ESTILOS GERAIS --------------------- */

const styles = StyleSheet.create({
    geral: {
        width: "100%",
        paddingHorizontal: "5%"
    },

    titulo: {
        width: "100%",
        backgroundColor: "#ff3366",
        textAlign: "center",
        fontWeight: "bold",
        color: "white",
        fontSize: 35,
        padding: 5
    },

    textbox: {
        fontSize: 15,
        borderWidth: 1,
        padding: 10,
        paddingHorizontal: 20,
        width: "100%",
        marginTop: 15,
        borderRadius: 20,
    },

    btnCategoria: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#190933",
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 15,
        borderRadius: 20
    },

    txtCategoria: {
        color: "#190933",
        fontSize: 20,
        textAlign: "center"
    },

    btnCalendario: {
        padding: 10,
        marginTop: 20,
        borderWidth: 1,
        borderRadius: 20,
        borderColor: "#ff3366",
        flexDirection: "row",
        alignItems: "center"
    },

    btnCalendarioImg: {
        height: 20,
        width: 20,
        marginRight: 10,
        marginLeft: 5,
        resizeMode: "contain"
    },

    anexos: {
        padding: 15,
        borderWidth: 1,
        borderRadius: 15,
        marginTop: 20,
        backgroundColor: "#f5f5f5"
    },

    btnAddAnexo: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        borderWidth: 1,
        marginTop: 15,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white"
    },

    btnEnviar: {
        width: "100%",
        backgroundColor: "#190933",
        alignItems: "center",
        padding: 8,
        borderRadius: 20,
        marginTop: 20
    },

    txtBtnEnviar: {
        color: "white",
        fontSize: 30
    },


    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
        alignItems: "center",
        justifyContent: "center"
    },

    modalView: {
        width: "80%",
        height: "60%",
        backgroundColor: "white",
        borderRadius: 20
    }
});


export default CriaPost;