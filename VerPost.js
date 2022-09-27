import { TouchableOpacity, Image, Text, View, StyleSheet, FlatList } from 'react-native';
import { useState, useEffect } from 'react';

function VerPost(props) {

	const ipAddress = props.ip;

	const[respFetch, setRespFetch] = useState();
	const[refreshing, setRefreshing] = useState(true);

	async function getPosts() {
		setRefreshing(true);
		try {
			var respCrua = await fetch("http://" + ipAddress + ":8000/publiCompleta");
			var resposta = await respCrua.json();
			setRespFetch(resposta);
		} catch (error) {
			throw error;
		}

		setRefreshing(false);

		return;
	}


	useEffect(() => {
		getPosts();
	}, []);


	return (
		<View style={styles.geral}>
			{
				!refreshing ?
					<FlatList
						style={{width: "100%"}}
						data={respFetch['resposta']}
						renderItem={Post}
						keyExtractor={item => item.idPublicacao}
						ListEmptyComponent={<Text style={{fontSize: 25, marginTop: 30, width: "100%", textAlign: "center"}}>{respFetch["erro"]}</Text>}
						refreshing={refreshing}
						onRefresh={() => {
							getPosts();
						}}
					/>
				:
					<></>
			}
		</View>
	);
}


function Post({item}) {

	return(
		<View style={{width: "100%", alignItems: "center"}}>
			<TouchableOpacity style={styles.card}>
				<View style={styles.visualPerfil}>
					<Image style={styles.fotoPerfil} source={{uri: item["fotoPerfil"]}}/>
					<Text>{item["nomeUsuario"]}</Text>
				</View>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>{item["titulo"]}</Text>
					<Text style={styles.texto}>{item["conteudo"]}</Text>
				</View>
				<Arquivos resp={item}/>
				
			</TouchableOpacity>
		</View>
	);
}


function Arquivos(props) {
	const resp = props.resp;

	if (resp['idAnexo'] == null) {
		return;
	}

	var idsAnexo = resp['idAnexo'].split(',');
	var nomesAnexo = resp['nomeArquivo'].split(',');

	return(
		idsAnexo.map((element, index) => {
			return (
				<View key={index} style={{width: "100%", padding: 10, backgroundColor: "#eee", borderRadius: 15, borderWidth: 1, borderColor: "#ccc", marginTop: 5}}>
					<Text style={{color: "black", width: "100%", fontSize: 15}}>{nomesAnexo[index]}</Text>
				</View>
			)
		})
	);
}



const styles = StyleSheet.create({
	geral:{
		width: "100%",
		alignItems: "center"
	},

	card:{
		elevation: 10,
		backgroundColor: "white",
		marginVertical: 8,
		width: "90%",
		borderRadius: 15,
		padding: 15,
	},

	visualPerfil:{
		flexDirection:"row",
		alignItems: "center",
		marginBottom: 10
	},

	fotoPerfil:{
		width: 30,
		height: 30,
		borderRadius: 15,
		marginRight: "3%",
		borderWidth: 1,
		borderColor: "black"
	},
		
	conteudo: {
		width: "100%",
		paddingHorizontal: 5,
		marginBottom: 5
	},

	titulo:{
		textAlign: "justify",
		fontWeight: "bold",
		fontSize: 20,
		marginBottom: 10
	},

	texto:{
		textAlign: "justify",
		maxHeight: 80,
	},

});


export default VerPost;