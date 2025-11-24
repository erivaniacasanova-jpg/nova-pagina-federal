/*
  # Criar tabela de representantes

  1. Nova Tabela
    - `representantes`
      - `id` (text, primary key) - ID do representante
      - `nome` (text) - Nome completo do representante
      - `whatsapp` (text) - Número do WhatsApp
      - `webhook_url` (text) - URL do webhook específico
      - `created_at` (timestamp) - Data de criação
  
  2. Segurança
    - Habilitar RLS na tabela `representantes`
    - Adicionar política para leitura pública (necessário para o formulário funcionar)
*/

CREATE TABLE IF NOT EXISTS representantes (
  id text PRIMARY KEY,
  nome text NOT NULL,
  whatsapp text NOT NULL,
  webhook_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE representantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura pública de representantes"
  ON representantes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Inserir os dois representantes iniciais
INSERT INTO representantes (id, nome, whatsapp, webhook_url) VALUES
  ('110956', 'Francisco Eliedisom Dos Santos', 'SEU_WHATSAPP_AQUI', 'https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432'),
  ('135302', 'Representante 135302', 'WHATSAPP_135302', 'https://webhook.fiqon.app/webhook/a027566a-c651-460e-8805-6f6414de55b1/a98d0f5c-c379-4104-abf9-d07124ccd1ff')
ON CONFLICT (id) DO NOTHING;