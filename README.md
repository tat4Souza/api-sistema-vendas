# Sistema de Vendas com Comissões, Metas e Performance

API REST em Node.js (Express + mysql2/promise) com banco MySQL.

## Requisitos

- Node.js 18 ou superior
- MySQL 8.0.16 ou superior

## Instalação

```bash
npm install
```

## Configuração

1. Crie o banco, as tabelas e os dados de teste executando o script (atenção: ele recria o banco `db_vendas`):

```bash
mysql -u root -p < src/data/database.sql
# OU
mysql -u root -p -e "source src/data/database.sql"  
```

2. Copie `env.example` para `.env` e preencha com as credenciais do seu MySQL:

```bash
cp env.example .env
```

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=db_vendas
PORT=3000
```

## Execução

```bash
npm start
```

A API ficará disponível em `http://localhost:3000`. Teste as rotas com Postman, Insomnia ou Thunder Client.
