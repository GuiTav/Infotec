import { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Pressable, Modal, ActivityIndicator, ToastAndroid } from 'react-native';
import { StorageAccessFramework } from 'expo-file-system';
import { Telas, Ip, User } from './Globais';
import { Buffer } from 'buffer';


export default function ExpandePost(props) {
	const post = props.post;

	const dataPubli = new Date(post.dataPublicacao);
	const dataEdicao = new Date(post.dataEdicao);

	const { trocaTela } = useContext(Telas);
	const { ipAddress } = useContext(Ip);
	const { usuario } = useContext(User);

	const[maisOpcoes, setMaisOpcoes] = useState(false);
	const[confirmaExclusao, setConfirmaExclusao] = useState(false);
	const[loading, setLoading] = useState(false);

	const[objAnexos, setObjAnexos] = useState([]);


	/* ------------------ FUNÇÕES NÃO VISUAIS ------------------ */

	useEffect(() => {
		if (post['idAnexo'] == null) {
			return;
		}

		var idsAnexo = post['idAnexo'].split(',');
		var nomesAnexo = post['nomeArquivo'].split(',');

		var objectAnexos = idsAnexo.map((value, index) => {
			return {"id": value, "nomeArquivo": nomesAnexo[index]}
		})

		setObjAnexos(objectAnexos);
	}, [])



	async function deletaPost() {
		if (usuario == null) {
			ToastAndroid.show("Não é possível deletar posts sem fazer login.", ToastAndroid.SHORT);
			return;
		}

		if (usuario.permissao == "MODERADOR" || usuario.permissao == "PROFESSOR") {}

		else {
			ToastAndroid.show("Apeanas professores e moderadores podem deletar.", ToastAndroid.SHORT);
			return;
		}

		setLoading(true);

		try {
			const controller = new AbortController();
			setTimeout(() => {controller.abort()}, 10000)
			var respCrua = await fetch("http://" + ipAddress + ":8000/publicacao/" + post.idPublicacao, {method: "DELETE", signal: controller.signal});
			var resposta = await respCrua.json();
			if (resposta.erro != null) {
				throw resposta.erro;
			}
		} catch (error) {
			ToastAndroid.show("Houve um erro deletando o post, por favor verifique sua conexão", ToastAndroid.SHORT);
			setLoading(false);
			return;	
		}

		setLoading(false);
		ToastAndroid.show("Post deletado com sucesso!", ToastAndroid.SHORT);
		trocaTela("inicio");
		return;
	}


	async function downloadAnexo(id) {
		const uriDownload = StorageAccessFramework.getUriForDirectoryInRoot("Download")
		const permissao = await StorageAccessFramework.requestDirectoryPermissionsAsync(uriDownload);
		if (permissao.granted) {
			setLoading(true);
			try {
				const controller = new AbortController();
				var timeoutAnexo = setTimeout(() => {controller.abort()}, 30000)
				var anexo = await fetch("http://" + ipAddress + ":8000/anexo/" + id, {signal: controller.signal});
				var anexoJson = await anexo.json();
				clearTimeout(timeoutAnexo);
				if (anexoJson.erro != null) {
					throw anexoJson.erro;
				}
				var uriArquivo = await StorageAccessFramework.createFileAsync(permissao.directoryUri, anexoJson.resposta[0].nomeArquivo, "");
				await StorageAccessFramework.writeAsStringAsync(
					uriArquivo,
					Buffer.from(anexoJson.resposta[0].anexo.data).toString("base64"), {encoding: "base64"});
			} catch (error) {
				ToastAndroid.show("Houve uma falha baixando o arquivo, por favor verifique sua conexão.", ToastAndroid.SHORT);
				setLoading(false);
				return;		
			}
			setLoading(false);
			ToastAndroid.show("O arquivo foi baixado com sucesso!", ToastAndroid.SHORT);
		}
		return;
	}



	/* ------------------ ELEMENTOS VISUAIS ------------------ */

	function Anexo({item}) {

		return (
			<View style={{
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
				<Text style={{flex: 1, color: "#555", fontSize: 15}}>{item.nomeArquivo}</Text>
				<Pressable style={{width: 30, height: 30, justifyContent: "center", alignItems: "center"}}
				onPress={() => {downloadAnexo(item.id)}}>
					<Image 
						style={{width: "70%", height: "70%", resizeMode: "contain", tintColor: "#0880d5"}}
						source={require('./assets/BtnDownload.png')}/>
				</Pressable>
			</View> 
		);
	}


    return (
        <View style={styles.container}>

			<Modal transparent={false} visible={loading} animationType="slide">
				<View style={{height: "100%", width: "100%", backgroundColor: "white", justifyContent: "center"}}>
					<ActivityIndicator size={'large'} color={"#190933"}/>
				</View>
			</Modal>

			<Modal transparent={true} visible={maisOpcoes} animationType="slide" onRequestClose={() => {setMaisOpcoes(false)}}>
				<Pressable style={styles.modalOpcoes} onPress={() => {setMaisOpcoes(false)}}>
					<View style={styles.modalOpcoesFilho}>
						<Pressable style={styles.btnOpcoes} onPress={() => {trocaTela('editPost', post)}}>
							<Text style={styles.txtOpcoes}>Editar</Text>
						</Pressable>
						<Pressable style={styles.btnOpcoes} onPress={() => {setConfirmaExclusao(true)}}>
							<Text style={[styles.txtOpcoes, {color: "red"}]}>Excluir</Text>
						</Pressable>
					</View>
				</Pressable>
			</Modal>


			<Modal transparent={true} visible={confirmaExclusao} animationType="fade" onRequestClose={() => {setConfirmaExclusao(false)}}>
				<Pressable style={styles.modalExclusao} onPress={() => {setConfirmaExclusao(false)}}>
					{/* O exclusaoFilho é um pressable apenas para não fechar o modal quando clicar sobre ele */}
					<Pressable style={styles.exclusaoFilho}>
						<View style={styles.viewTxtConfirmacao}>
							<Text style={styles.txtConfirmacao}>Tem certeza que deseja excluir este post?</Text>
						</View>
						<View style={styles.viewBtnExclusao}>
							<Pressable onPress={() => {setConfirmaExclusao(false)}} style={[styles.btnExclusao, {borderRightWidth: 1, borderColor: "#ccc"}]}>
								<Text style={{fontSize: 20}}>Não</Text>
							</Pressable>
							<Pressable onPress={() => {deletaPost(); setConfirmaExclusao(false)}} style={styles.btnExclusao}>
								<Text style={{color: "red", fontSize: 20}}>Sim</Text>
							</Pressable>
						</View>
					</Pressable>
				</Pressable>
			</Modal>


            <ScrollView style={styles.post} contentContainerStyle={{padding: 20, flexGrow: 1, justifyContent: "space-between"}}>
				<View>
					<View style={styles.top}>
						<View style={styles.prof}>
								<Image style={styles.gato} source={{uri: "data:image/jpg;base64," + Buffer.from(post.fotoPerfil || "", "hex").toString("base64")}}/>
							<View style={styles.email}>
								<Text numberOfLines={1}>{post.nomeUsuario}</Text>
								<Text numberOfLines={1}>{post.email}</Text>
							</View>
						</View>

						{usuario != null ?
							usuario.permissao == "PROFESSOR" || usuario.permissao == "MODERADOR" ?
								<Pressable style={styles.btnMaisOpcoes} onPress={() => {setMaisOpcoes(true)}}>
									<Image
										style={{width: "70%", height: "70%", resizeMode: "contain", tintColor: "#999"}}
										source={require('./assets/TresPontos.png')}/>
								</Pressable>
							:
								<></>
						:
							<></>
						}

					</View>

					<Text style={styles.titulo}>{post.titulo}</Text>

					<View>
						<Text style={styles.data}>Publicado em {dataPubli.getDate() + "/" + (dataPubli.getMonth() + 1) + "/" + dataPubli.getFullYear()}</Text>
						<Text style={styles.data}>Editado em {dataEdicao.getDate() + "/" + (dataEdicao.getMonth() + 1) + "/" + dataEdicao.getFullYear()}</Text>
					</View>
					
					<Text style={styles.categoria}>Categoria: {post.categoria}</Text>
				
					<Text style={styles.mensagem}>{post.conteudo}</Text>
				</View>


				<View>
					{
						objAnexos.map((value, index) => {
							return(
								<Anexo item={value} key={index} />
							);
						})
					}
				</View>
				
        	</ScrollView>
	    </View>
	);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        padding: '5%'
    },

	modalOpcoes: {
		width: "100%",
		height: "100%",
		alignItems: "center",
		justifyContent: "flex-end"
	},

	modalOpcoesFilho: {
		width: "100%",
		height: 100,
		backgroundColor: "white",
		elevation: 10
	},

	btnOpcoes: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},

	txtOpcoes: {
		fontSize: 20
	},

	modalExclusao: {
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center"
	},

	exclusaoFilho: {
		width: "80%",
		height: 150,
		backgroundColor: "white",
		borderRadius: 15,
		justifyContent: "space-between"
	},

	viewTxtConfirmacao: {
		flex: 1,
		padding: 25,
		alignItems: "center"
	},

	txtConfirmacao: {
		fontSize: 20,
		textAlign: "center"
	},

	viewBtnExclusao: {
		height: 50,
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		borderTopWidth: 1,
		borderColor: "#ccc"
	},

	btnExclusao: {
		flex: 1,
		height: "100%",
		justifyContent: "center",
		alignItems: "center"
	},
	
	post:{
		flex: 1,
		elevation: 5,
		backgroundColor: 'white',
		borderRadius: 3
	},

	top: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
		width: "100%"
	},

	btnMaisOpcoes: {
		alignItems: "center",
		justifyContent: "center",
		width: 30,
		height: 30
	},
	
	prof:{
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		backgroundColor: '#fff',
		height: 40,
		flex: 1
	},
	
	gato:{
		marginRight: 10,
		height: 40,
		width: 40,
		resizeMode: 'cover',
		borderRadius: 40
	},
	
	email: {
		flexDirection:'column',
		flex: 1
	},
	
	titulo:{
		fontSize: 20,
		marginBottom: 10,
		textAlign: "justify",
		fontWeight: 'bold'
	},

	categoria: {
		fontSize: 15,
		marginVertical: 15
	},
	
	data:{
		fontSize: 15,
		marginTop: 2,
		textAlign: 'left'
	},
	
	mensagem: {
		fontSize: 18,
		marginVertical: 10,
		textAlign: "justify",
		color: '#888'
	},
});
