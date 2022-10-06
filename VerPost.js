
import { Pressable, Image, Text, View, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';


function VerPost(props) {

	const ipAddress = props.ip;
	const filter = props.filter;
	const categorias = props.categ;

	const[respFetch, setRespFetch] = useState();
	const[filteredPosts, setFilteredPosts] = useState([]);
	const[refreshing, setRefreshing] = useState(true);
	const[filterCateg, setFilterCateg] = useState();


	/* ------------------- FUNÇÕES NÃO VISUAIS ---------------- */

	async function getPosts() {
		setRefreshing(true);
		var respCrua;
		try {
			const controller = new AbortController();
			setTimeout(() => {controller.abort()}, 10000)
			respCrua = await fetch("http://" + ipAddress + ":8000/publiCompleta", {signal: controller.signal});
			var resposta = await respCrua.json();
			/* Ordena os posts do maior idPublicacao para o menor */
			resposta['resposta'].sort((a, b) => {
				if (a.idPublicacao > b.idPublicacao) {
					return -1;
				}
				if (a.idPublicacao < b.idPublicacao) {
					return 1;
				}
				return 0;
			})
			setRespFetch(resposta);
		} catch (error) {
			setRespFetch({resposta: "", erro: "Não foi possivel conectar com o servidor"});
		}

		setRefreshing(false);
		return;
	}



	function filterPosts() {
		if (respFetch == undefined) {
			return;
		}

		var lista = [];
		respFetch["resposta"].map((value) => {
			if (value.categoria == filterCateg) {
				lista.push(value);
			}
		});

		setFilteredPosts(lista);
		return;
	}



	useEffect(() => {
		getPosts();
	}, []);

	useEffect(() => {
		filterPosts();
	}, [filterCateg]);



	return (
		<View style={styles.geral}>


			{/* Aba de filtros */}

			{filter ?
			<View style={{height: 60, position: "absolute", zIndex: 2}}>
				<ScrollView horizontal={true} style={{backgroundColor: "#0880d5"}} contentContainerStyle={{paddingVertical: 10, paddingHorizontal: 5}}>
					{categorias.map((value, index) => {
						return (
							<Pressable key={index} 
								style={filterCateg == value ? [styles.filterDiv, {backgroundColor: "#190933"}] : styles.filterDiv}
								onPress={() => {if (filterCateg == value) {setFilterCateg();} else {setFilterCateg(value)}}}>
								<Text style={filterCateg == value ? {fontSize: 20, fontWeight: "bold", color: "white"} : {fontSize: 20, fontWeight: "bold"}}>
									{value}
								</Text>
							</Pressable>
						);
					})}
				</ScrollView>
			</View>
			:
			<></>}



			{/* Posts */}

			{
				!refreshing ?
					<FlatList
						style={{width: "100%"}}
						contentContainerStyle={{paddingBottom: 10}}
						data={filterCateg == undefined ? respFetch['resposta'] : filteredPosts}
						renderItem={Post}
						keyExtractor={item => item.idPublicacao}
						ListEmptyComponent={respFetch['erro'] != null ?
							<Text style={{fontSize: 25, marginTop: 30, paddingHorizontal: "10%", textAlign: "center"}}>
								{respFetch["erro"]}
							</Text>
							:
							<Text style={{marginTop: 30, fontSize: 20, textAlign: "center"}}>Tão vazio...</Text>
						}
						refreshing={refreshing}
						onRefresh={() => {
							getPosts();
						}}
					/>
				:
					<View style={{height: "100%", alignItems: "center", justifyContent: "center"}}>
						<ActivityIndicator size={'large'} color={"#190933"} />
					</View>

			}
		</View>
	);
}


/* -------------------- ELEMENTOS REACT --------------------- */

function Post({item}) {
	return(
		<View style={{width: "100%", alignItems: "center"}}>
			<Pressable style={styles.card}>
				<View style={styles.visualPerfil}>
					<Image style={styles.fotoPerfil} source={{uri: item["fotoPerfil"]}}/>
					<Text>{item["nomeUsuario"]}</Text>
				</View>
				<View style={styles.conteudo}>
					<Text style={styles.titulo}>{item["titulo"]}</Text>
					<Text style={styles.texto}>{item["conteudo"]}</Text>
				</View>
				<Arquivos resp={item}/>
				
			</Pressable>
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
				<View key={index} style={{
					width: "100%",
					flexDirection: 'row',
					alignItems: "center",
					padding: 10,
					backgroundColor: "#eee",
					borderRadius: 15,
					borderWidth: 1,
					borderColor: "#ccc",
					marginTop: 5
				}}>
					<Image source={require('./assets/IconArquivo.png')} style={{
						height: 20,
						width: 20,
						marginRight: 5,
						resizeMode: "contain",
						tintColor: "#777"
					}}/>
					<Text style={{color: "#555", width: "100%", fontSize: 15}}>{nomesAnexo[index]}</Text>
				</View>
			)
		})
	);
}



/* --------------------- ESTILOS GERAIS --------------------- */

const styles = StyleSheet.create({
	geral:{
		width: "100%",
		alignItems: "center"
	},

	filterDiv: {
		marginHorizontal: 5,
		height: "100%",
		paddingHorizontal: 10,
		justifyContent: "center",
		backgroundColor: "rgba(255, 255, 255, 0.9)",
		borderWidth: 2,
		borderColor: "#190933"
	},

	card:{
		elevation: 3,
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
		maxHeight: 80
	},

});


export default VerPost;