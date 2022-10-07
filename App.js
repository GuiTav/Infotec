
import { useState, useEffect } from 'react';
import { StyleSheet, View,Image, StatusBar, Pressable, Keyboard, SafeAreaView, ScrollView, Text } from 'react-native';
import VerPost from './VerPost';
import CriaPost from './CriaPost';


export default function App() {

	const ipAddress = '' /* Defina o ip da máquina host quando for testar */
	const categorias = ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS",
	"ADMINISTRAÇÃO", "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"];

	const [telaAtual, setTelaAtual] = useState("inicio");
	const [keyboardActive, setKeyboardActive] = useState(false);
	const [filterActive, setFilterActive] = useState(false);
	const [filterCateg, setFilterCateg] = useState();


	/* -------------- FUNÇÕES NÃO VISUAIS -------------- */

	function trocaTela() {
		switch (telaAtual) {
			case "inicio":
				return <VerPost ip={ipAddress} categ={filterCateg}/>
			
			case "criaPost":
				return <CriaPost ip={ipAddress} categ={categorias}/>
		
			default:
				return <></>;
		}
	}


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


	const intStyles = StyleSheet.create(telaAtual == 'inicio' ? {
		rodape: {
			backgroundColor: "#0880d5",
		},

		btnInicio: {
			backgroundColor: 'transparent'
		},

		btnCalendario: {
			borderTopLeftRadius: 15
		}

	} : telaAtual == 'calendario' ? {
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

	} : telaAtual == 'horario' ? {
		rodape: {
			backgroundColor: '#2ec4b6'
		},

		btnHorarios: {
			backgroundColor: 'transparent'
		},

		btnCalendario: {
			borderTopRightRadius: 15
		}
	} : telaAtual == 'criaPost' ? {
		btnAddPost: {
			backgroundColor: '#ff3366'
		}
	} : {});



	return (
	<SafeAreaView style={styles.container}>

		{/* Cabecalho */}

		<View style={styles.cabecalho}>
			<Pressable style={styles.btnLogo} onPress={() => {setTelaAtual("inicio")}}>
				<Image style={styles.logo} source={require('./assets/IconeInfotecTopApp.png')}/>
			</Pressable>

			<View style={[styles.headerBtns, intStyles.headerBtns]}>
				
				{telaAtual == "inicio" ?
				<Pressable style={filterActive ? [styles.btnCabecalho, {backgroundColor: "#0880d5"}] : styles.btnCabecalho}
				onPress={() => {setFilterActive(!filterActive)}}>
					<Image style={styles.imgCabecalho} source={filterActive ? require('./assets/BtnFilterTopSelectApp.png') : require('./assets/BtnFilterTopApp.png')}/>
				</Pressable> 
				:
				/* Adiciona uma view vazia apenas para manter o layout de antes, quando havia botão */
				<View style={styles.btnCabecalho}></View>}

				<Pressable style={[styles.btnCabecalho, intStyles.btnAddPost]} onPress={() => {setTelaAtual("criaPost")}}>
					<Image style={styles.imgCabecalho} source={telaAtual == "criaPost" ? require('./assets/BtnAddTopSelectApp.png') : require('./assets/BtnAddTopApp.png')}/>
				</Pressable>
				<Pressable style={styles.btnCabecalho}>
					<Image style={styles.imgCabecalho} source={require('./assets/BtnConfigTopApp.png')}/>
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

			{trocaTela()}

		</View>


		{/* Rodapé, com verificação de keyboard ativo para desativá-lo e não reduzir a área central */}

		{!keyboardActive ?
		<View style={[styles.rodape, intStyles.rodape]}>
			<Pressable style={[styles.btnRodape, intStyles.btnInicio]} onPress={() => {setTelaAtual("inicio")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'inicio' ? require('./assets/BtnInicioSelectBTApp.png') : require('./assets/BtnInicioBTApp.png')}></Image>
			</Pressable>
			<Pressable style={[styles.btnRodape, intStyles.btnCalendario]} onPress={() => {setTelaAtual("calendario")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'calendario' ? require('./assets/BtnCalendarioSelectBTApp.png') : require('./assets/BtnCalendarioBTApp.png')}></Image>
			</Pressable>
			<Pressable style={[styles.btnRodape, intStyles.btnHorarios]} onPress={() => {setTelaAtual("horario")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'horario' ? require('./assets/BtnHorarioSelectBTApp.png') : require('./assets/BtnHorarioBTApp.png')}></Image>
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
		width: "40%",
		height: "100%",
		flexDirection: "row",
		alignItems: "center"
	},

	btnCabecalho: {
		flex: 1,
		height: "100%",
		marginRight: "3%",
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
