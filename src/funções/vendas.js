const {
  conexao,
  BONUS_CLIENTE,
  FORMATO_DATA_HORA,
  SELECT_VENDAS,
  erroApp,
  dataValida,
  validarId,
} = require("./utilitarios");
const { consultarVendedor } = require("./vendedores");

async function calcularComissao(
  valorVenda,
  percentualBase,
  tipoCliente,
  percentualRegiao,
) {
  try {
    const percentualCliente = BONUS_CLIENTE[tipoCliente];
    if (percentualCliente === undefined) {
      throw erroApp(400, "tipo_cliente deve ser PF ou PJ");
    }
    const percentualTotal =
      Number(percentualBase) + percentualCliente + Number(percentualRegiao);
    return Math.round(Number(valorVenda) * percentualTotal) / 100;
  } catch (erro) {
    console.error("Erro ao calcular comissão:", erro.message);
    throw erro;
  }
}

async function consultarRegiao(id) {
  const idRegiao = validarId(id, "id_regiao");
  const [resultados] = await conexao.execute(
    "SELECT * FROM regioes WHERE id_regiao = ?",
    [idRegiao],
  );
  if (resultados.length === 0) {
    throw erroApp(404, "Região não encontrada");
  }
  return resultados[0];
}

async function registrarVenda(dados = {}) {
  try {
    const {
      id_venda,
      id_vendedor,
      id_regiao,
      data_venda,
      valor_venda,
      tipo_cliente,
    } = dados;

    const idVenda = validarId(id_venda, "id_venda");
    const valor = Number(valor_venda);
    if (!Number.isFinite(valor) || valor <= 0) {
      throw erroApp(400, "valor_venda deve ser um número positivo");
    }
    if (tipo_cliente !== "PF" && tipo_cliente !== "PJ") {
      throw erroApp(400, "tipo_cliente deve ser PF ou PJ");
    }
    let data = null;
    if (data_venda !== undefined) {
      if (
        typeof data_venda !== "string" ||
        !FORMATO_DATA_HORA.test(data_venda) ||
        !dataValida(data_venda)
      ) {
        throw erroApp(
          400,
          "data_venda inválida (use AAAA-MM-DD ou AAAA-MM-DD HH:MM:SS)",
        );
      }
      data = data_venda.replace("T", " ");
    }

    const vendedor = await consultarVendedor(id_vendedor);
    if (!vendedor.ativo) {
      throw erroApp(400, "Vendedor inativo");
    }
    const regiao = await consultarRegiao(id_regiao);

    const [existente] = await conexao.execute(
      "SELECT id_venda FROM vendas WHERE id_venda = ?",
      [idVenda],
    );
    if (existente.length > 0) {
      throw erroApp(409, "Já existe uma venda com este id_venda");
    }

    const valorComissao = await calcularComissao(
      valor,
      vendedor.percentual_base,
      tipo_cliente,
      regiao.percentual_bonus,
    );

    await conexao.execute(
      `INSERT INTO vendas
         (id_venda, id_vendedor, id_regiao, data_venda, valor_venda, tipo_cliente, valor_comissao)
       VALUES (?, ?, ?, COALESCE(?, NOW()), ?, ?, ?)`,
      [
        idVenda,
        vendedor.id_vendedor,
        regiao.id_regiao,
        data,
        valor,
        tipo_cliente,
        valorComissao,
      ],
    );

    const [venda] = await conexao.execute(
      `${SELECT_VENDAS} WHERE v.id_venda = ?`,
      [idVenda],
    );
    return venda[0];
  } catch (erro) {
    if (erro.code === "ER_DUP_ENTRY") {
      erro = erroApp(409, "Já existe uma venda com este id_venda");
    }
    console.error("Erro ao registrar venda:", erro.message);
    throw erro;
  }
}

async function listarVendas() {
  try {
    const [resultados] = await conexao.execute(
      `${SELECT_VENDAS} ORDER BY v.data_venda, v.id_venda`,
    );
    return resultados;
  } catch (erro) {
    console.error("Erro ao consultar vendas:", erro.message);
    throw erro;
  }
}

async function consultarVendasPorVendedor(id) {
  try {
    const vendedor = await consultarVendedor(id);
    const [resultados] = await conexao.execute(
      `${SELECT_VENDAS} WHERE v.id_vendedor = ? ORDER BY v.data_venda, v.id_venda`,
      [vendedor.id_vendedor],
    );
    return resultados;
  } catch (erro) {
    console.error("Erro ao consultar vendas por vendedor:", erro.message);
    throw erro;
  }
}

async function consultarVendasPorRegiao(id) {
  try {
    const regiao = await consultarRegiao(id);
    const [resultados] = await conexao.execute(
      `${SELECT_VENDAS} WHERE v.id_regiao = ? ORDER BY v.data_venda, v.id_venda`,
      [regiao.id_regiao],
    );
    return resultados;
  } catch (erro) {
    console.error("Erro ao consultar vendas por região:", erro.message);
    throw erro;
  }
}

async function excluirVenda(id) {
  try {
    const idVenda = validarId(id, "id_venda");
    const [existente] = await conexao.execute(
      "SELECT id_venda FROM vendas WHERE id_venda = ?",
      [idVenda],
    );
    if (existente.length === 0) {
      throw erroApp(404, "Venda não encontrada");
    }
    await conexao.execute("DELETE FROM vendas WHERE id_venda = ?", [idVenda]);
    return { mensagem: "Venda excluída com sucesso", id_venda: idVenda };
  } catch (erro) {
    console.error("Erro ao excluir venda:", erro.message);
    throw erro;
  }
}

module.exports = {
  registrarVenda,
  listarVendas,
  consultarVendasPorVendedor,
  consultarVendasPorRegiao,
  excluirVenda,
  calcularComissao,
};
