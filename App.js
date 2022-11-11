
import { useState, useEffect, useContext } from 'react';
import { StyleSheet, View,Image, StatusBar, Pressable, Keyboard, SafeAreaView, ScrollView, Text, BackHandler } from 'react-native';
import { Contexto, WrapperContext } from './Globais';
import VerPost from './VerPost';
import CriaPost from './CriaPost';
import ExpandePost from './ExpandePost';
import Config from './Config';
import Pdfs from './Pdfs';



export default function App() {
	const categorias = useContext(Contexto).categorias;

	const [ip, setIp] = useState("192.168.0.6"); // Defina o ip da maquina host do servidor
	const [usuario, setUsuario] = useState(null);

	const [telaAtual, setTelaAtual] = useState({tela: "inicio", post: null});
	const [stackTela, setStackTela] = useState([]);
	const [stackPosts, setStackPosts] = useState([]);

	const [keyboardActive, setKeyboardActive] = useState(false);
	const [filterActive, setFilterActive] = useState(false);
	const [filterCateg, setFilterCateg] = useState();


	/* -------------- FUNÇÕES NÃO VISUAIS -------------- */

	function abreTela() {
		switch (telaAtual.tela) {
			case "inicio":
				return <VerPost categ={filterCateg}/>
			
			case "criaPost":
				return <CriaPost />

			case "editPost":
				return <CriaPost post={telaAtual.post} />

			case "expandePost":
				return <ExpandePost post={telaAtual.post} />

			case "config":
				return <Config />

			case "calendario":
				return <Pdfs tela="calendario" />
			
			case "horario":
				return <Pdfs tela="horarios" />
		
			default:
				return <></>;
		}
	}

	function trocaTela(tela, post = null) {
		if (tela == telaAtual.tela) {
			return;
		}

		var arrTela = stackTela;
		var arrPost = stackPosts;

		if (arrTela.length == 3) {
			arrTela.shift()
		}

		if (arrPost.length == 3) {
			arrPost.shift()
		}

		arrTela.push(tela);
		arrPost.push(post);

		setStackTela(arrTela);
		setStackPosts(arrPost);
		setTelaAtual({tela: tela, post: post});
		return;
	}


	function voltaTela() {
		var arrTela = stackTela;
		var arrPost = stackPosts;
	
		if (arrTela.length == 0) {
			BackHandler.exitApp();
		}
	
		arrTela.pop();
		arrPost.pop();
	
		if (arrTela.length == 0) {
			setTelaAtual({tela: "inicio", post: null});
			return true;
		}
	
		// O post precisa vir primeiro, pois ele precisa ja estar setado quando a tela trocar
		setTelaAtual({tela: arrTela[arrTela.length - 1], post: arrPost[arrPost.length - 1]});
		return true;
	}

	BackHandler.addEventListener('hardwareBackPress', voltaTela);


	
	useEffect(() => {
		setFilterActive(false);
		setFilterCateg();
	}, [telaAtual]);


	useEffect(() => {
		Keyboard.addListener('keyboardDidShow', () => {
			setKeyboardActive(true);
		});

		Keyboard.addListener('keyboardDidHide', () => {
			setKeyboardActive(false);
		});
	}, []);


	/* --------------- Estilos interativos -------------- */


	const intStyles = StyleSheet.create(telaAtual.tela == 'inicio' ? {
		rodape: {
			backgroundColor: "#0880d5",
		},

		btnInicio: {
			backgroundColor: 'transparent'
		},

		btnCalendario: {
			borderTopLeftRadius: 15
		}

	} : telaAtual.tela == 'calendario' ? {
		rodape: {
			backgroundColor: '#ff3366'
		},

		btnCalendario: {
			backgroundColor: 'transparent'
		},

		btnInicio: {
			borderTopRightRadius: 15
		},

		btnHorarios: {
			borderTopLeftRadius: 15
		}

	} : telaAtual.tela == 'horario' ? {
		rodape: {
			backgroundColor: '#2ec4b6'
		},

		btnHorarios: {
			backgroundColor: 'transparent'
		},

		btnCalendario: {
			borderTopRightRadius: 15
		}
	} : telaAtual.tela == 'criaPost' ? {
		btnAddPost: {
			backgroundColor: '#ff3366'
		}
	} : telaAtual.tela == "config" ? {
		btnConfig: {
			backgroundColor: '#190933'
		}
	} : {});



	return (
	<SafeAreaView style={styles.container}>

		{/* Cabecalho */}

		<View style={styles.cabecalho}>
			<Pressable style={styles.btnLogo} onPress={() => {trocaTela("inicio")}}>
				<Image style={styles.logo} source={require('./assets/IconeInfotecTopApp.png')}/>
			</Pressable>

			<View style={[styles.headerBtns, intStyles.headerBtns]}>
				
				{telaAtual.tela == "inicio" ?
					<Pressable style={filterActive ? [styles.btnCabecalho, {backgroundColor: "#0880d5"}] : styles.btnCabecalho}
					onPress={() => {setFilterActive(!filterActive)}}>
						<Image style={styles.imgCabecalho} source={filterActive ? require('./assets/BtnFilterTopSelectApp.png') : require('./assets/BtnFilterTopApp.png')}/>
					</Pressable>
				:
					/* Adiciona uma view vazia apenas para manter o layout de antes, quando havia botão */
					<View style={styles.btnCabecalho}></View>
				}

				{usuario != null ? 
					usuario.permissao == "PROFESSOR" || usuario.permissao == "MODERADOR" ?
						<Pressable style={[styles.btnCabecalho, intStyles.btnAddPost]} onPress={() => {trocaTela("criaPost")}}>
							<Image style={styles.imgCabecalho} source={telaAtual.tela == "criaPost" ? require('./assets/BtnAddTopSelectApp.png') : require('./assets/BtnAddTopApp.png')}/>
						</Pressable>
					:
						<></>
				:
					<></>
				}
				<Pressable style={[styles.btnCabecalho, intStyles.btnConfig]} onPress={() => {trocaTela("config")}}>
					<Image style={styles.imgCabecalho} source={telaAtual.tela == "config" ? require('./assets/BtnConfigTopSelectApp.png') : require('./assets/BtnConfigTopApp.png')}/>
				</Pressable>
			</View>
		</View>


		{/* Aba de filtros */}

		{filterActive ?
		<View style={{height: 60}}>
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



		{/* Área central */}

		<View style={{flex: 1}}>

			<WrapperContext ip={{ipAddress: ip, setIpAddress: setIp}} setTela={{voltaTela: voltaTela, trocaTela: trocaTela}} user={{usuario: usuario, setUsuario: setUsuario}}>
				{abreTela()}
			</WrapperContext>

		</View>


		{/* Rodapé, com verificação de keyboard ativo para desativá-lo e não reduzir a área central */}

		{!keyboardActive ?
		<View style={[styles.rodape, intStyles.rodape]}>
			<Pressable style={[styles.btnRodape, intStyles.btnInicio]} onPress={() => {trocaTela("inicio")}}>
				<Image style={styles.imgRodape} source={telaAtual.tela == 'inicio' ? require('./assets/BtnInicioSelectBTApp.png') : require('./assets/BtnInicioBTApp.png')}></Image>
			</Pressable>
			<Pressable style={[styles.btnRodape, intStyles.btnCalendario]} onPress={() => {trocaTela("calendario")}}>
				<Image style={styles.imgRodape} source={telaAtual.tela == 'calendario' ? require('./assets/BtnCalendarioSelectBTApp.png') : require('./assets/BtnCalendarioBTApp.png')}></Image>
			</Pressable>
			<Pressable style={[styles.btnRodape, intStyles.btnHorarios]} onPress={() => {trocaTela("horario")}}>
				<Image style={styles.imgRodape} source={telaAtual.tela == 'horario' ? require('./assets/BtnHorarioSelectBTApp.png') : require('./assets/BtnHorarioBTApp.png')}></Image>
			</Pressable>
		</View> : <View/>}

		<StatusBar backgroundColor="transparent" barStyle={"dark-content"}></StatusBar>
    </SafeAreaView>
    
  	);
}



/* ---------------- Estilos Gerais ---------------- */

const styles = StyleSheet.create({
	container: {
		flex: 1
	},

	cabecalho: {
		flexDirection: "row",
		height: 50,
		paddingHorizontal: 10,
		justifyContent: "space-between",
		alignItems: "center"
	},

	btnLogo: {
		height: "100%",
		width: "40%",
		justifyContent: "center"
	},

	logo: {
		height: "80%",
		width: "100%",
		resizeMode: "contain"
	},
	

	headerBtns: {
		height: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end"
	},

	btnCabecalho: {
		width: 45,
		height: "100%",
		marginHorizontal: 3,
		justifyContent: "center",
		alignItems: "center"
	},

	imgCabecalho: {
		height: "80%",
		width: "80%",
		resizeMode: "contain"
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



	rodape: {
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
		backgroundColor: "#eee",
		paddingTop: 2
	},

	imgRodape: {
		resizeMode: "center",
		width: "50%",
		height: "50%"
	},

	btnRodape: {
		flex: 1,
		height: "100%",
		backgroundColor: "white",
		alignItems: "center",
		justifyContent: "center"
	},

});
