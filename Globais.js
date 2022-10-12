import React from "react";

export var Contexto = React.createContext({
    ipAddress: '192.168.0.7', /* Defina o ip da máquina host quando for testar */
    categorias: ["COMUNICADOS GERAIS", "1ºs ANOS", "2ºs ANOS", "3ºs ANOS", "DESENV. DE SISTEMAS",
    "ADMINISTRAÇÃO", "CONTABILIDADE", "CANTINA", "VAGAS DE EMPREGO", "EVENTOS", "VESTIBULARES"]
});


/* Este context representa a função de trocar tela, que altera os valores do hook telaAtual,
para que ocorra a troca de tela */
export var Telas = React.createContext();