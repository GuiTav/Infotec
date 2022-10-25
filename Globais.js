import React from "react";

export var Contexto = React.createContext({
    categorias: ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS",
    "ADMINISTRAÇÃO", "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"]
});


/* Este context representa a função de trocar tela, que altera os valores do hook telaAtual,
para que ocorra a troca de tela */
export var Telas = React.createContext();

/* Context para a função de setIp */
export var Ip = React.createContext();


export function WrapperContext(props) {
    const setTela = props.setTela;
    const {ipAddress, setIpAddress} = props.ip;
    
    return(
        <Telas.Provider value={setTela}>
            <Ip.Provider value={{ipAddress: ipAddress, setIpAddress: setIpAddress}}>
                {props.children}
            </Ip.Provider>
        </Telas.Provider>
    )
}