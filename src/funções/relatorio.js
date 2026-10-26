const { conexao, FORMATO_DATA, erroApp, dataValida } = require("./utilitarios");

async function gerarRelatorioPerformance(inicio, fim) {
  try {
    if (
      !FORMATO_DATA.test(inicio || "") ||
      !FORMATO_DATA.test(fim || "") ||
      !dataValida(inicio) ||
      !dataValida(fim)
    ) {
      throw erroApp(400, "Informe inicio e fim no formato AAAA-MM-DD");
    }
    if (inicio > fim) {
      throw erroApp(400, "inicio não pode ser maior que fim");
    }

    const filtro =
      "v.data_venda >= ? AND v.data_venda < DATE_ADD(?, INTERVAL 1 DAY)";
    const periodo = [inicio, fim];

    const [geral] = await conexao.execute(
      `SELECT COUNT(*) AS total_vendas, ROUND(AVG(v.valor_comissao), 2) AS comissao_media_geral
       FROM vendas v WHERE ${filtro}`,
      periodo,
    );

    const [porRegiao] = await conexao.execute(
      `SELECT r.nome_regiao, SUM(v.valor_venda) AS total_vendido,
              ROUND(AVG(v.valor_comissao), 2) AS comissao_media
       FROM vendas v
       JOIN regioes r ON r.id_regiao = v.id_regiao
       WHERE ${filtro}
       GROUP BY r.id_regiao, r.nome_regiao
       ORDER BY r.nome_regiao`,
      periodo,
    );

    const [porTipo] = await conexao.execute(
      `SELECT v.tipo_cliente, SUM(v.valor_venda) AS total_vendido
       FROM vendas v
       WHERE ${filtro}
       GROUP BY v.tipo_cliente
       ORDER BY v.tipo_cliente`,
      periodo,
    );

    const [porVendedor] = await conexao.execute(
      `SELECT ve.id_vendedor, ve.nome, SUM(v.valor_venda) AS total_vendido,
              SUM(v.valor_comissao) AS total_comissao
       FROM vendas v
       JOIN vendedores ve ON ve.id_vendedor = v.id_vendedor
       WHERE ${filtro}
       GROUP BY ve.id_vendedor, ve.nome`,
      periodo,
    );

    const [metas] = await conexao.execute(
      `SELECT ve.id_vendedor, ve.nome, ve.meta_mensal,
              DATE_FORMAT(v.data_venda, '%Y-%m') AS mes,
              SUM(v.valor_venda) AS total_vendido
       FROM vendas v
       JOIN vendedores ve ON ve.id_vendedor = v.id_vendedor
       WHERE ${filtro}
       GROUP BY ve.id_vendedor, ve.nome, ve.meta_mensal, mes
       HAVING SUM(v.valor_venda) >= ve.meta_mensal
       ORDER BY mes, ve.nome`,
      periodo,
    );

    const maior = (campo) =>
      porVendedor.reduce(
        (a, b) => (a === null || b[campo] > a[campo] ? b : a),
        null,
      );

    const melhor = maior("total_vendido");
    const maiorComissao = maior("total_comissao");

    return {
      periodo: { inicio, fim },
      total_vendas: geral[0].total_vendas,
      vendas_por_regiao: porRegiao.map((r) => ({
        regiao: r.nome_regiao,
        total_vendido: r.total_vendido,
      })),
      vendas_por_tipo_cliente: porTipo.map((t) => ({
        tipo_cliente: t.tipo_cliente,
        total_vendido: t.total_vendido,
      })),
      melhor_vendedor: melhor && {
        id_vendedor: melhor.id_vendedor,
        nome: melhor.nome,
        total_vendido: melhor.total_vendido,
      },
      maior_comissao: maiorComissao && {
        id_vendedor: maiorComissao.id_vendedor,
        nome: maiorComissao.nome,
        total_comissao: maiorComissao.total_comissao,
      },
      metas_atingidas: {
        quantidade: new Set(metas.map((m) => m.id_vendedor)).size,
        vendedores: metas,
      },
      comissao_media_geral: geral[0].comissao_media_geral,
      comissao_media_por_regiao: porRegiao.map((r) => ({
        regiao: r.nome_regiao,
        comissao_media: r.comissao_media,
      })),
    };
  } catch (erro) {
    console.error("Erro ao gerar relatório de performance:", erro.message);
    throw erro;
  }
}

module.exports = {
  gerarRelatorioPerformance,
};
