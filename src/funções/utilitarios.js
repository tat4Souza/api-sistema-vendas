const conexao = require("../data/db");

const BONUS_CLIENTE = { PF: 2, PJ: 3 };
const FORMATO_DATA_HORA = /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/;
const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;

const SELECT_VENDAS = `
  SELECT v.id_venda, v.id_vendedor, ve.nome AS nome_vendedor,
         v.id_regiao, r.nome_regiao, v.data_venda,
         v.valor_venda, v.tipo_cliente, v.valor_comissao
  FROM vendas v
  JOIN vendedores ve ON ve.id_vendedor = v.id_vendedor
  JOIN regioes r ON r.id_regiao = v.id_regiao`;

function erroApp(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function dataValida(texto) {
  const [ano, mes, dia] = texto.slice(0, 10).split("-").map(Number);
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    d.getUTCFullYear() === ano &&
    d.getUTCMonth() === mes - 1 &&
    d.getUTCDate() === dia
  );
}

function validarId(valor, campo) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw erroApp(400, `${campo} inválido`);
  }
  return id;
}

function validarNumero(valor, campo, maximo = Infinity) {
  const numero = Number(valor);
  if (
    valor === undefined ||
    valor === null ||
    valor === "" ||
    !Number.isFinite(numero) ||
    numero < 0 ||
    numero > maximo
  ) {
    throw erroApp(400, `${campo} deve ser um número maior ou igual a zero`);
  }
  return numero;
}

module.exports = {
  conexao,
  BONUS_CLIENTE,
  FORMATO_DATA_HORA,
  FORMATO_DATA,
  SELECT_VENDAS,
  erroApp,
  dataValida,
  validarId,
  validarNumero,
};
