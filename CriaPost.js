
import { useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Pressable, Modal, ScrollView, Image} from "react-native";
import RNDateTimePicker from "@react-native-community/datetimepicker";

function CriaPost() {

    const[categVisible, setCategVisible] = useState(false);
    const[categoria, setCategoria] = useState("");
    const[calendarVisible, setCalendarVisible] = useState(false);
    const[dataValid, setDataValid] = useState(new Date());

    var categorias = ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS", "ADMINISTRAÇÃO",
    , "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"];



    const intStyles = StyleSheet.create(
        categoria != "" ? {
            btnCategoria: {
                borderColor: "#ff3366"
            },

            txtCategoria: {
                color: "#ff3366"
            }
        } : {}
    )


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
                <TextInput style={styles.textbox} placeholder='Título' multiline={true}></TextInput>
                <Pressable
                    style={[styles.btnCategoria, intStyles.btnCategoria]}
                    onPress={() => {setCategVisible(true)}}>
                    <Text style={[styles.txtCategoria, intStyles.txtCategoria]}>
                        {categoria == "" ? "Selecione uma categoria" : categoria}
                    </Text>
                </Pressable>
                <TextInput style={[styles.textbox]} multiline={true} placeholder='Mensagem'/>
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
                    <RNDateTimePicker onChange={(event, date) => {setDataValid(date); setCalendarVisible(false)}} value={new Date()}/> :
                    <></>
                }
                <TouchableOpacity style={styles.btnEnviar}><Text style={styles.txtBtnEnviar}>Enviar</Text></TouchableOpacity>
            </View>
        </ScrollView>
    );
}


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
        backgroundColor: "#eee",
        borderWidth: 1,
        borderColor: "#190933",
        padding: 10,
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