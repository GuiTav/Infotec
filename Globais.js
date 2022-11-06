import React from "react";

export var Contexto = React.createContext({
    categorias: ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS",
    "ADMINISTRAÇÃO", "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"]
});


/* Este context representa a função de trocar tela e de voltar tela, que altera os valores do hook telaAtual,
para que ocorra a troca de tela */
export var Telas = React.createContext();

/* Context para a função de setIp */
export var Ip = React.createContext();

export var User = React.createContext();


export function WrapperContext(props) {
    const {trocaTela, voltaTela} = props.setTela;
    const {ipAddress, setIpAddress} = props.ip;
    const {usuario, setUsuario} = props.user;
    
    return(
        <Telas.Provider value={{trocaTela: trocaTela, voltaTela: voltaTela}}>
            <Ip.Provider value={{ipAddress: ipAddress, setIpAddress: setIpAddress}}>
                <User.Provider value={{usuario: usuario, setUsuario: setUsuario}}>
                    {props.children}
                </User.Provider>
            </Ip.Provider>
        </Telas.Provider>
    )
}