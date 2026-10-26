const {
  conexao,
  erroApp,
  validarId,
  validarNumero,
} = require("./utilitarios");

async function cadastrarVendedor(dados = {}) {
  try {
    const { nome, meta_mensal, percentual_base } = dados;
    if (typeof nome !== "string" || nome.trim() === "" || nome.length > 100) {
      throw erroApp(400, "nome é obrigatório (até 100 caracteres)");
    }
    const meta = validarNumero(meta_mensal, "meta_mensal");
    const percentual = validarNumero(percentual_base, "percentual_base", 100);

    const [resultado] = await conexao.execute(
      "INSERT INTO vendedores (nome, meta_mensal, percentual_base) VALUES (?, ?, ?)",
      [nome.trim(), meta, percentual],
    );
    return await consultarVendedor(resultado.insertId);
  } catch (erro) {
    console.error("Erro ao cadastrar vendedor:", erro.message);
    throw erro;
  }
}

async function listarVendedores() {
  try {
    const [resultados] = await conexao.execute(
      "SELECT * FROM vendedores ORDER BY id_vendedor",
    );
    return resultados;
  } catch (erro) {
    console.error("Erro ao consultar vendedores:", erro.message);
    throw erro;
  }
}

async function consultarVendedor(id) {
  try {
    const idVendedor = validarId(id, "id_vendedor");
    const [resultados] = await conexao.execute(
      "SELECT * FROM vendedores WHERE id_vendedor = ?",
      [idVendedor],
    );
    if (resultados.length === 0) {
      throw erroApp(404, "Vendedor não encontrado");
    }
    return resultados[0];
  } catch (erro) {
    console.error("Erro ao consultar vendedor:", erro.message);
    throw erro;
  }
}

async function atualizarVendedor(id, dados = {}) {
  try {
    const meta = validarNumero(dados.meta_mensal, "meta_mensal");
    const percentual = validarNumero(
      dados.percentual_base,
      "percentual_base",
      100,
    );
    await consultarVendedor(id);

    await conexao.execute(
      "UPDATE vendedores SET meta_mensal = ?, percentual_base = ? WHERE id_vendedor = ?",
      [meta, percentual, Number(id)],
    );
    return await consultarVendedor(id);
  } catch (erro) {
    console.error("Erro ao atualizar vendedor:", erro.message);
    throw erro;
  }
}

async function desativarVendedor(id) {
  try {
    await consultarVendedor(id);
    await conexao.execute(
      "UPDATE vendedores SET ativo = ? WHERE id_vendedor = ?",
      [0, Number(id)],
    );
    return await consultarVendedor(id);
  } catch (erro) {
    console.error("Erro ao desativar vendedor:", erro.message);
    throw erro;
  }
}

module.exports = {
  cadastrarVendedor,
  listarVendedores,
  consultarVendedor,
  atualizarVendedor,
  desativarVendedor,
};
