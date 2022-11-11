import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import { Buffer } from 'buffer';
import { useContext, useState } from 'react';
import { useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, ToastAndroid, View } from 'react-native';
import { Ip, Telas, User } from './Globais';


export default function Pdfs(props) {

	const tela = props.tela;
	const idTela = tela == "calendario" ? 1 : tela == "horarios" ? 2 : null;
	if (idTela == null) {
		voltaTela();
	}

	const { ipAddress } = useContext(Ip);
	const { voltaTela } = useContext(Telas);
	const { usuario } = useContext(User);

	const [ exibeModerador, setExibeModerador ] = useState(false);
	const [ carregando, setCarregando ] = useState(false);


	useEffect(() => {
		if (usuario != null) {
			if (usuario.permissao == "MODERADOR") {
				setExibeModerador(true);
				return;
			}
		}

		pegarBlob();
	}, []);


	async function pegarBlob() {
		setCarregando(true);

		var respostaJson;

		try {
			var controller = new AbortController();
			var timeout = setTimeout(() => {controller.abort()}, 10000);
			var resposta = await fetch("http://" + ipAddress + ":8000/pdfs/" + idTela, {signal: controller.signal});
			respostaJson = await resposta.json();
		} catch (err) {
			ToastAndroid.show("Houve um problema ao buscar o PDF.", ToastAndroid.SHORT);
			setCarregando(false);
			return;
		}
		finally {
			clearTimeout(timeout);
		}

		await FileSystem.writeAsStringAsync(
			FileSystem.documentDirectory + tela + ".pdf",
			Buffer.from(respostaJson.resposta[0].conteudo.data,"hex").toString("base64"),
			{encoding: FileSystem.EncodingType.Base64}
		);


		const cUri = await FileSystem.getContentUriAsync(FileSystem.documentDirectory + tela + ".pdf");
		setCarregando(false);
		
		await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
			data: cUri,
			flags: 1,
			type: "application/pdf",
		});
		voltaTela();
	}


	async function alteraPdf() {
		var novoPdf = await DocumentPicker.getDocumentAsync();

		if (novoPdf.type == 'cancel') {
            return;
        }
        if (novoPdf.size > 16777216) {
            ToastAndroid.show("Não é possível selecionar arquivos maiores que 16Mb", ToastAndroid.SHORT);
            await FileSystem.deleteAsync(novoPdf.uri);
            return;
        }

		var extensao = novoPdf.name.slice(-4);

		if (extensao != ".pdf") {
			ToastAndroid.show("Não é possível enviar arquivos que não sejam .pdf", ToastAndroid.SHORT);
			await FileSystem.deleteAsync(novoPdf.uri);
			return;
		}

		
		
		
		setCarregando(true);
		
		var conteudo = await FileSystem.readAsStringAsync(novoPdf.uri, {encoding: "base64"});
		var hexadec = "0x" + Buffer.from(conteudo, "base64").toString("hex");

		var respostaJson;
		var request = JSON.stringify({tabela: "pdfs", dados: {conteudo: hexadec}, id: idTela});

		try {
			var controller = new AbortController();
			var timeout = setTimeout(() => {controller.abort()}, 15000);
			var resposta = await fetch("http://" + ipAddress + ":8000", {method: "PUT", body: request, signal: controller.signal});
			respostaJson = await resposta.json();

			if (respostaJson.erro != null) {
				throw respostaJson.erro;
			}

		} catch (err) {
			ToastAndroid.show("Houve um problema ao salvar o PDF.", ToastAndroid.SHORT);
			setCarregando(false);
			return;
		}
		finally {
			clearTimeout(timeout);
		}

		ToastAndroid.show("Pdf alterado com sucesso", ToastAndroid.SHORT);
		setCarregando(false);
		return;
	}


	return (
		<View style={{flex: 1}}>
			
			<Modal animationType="slide" transparent={false} visible={carregando}>
				<View style={{backgroundColor: "white", alignItems: "center", justifyContent: "center", height: "100%"}}>
					<ActivityIndicator size={"large"} color={"#190933"}/>
				</View>
			</Modal>


			{exibeModerador ? 
				<View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
					<Pressable style={{padding: 15, backgroundColor: "#190933", borderRadius: 10, marginTop: 20}} onPress={() => {pegarBlob()}}>
						<Text style={{color: "white", fontSize: 20}}>Visualizar PDF</Text>
					</Pressable>

					<Pressable style={{padding: 15, backgroundColor: "orange", borderRadius: 10, marginTop: 20}} onPress={() => {alteraPdf()}}>
						<Text style={{color: "white", fontSize: 20}}>Alterar PDF</Text>
					</Pressable>
				</View>

			:
				<></>
			}
		</View>
	);

}
