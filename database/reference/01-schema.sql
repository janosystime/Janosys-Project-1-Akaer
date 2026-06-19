
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  senha        VARCHAR(255) NOT NULL,
  perfil       ENUM('administrador', 'usuario', 'checker') NOT NULL DEFAULT 'usuario',
  telefone     VARCHAR(20),
  departamento VARCHAR(100),
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alterado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categoria (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sub_categoria (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  categoria_id INT NOT NULL,
  CONSTRAINT fk_subcat_categoria
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_subcat_nome (categoria_id, nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE item (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  nome             VARCHAR(150) NOT NULL,
  sub_categoria_id INT NOT NULL,
  CONSTRAINT fk_item_subcat
    FOREIGN KEY (sub_categoria_id) REFERENCES sub_categoria(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE norma (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  identificador VARCHAR(100) NOT NULL UNIQUE,
  visibilidade  ENUM('publico', 'privado') NOT NULL DEFAULT 'publico',
  usuario_id    INT,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  alterado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_norma_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE norma_referencia (
  norma_id              INT NOT NULL,
  norma_referenciada_id INT NOT NULL,
  PRIMARY KEY (norma_id, norma_referenciada_id),
  CONSTRAINT fk_ref_origem
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ref_destino
    FOREIGN KEY (norma_referenciada_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE norma_item (
  norma_id INT NOT NULL,
  item_id  INT NOT NULL,
  PRIMARY KEY (norma_id, item_id),
  CONSTRAINT fk_normaitem_norma
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_normaitem_item
    FOREIGN KEY (item_id) REFERENCES item(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE versao (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  norma_id   INT NOT NULL,
  numero     INT NOT NULL,
  atual      BOOLEAN NOT NULL DEFAULT TRUE,
  titulo     VARCHAR(255) NOT NULL,
  codigo     VARCHAR(100),
  tipo_norma VARCHAR(100),
  orgao      VARCHAR(150),
  revisao    VARCHAR(50),
  status     ENUM('vigente', 'obsoleta', 'revogada') NOT NULL DEFAULT 'vigente',
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_versao_norma
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_versao_numero (norma_id, numero),
  KEY idx_versao_codigo (codigo),
  KEY idx_versao_orgao (orgao),
  KEY idx_versao_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE arquivo (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  versao_id INT NOT NULL,
  nome      VARCHAR(255) NOT NULL,
  tipo      VARCHAR(50),
  conteudo  LONGBLOB NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_arquivo_versao
    FOREIGN KEY (versao_id) REFERENCES versao(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nota (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  versao_id INT NOT NULL,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_nota_versao
    FOREIGN KEY (versao_id) REFERENCES versao(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE palavra_chave (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  termo VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE norma_palavra_chave (
  norma_id        INT NOT NULL,
  palavra_chave_id INT NOT NULL,
  PRIMARY KEY (norma_id, palavra_chave_id),
  CONSTRAINT fk_npc_norma
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_npc_palavra
    FOREIGN KEY (palavra_chave_id) REFERENCES palavra_chave(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE favorito (
  usuario_id INT NOT NULL,
  norma_id   INT NOT NULL,
  criado_em  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, norma_id),
  CONSTRAINT fk_fav_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fav_norma
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE solicitacao (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  titulo         VARCHAR(255) NOT NULL,
  motivo         TEXT,
  status         ENUM('pendente', 'aprovado', 'recusado') NOT NULL DEFAULT 'pendente',
  motivo_recusa  TEXT,
  solicitante_id INT NOT NULL,
  avaliador_id   INT,
  norma_id       INT,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  avaliado_em    TIMESTAMP NULL,
  CONSTRAINT fk_solic_solicitante
    FOREIGN KEY (solicitante_id) REFERENCES usuario(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_solic_avaliador
    FOREIGN KEY (avaliador_id) REFERENCES usuario(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_solic_norma
    FOREIGN KEY (norma_id) REFERENCES norma(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_solic_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
