import { useState, useEffect } from 'react';
import { StyleSheet, View,Image, StatusBar, TouchableOpacity, Keyboard, SafeAreaView } from 'react-native';
import VerPost from './VerPost';
import CriaPost from './CriaPost';

export default function App() {


	/* -------------- Parte lógica -------------- */
	
	var ipAddress = '' /* Defina o ip da máquina host quando for testar */


	const [telaAtual, setTelaAtual] = useState("inicio");
	const [keyboardActive, setKeyboardActive] = useState(false);
	
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
		<View style={styles.cabecalho}>
			<Image style={styles.logo} source={require('./assets/IconeInfotecTopApp.png')}/>

			<View style={styles.headerBtns}>
				<TouchableOpacity style={[styles.btnCabecalho, intStyles.btnAddPost]} onPress={() => {setTelaAtual("criaPost")}}>
					<Image style={styles.imgCabecalho} source={telaAtual == "criaPost" ? require('./assets/BtnAddTopSelectApp.png') : require('./assets/BtnAddTopApp.png')}/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.btnCabecalho}>
					<Image style={styles.imgCabecalho} source={require('./assets/BtnFilterTopApp.png')}/>
				</TouchableOpacity>
				<TouchableOpacity style={styles.btnCabecalho}>
					<Image style={styles.imgCabecalho} source={require('./assets/BtnConfigTopApp.png')}/>
				</TouchableOpacity>
			</View>
		</View>


		<View style={{flex: 1}}>

			{telaAtual == "inicio" ? <VerPost ip={ipAddress}/>:<CriaPost/>}

		</View>

		{!keyboardActive ?
		<View style={[styles.rodape, intStyles.rodape]}>
			<TouchableOpacity style={[styles.btnRodape, intStyles.btnInicio]} onPress={() => {setTelaAtual("inicio")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'inicio' ? require('./assets/BtnInicioSelectBTApp.png') : require('./assets/BtnInicioBTApp.png')}></Image>
			</TouchableOpacity>
			<TouchableOpacity style={[styles.btnRodape, intStyles.btnCalendario]} onPress={() => {setTelaAtual("calendario")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'calendario' ? require('./assets/BtnCalendarioSelectBTApp.png') : require('./assets/BtnCalendarioBTApp.png')}></Image>
			</TouchableOpacity>
			<TouchableOpacity style={[styles.btnRodape, intStyles.btnHorarios]} onPress={() => {setTelaAtual("horario")}}>
				<Image style={styles.imgRodape} source={telaAtual == 'horario' ? require('./assets/BtnHorarioSelectBTApp.png') : require('./assets/BtnHorarioBTApp.png')}></Image>
			</TouchableOpacity>
		</View> : <View/>}

		<StatusBar backgroundColor="transparent"></StatusBar>
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
		height: 60,
		paddingTop: 5,
		paddingHorizontal: 3,
		justifyContent: "space-between"
	},

	logo: {
		height: "100%",
		maxWidth: "40%",
		marginLeft: "3%",
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



	rodape: {
		height: 80,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
		backgroundColor: "#eee",
		paddingTop: 1
	},

	imgRodape: {
		resizeMode: "center",
		width: "100%",
		height: "100%"
	},

	btnRodape: {
		flex: 1,
		height: "100%",
		backgroundColor: "white"
	},

});
