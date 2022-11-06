
import { useState, useEffect, useContext } from "react";
import { StyleSheet, View, TextInput, Text, Pressable, Modal, ScrollView, Image, ToastAndroid, ActivityIndicator} from "react-native";
import { Contexto, Ip, Telas, User } from "./Globais";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';



export default function CriaPost(props) {

    const { ipAddress } = useContext(Ip);
    const categorias = useContext(Contexto).categorias;
    const { voltaTela } = useContext(Telas);
    

    const[titulo, setTitulo] = useState("");
    const[categVisible, setCategVisible] = useState(false);
    const[categoria, setCategoria] = useState("");
    const[conteudo, setConteudo] = useState("");
    const[calendarVisible, setCalendarVisible] = useState(false);
    const[dataValid, setDataValid] = useState(new Date());
    const[anexos, setAnexos] = useState([]);
    const[postando, setPostando] = useState(false);
    const { usuario } = useContext(User);
    

    /* ------------ PARA O MODO DE EDIÇÃO ------------ */
    
    const post = props.post;
    
    // Serve para quando o usuário deleta um anexo que já estava presente no post, no modo de edição.
    // O id do anexo vem para cá para ser deletado depois
    const[anexosDeletados, setAnexosDeletados] = useState([]);
    


    /* ------------------------ FUNÇÕES NÃO VISUAIS ---------------------- */

    useEffect(() => {
        if (usuario == null) {
            ToastAndroid.show("Impossível criar ou editar um post sem estar logado.", ToastAndroid.SHORT);
            voltaTela();
        }

        if (usuario.permissao == "PROFESSOR" || usuario.permissao == "MODERADOR") {}
        
        else {
            ToastAndroid.show("Você não possui permissão para postar ou editar.", ToastAndroid.SHORT);
            voltaTela();
        }
    });

    useEffect(() => {
        /* Apenas limpando o cache antes de executar qualquer coisa */
        FileSystem.deleteAsync(FileSystem.cacheDirectory + "DocumentPicker", {idempotent: true});
    }, []);



    /* ---------- PARA O MODO DE EDIÇÃO ---------- */

    // Atribui os valores nos seus respectivos hooks, ou elimina todos os valores dos hooks
    // (a limpeza de hooks ocorre pois quando o usuário passa do modo edição para o de criação diretamente,
    // o próprio react não limpa os hooks de dentro dele, então continuaria exibindo os valores de edição)
    useEffect(() => {
        if (post != undefined) {
            setTitulo(post.titulo);
            setCategoria(post.categoria);
            setConteudo(post.conteudo);
            setDataValid(new Date(post.validade));
            
            if (post['idAnexo'] == null) {
                return;
            }
        
            var idsAnexo = post['idAnexo'].split(',');
            var nomesAnexo = post['nomeArquivo'].split(',');

            var juncao = idsAnexo.map((value, index) => {
                return {id: idsAnexo[index], name: nomesAnexo[index]};
            });

            setAnexos(juncao);
        } else {
            setTitulo("");
            setCategoria("");
            setConteudo("");
            setDataValid(new Date());
            setAnexos([]);
        }
    }, [post])


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
        if (arquivo.id == undefined) {
            await FileSystem.deleteAsync(arquivo.uri);
        } else {
            setAnexosDeletados([...anexosDeletados, arquivo.id]);
        }
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

        /* Ativa o modal de loading e realiza o post */
        setPostando(true);
        var request = {tabela: "publicacao", dados: [
            titulo,
            new Date().toISOString().split("T")[0],
            categoria,
            dataValid.toISOString().split("T")[0],
            new Date().toISOString().split("T")[0],
            conteudo,
            usuario.idUsuario
        ]};

        if (anexos.length != 0) {
            request["anexo"] = [];
            for (let i = 0; i < anexos.length; i++) {
                var elemento = anexos[i];
                var arquivo = await FileSystem.readAsStringAsync(elemento.uri, {encoding: "base64"});
                request["anexo"].push(["0x" + Buffer.from(arquivo, "base64").toString("hex"), anexos[i].name]);
                
            }
        }

        var request = JSON.stringify(request);
        try {
            const controller = new AbortController();
			setTimeout(() => {controller.abort()}, 30000)
            var result = await fetch("http://" + ipAddress + ":8000", {body: request, method: "POST", signal: controller.signal});
            var resultJson = await result.json();
            if (resultJson.erro != null) {
                throw resultJson.erro;
            }
        } catch (error) {
            alert("Não foi possível realizar o envio de sua postagem, verifique sua conexão de internet.");
            setPostando(false);
            return;
        }

        setPostando(false);
        ToastAndroid.show("Post realizado com sucesso!", ToastAndroid.SHORT);
        return;
    }



    async function editaPost() {
        if (titulo == "" || categoria == "" || conteudo == "") {
            ToastAndroid.show("Os campos 'título', 'categoria' e 'conteudo' são obrigatórios.", ToastAndroid.SHORT);
            return;
        }

        /* Ativa o modal de loading e realiza a alteração */
        setPostando(true);
        

        /* ALTERAÇÃO NO POST */
        var request = {
        tabela: "publicacao",
        dados: {
            "titulo": titulo,
            "dataEdicao": new Date().toISOString().split("T")[0],
            "categoria": categoria,
            "validade": dataValid.toISOString().split("T")[0],
            "conteudo": conteudo,
            "idAutor": usuario.idUsuario
            },
        id: post.idPublicacao};
        request = JSON.stringify(request);
        
        
        /* ALTERAÇÃO NOS ANEXOS */
        var anexosAdicionados = [];
        anexos.map((value) => {
            if (value.id == undefined) {
                anexosAdicionados.push(value);
            }
        });

        var requestAnexo = null;
        if (anexosAdicionados.length != 0) {
            requestAnexo = {tabela: "anexo", dados: []};
            for (let i = 0; i < anexosAdicionados.length; i++) {
                var elemento = anexosAdicionados[i];
                var arquivo = await FileSystem.readAsStringAsync(elemento.uri, {encoding: "base64"});
                requestAnexo["dados"].push(["0x" + Buffer.from(arquivo, "base64").toString("hex"), anexosAdicionados[i].name, post.idPublicacao]);
            }
            requestAnexo = JSON.stringify(requestAnexo);
        }


        try {
            const controller = new AbortController();
			var timeoutMain = setTimeout(() => {controller.abort()}, 30000)
            var result = await fetch("http://" + ipAddress + ":8000", {body: request, method: "PUT", signal: controller.signal});
            clearTimeout(timeoutMain);
            var resultJson = await result.json();
            if (resultJson.erro != null) {
                throw resultJson.erro;
            }

            if (anexosDeletados.length > 0) {
                const controllerDel = new AbortController();
                var timeoutDel = setTimeout(() => {controllerDel.abort()}, 15000);
                var urlDelete = "";
                anexosDeletados.map((value, index) => {
                    if (index != 0) {
                        urlDelete += '-';
                    }
                    urlDelete += value;
                });
                var resultDel = await fetch("http://" + ipAddress + ":8000/anexo/" + urlDelete, {method: "DELETE", signal: controllerDel.signal});
                clearTimeout(timeoutDel);
                var resultDelJson = await resultDel.json();
                if (resultDelJson.erro != null) {
                    throw resultDelJson.erro;
                }
            }

            if (requestAnexo != null) {
                const controllerAdd = new AbortController();
                var timeoutAdd = setTimeout(() => {controllerAdd.abort()}, 15000);
                var resultAdd = await fetch("http://" + ipAddress + ":8000", {body: requestAnexo, method: "POST", signal: controllerAdd.signal});
                clearTimeout(timeoutAdd);
                var resultAddJson = await resultAdd.json();
                if (resultAddJson.erro != null) {
                    throw resultAddJson.erro;
                }
            }

        } catch (error) {
            alert("Não foi possível realizar a alteração de sua postagem, verifique sua conexão de internet.");
            setPostando(false);
            return;
        }

        setPostando(false);
        ToastAndroid.show("Post alterado com sucesso!", ToastAndroid.SHORT);
        return;
    }


    /* ----------------------- ESTILOS INTERATIVOS -------------------- */

    const intStyles = StyleSheet.create(

        /* Estilo para quando a categoria está selecionada */
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
        <View style={{flex: 1}}>
            <Text style={styles.titulo}>{post == undefined ? "NOVA POSTAGEM" : "EDITAR POST"}</Text>
            {/* O keyboardShould... permite que botões sejam clicados mesmo se um textInput está em foco */}
            <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{paddingBottom: 15}}>


                {/* Modal de seleção de categoria */}

                <Modal animationType="fade" transparent={true} visible={categVisible} onRequestClose={() => {
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


                {/* Modal de carregamento, quando o usuário clica em enviar post */}
                <Modal animationType="slide" transparent={false} visible={postando}>
                    <View style={{backgroundColor: "white", alignItems: "center", justifyContent: "center", height: "100%"}}>
                        <ActivityIndicator size={"large"} color={"#190933"}/>
                    </View>
                </Modal>


            <View style={styles.geral}>

                
                {/* Caixa de input: Título */}

                <TextInput style={styles.textbox} placeholder='Título' multiline={true} maxLength={255} onChangeText={(text) => {
                    setTitulo(text);
                }}>{titulo}</TextInput>
                <Text style={styles.contador}>{"(" + titulo.length + "/255)"}</Text>


                {/* Botão de input: Categoria */}

                <Pressable style={[styles.btnCategoria, intStyles.btnCategoria]} onPress={() => {setCategVisible(true)}}>
                    <Text style={[styles.txtCategoria, intStyles.txtCategoria]}>
                        {categoria == "" ? "Selecione uma categoria" : categoria}
                    </Text>
                    <Image source={require("./assets/SetaBaixo.png")} style={[{width: 20, height: 20}, intStyles.setaCateg]}/>
                </Pressable>


                {/* Caixa de input: Conteúdo */}

                <TextInput style={[styles.textbox]} multiline={true} placeholder='Mensagem' maxLength={512} onChangeText={(text) => {
                    setConteudo(text);
                }}>{conteudo}</TextInput>
                <Text style={styles.contador}>{"(" + conteudo.length + "/512)"}</Text>
                

                {/* Botão de input: Calendario */}

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

                {/* Exibição do calendario */}
                {calendarVisible ?
                    <RNDateTimePicker
                        mode="date"
                        onChange={(event, date) => {setCalendarVisible(false); setDataValid(date)}}
                        value={dataValid}
                        minimumDate={new Date()}/>
                    :
                    <></>
                }

                
                {/* Caixa de anexos */}

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

                    {/* Botão de adicionar anexo */}
                    <Pressable style={styles.btnAddAnexo} onPress={() => {achaArquivo()}}>
                        <Image source={require("./assets/BtnAddTopApp.png")} style={{height: 25, width: 25, resizeMode: "contain", marginRight: 5}}/>
                        <Text style={{fontSize: 18}}>Adicionar um anexo</Text>
                    </Pressable>
                </View>


                {/* Botão de envio ou edição*/}
                <Pressable style={styles.btnEnviar} onPress={() => {post == undefined ? enviaPost() : editaPost()}}>
                    <Text style={styles.txtBtnEnviar}>
                        {post == undefined ? "Enviar" : "Editar"}
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    </View>
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

    contador: {
        paddingRight: 10,
        width: "100%",
        textAlign: "right"
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

