-- ======================================================================
-- Base de datos y tabla para el formulario de Contacto (Contacto.html)
-- VICSAL
-- ======================================================================

CREATE DATABASE IF NOT EXISTS vicsal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vicsal;

CREATE TABLE IF NOT EXISTS contactos (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

  -- Campos que manda el formulario tal cual (name="..." en el HTML)
  nombre            VARCHAR(150)    NOT NULL,
  empresa           VARCHAR(150)    NULL,
  correo            VARCHAR(150)    NOT NULL,
  telefono          VARCHAR(30)     NULL,
  mensaje           TEXT            NOT NULL,

  -- Contexto que llega por query string desde el catálogo
  -- (contacto.html?producto=...&categoria=...&ref=...)
  producto          VARCHAR(200)    NULL,
  categoria         VARCHAR(120)    NULL,
  referencia        VARCHAR(100)    NULL,

  -- Metadatos de la petición (útiles para soporte/antispam)
  ip_origen         VARCHAR(45)     NULL,
  user_agent        VARCHAR(255)    NULL,
  recaptcha_score   DECIMAL(3,2)    NULL,

  -- Seguimiento comercial del lead
  estado            ENUM('nuevo','en_proceso','atendido','descartado')
                    NOT NULL DEFAULT 'nuevo',

  creado_en         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_correo (correo),
  INDEX idx_creado_en (creado_en),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;