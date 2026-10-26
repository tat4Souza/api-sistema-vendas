DROP DATABASE IF EXISTS db_vendas;
CREATE DATABASE db_vendas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_vendas;

CREATE TABLE vendedores (
  id_vendedor     INT AUTO_INCREMENT PRIMARY KEY,
  nome            VARCHAR(100)  NOT NULL,
  meta_mensal     DECIMAL(12,2) NOT NULL,
  percentual_base DECIMAL(5,2)  NOT NULL,
  ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
  CHECK (meta_mensal >= 0),
  CHECK (percentual_base >= 0)
);

CREATE TABLE regioes (
  id_regiao        INT AUTO_INCREMENT PRIMARY KEY,
  nome_regiao      VARCHAR(50)  NOT NULL UNIQUE,
  percentual_bonus DECIMAL(5,2) NOT NULL DEFAULT 0,
  CHECK (nome_regiao IN ('Norte', 'Nordeste', 'Sudeste', 'Sul')),
  CHECK (percentual_bonus >= 0)
);

CREATE TABLE vendas (
  id_venda       INT PRIMARY KEY,
  id_vendedor    INT           NOT NULL,
  id_regiao      INT           NOT NULL,
  data_venda     DATETIME      NOT NULL,
  valor_venda    DECIMAL(12,2) NOT NULL,
  tipo_cliente   ENUM('PF','PJ') NOT NULL,
  valor_comissao DECIMAL(12,2) NOT NULL,
  CHECK (valor_venda > 0),
  FOREIGN KEY (id_vendedor) REFERENCES vendedores (id_vendedor),
  FOREIGN KEY (id_regiao)   REFERENCES regioes (id_regiao)
);


INSERT INTO regioes (id_regiao, nome_regiao, percentual_bonus) VALUES
  (1, 'Norte',    1.00),
  (2, 'Nordeste', 1.00),
  (3, 'Sudeste',  0.00),
  (4, 'Sul',      0.50);


INSERT INTO vendedores (id_vendedor, nome, meta_mensal, percentual_base, ativo) VALUES
  (1, 'Ana Souza',    15000.00, 5.00, TRUE),
  (2, 'Bruno Lima',   20000.00, 4.00, TRUE),
  (3, 'Carla Mendes', 12000.00, 6.00, TRUE),
  (4, 'Diego Rocha',  18000.00, 5.00, TRUE),
  (5, 'Elaine Costa', 10000.00, 4.50, TRUE);


INSERT INTO vendas (id_venda, id_vendedor, id_regiao, data_venda, valor_venda, tipo_cliente, valor_comissao) VALUES
  (1,  1, 1, '2026-10-02 09:15:00', 2000.00, 'PJ', 180.00),
  (2,  1, 3, '2026-10-05 14:30:00', 5000.00, 'PF', 350.00),
  (3,  1, 4, '2026-10-12 11:00:00', 9000.00, 'PJ', 765.00),
  (4,  2, 2, '2026-10-03 10:00:00', 8000.00, 'PF', 560.00),
  (5,  2, 1, '2026-10-10 16:45:00', 6000.00, 'PJ', 480.00),
  (6,  2, 3, '2026-10-20 13:20:00', 3500.00, 'PF', 210.00),
  (7,  3, 4, '2026-10-04 15:10:00', 4000.00, 'PF', 340.00),
  (8,  3, 2, '2026-10-15 09:40:00', 7500.00, 'PJ', 750.00),
  (9,  3, 3, '2026-10-22 17:05:00', 2000.00, 'PJ', 180.00),
  (10, 4, 1, '2026-10-06 08:50:00', 5500.00, 'PF', 440.00),
  (11, 4, 4, '2026-10-18 12:25:00', 6500.00, 'PJ', 552.50),
  (12, 5, 2, '2026-10-07 10:30:00', 3000.00, 'PF', 225.00),
  (13, 5, 3, '2026-10-14 14:00:00', 4500.00, 'PJ', 337.50),
  (14, 5, 1, '2026-10-25 16:15:00', 2500.00, 'PF', 187.50),
  (15, 1, 2, '2026-10-28 10:10:00', 1500.00, 'PF', 120.00);
