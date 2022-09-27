
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from "react-native";

function CriaPost() {

    return(
        <View style={{width:"100%", alignItems: "center"}}>
            <Text style={styles.selectedPage}>NOVA POSTAGEM</Text>
            <TextInput style={styles.textbox} placeholder='Título'></TextInput>
            <TextInput style={styles.textbox} placeholder="Categoria"></TextInput>
            <TextInput style={[styles.textbox, {maxHeight: 200}]} multiline placeholder='Mensagem'/>
            <TextInput style={[styles.textbox, {paddingBottom: 200}]} placeholder='Arquivo'/>
            <TouchableOpacity style={styles.btnEnviar}><Text style={styles.txtBtnEnviar}>Enviar</Text></TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create(
    {
        selectedPage: {
            width: "100%",
            backgroundColor: "#ff3366",
            textAlign: "center",
            fontWeight: "bold",
            color: "white",
            shadowRadius: 3,
            shadowColor: "black",
            fontSize: 35,
            padding: 5
        },

        textbox: {
            borderWidth: 1,
            padding: 10,
            paddingHorizontal: 20,
            width: "90%",
            marginTop: "3%",
            borderRadius: 20,
        },
    
        btnEnviar: {
            width: "90%",
            backgroundColor: "#ff3366",
            alignItems: "center",
            padding: 8,
            borderRadius: 20,
            marginTop: 20
        },
    
        txtBtnEnviar: {
            color: "white",
            fontSize: 30
        }
    }
);


export default CriaPost;