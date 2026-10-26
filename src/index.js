const express = require("express");
const conexao = require("./data/db");
const f = {
  ...require("./funções/vendedores"),
  ...require("./funções/vendas"),
  ...require("./funções/relatorio"),
};

const app = express();
app.use(express.json());

const tratar = (fn) => (req, res, next) => fn(req, res).catch(next);

// Vendedores
app.post(
  "/vendedores",
  tratar(async (req, res) => {
    res.status(201).json(await f.cadastrarVendedor(req.body));
  }),
);

app.get(
  "/vendedores",
  tratar(async (req, res) => {
    res.status(200).json(await f.listarVendedores());
  }),
);

app.get(
  "/vendedores/:id",
  tratar(async (req, res) => {
    res.status(200).json(await f.consultarVendedor(req.params.id));
  }),
);

app.put(
  "/vendedores/:id",
  tratar(async (req, res) => {
    res.status(200).json(await f.atualizarVendedor(req.params.id, req.body));
  }),
);

app.patch(
  "/vendedores/:id/desativar",
  tratar(async (req, res) => {
    res.status(200).json(await f.desativarVendedor(req.params.id));
  }),
);

// Vendas
app.post(
  "/vendas",
  tratar(async (req, res) => {
    res.status(201).json(await f.registrarVenda(req.body));
  }),
);

app.get(
  "/vendas",
  tratar(async (req, res) => {
    res.status(200).json(await f.listarVendas());
  }),
);

app.get(
  "/vendas/vendedor/:id",
  tratar(async (req, res) => {
    res.status(200).json(await f.consultarVendasPorVendedor(req.params.id));
  }),
);

app.get(
  "/vendas/regiao/:id",
  tratar(async (req, res) => {
    res.status(200).json(await f.consultarVendasPorRegiao(req.params.id));
  }),
);

app.delete(
  "/vendas/:id",
  tratar(async (req, res) => {
    res.status(200).json(await f.excluirVenda(req.params.id));
  }),
);

// Relatório
app.get(
  "/relatorios/performance",
  tratar(async (req, res) => {
    const { inicio, fim } = req.query;
    res.status(200).json(await f.gerarRelatorioPerformance(inicio, fim));
  }),
);

// Tratamento de erros (validação = 4xx; falha de banco = 500)
app.use((erro, req, res, next) => {
  const status = erro.status || 500;
  const mensagem = status === 500 ? "Erro interno do servidor" : erro.message;
  res.status(status).json({ erro: mensagem });
});

async function iniciar() {
  try {
    await conexao.query("SELECT 1");
    const porta = process.env.PORT || 3000;
    app.listen(porta, () => console.log(`API rodando na porta ${porta}`));
  } catch (erro) {
    console.error("Erro ao conectar ao MySQL:", erro.message);
    process.exit(1);
  }
}

iniciar();
