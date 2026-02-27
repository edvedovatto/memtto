-- ===========================================
-- Memtto — Sample Data Seed
-- ===========================================
-- INSTRUÇÕES:
-- 1. Vá em Supabase Dashboard > Authentication > Users
-- 2. Copie seu UUID (user_id)
-- 3. Substitua 'YOUR_USER_ID' abaixo pelo seu UUID
-- 4. Cole tudo no SQL Editor e clique em "Run"
-- ===========================================

DO $$
DECLARE
  uid uuid := '0fcdb0c0-d784-40f1-a9a3-b4b9cf97b6aa';
BEGIN

-- ========== RECEITAS ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Receitas', 'note', 'Bolo de cenoura da vó',
 'Receita clássica: 3 cenouras, 3 ovos, 1 xícara de óleo, 2 xícaras de açúcar, 2.5 xícaras de farinha, 1 colher de fermento. Bater tudo no liquidificador e assar a 180°C por 40min. Cobertura: 3 colheres de chocolate em pó, 1 colher de manteiga, 1 xícara de açúcar e meio copo de leite.',
 '{"receita", "bolo", "doce", "família"}', 5, NULL,
 'https://picsum.photos/seed/bolo/400/300'),

(uid, 'Receitas', 'note', 'Guacamole express',
 'Amassar 2 abacates maduros, misturar suco de 1 limão, 1 tomate picado, cebola roxa, coentro, sal e pimenta. Servir com nachos ou torrada.',
 '{"receita", "mexicana", "rápido", "vegano"}', 4, NULL, NULL);

-- ========== VIAGENS ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Viagens', 'experience', 'Pôr do sol em Jericoacoara',
 'Um dos pôr do sol mais bonitos que já vi. A duna do pôr do sol fica lotada mas vale cada segundo. Dica: chegar 1h antes pra pegar lugar bom. Levar água e protetor solar.',
 '{"viagem", "jeri", "ceará", "praia", "natureza"}', 5, NULL,
 'https://picsum.photos/seed/sunset/400/300'),

(uid, 'Viagens', 'note', 'Roteiro Buenos Aires 5 dias',
 'Dia 1: San Telmo + feira de domingo. Dia 2: Recoleta + cemitério + livraria El Ateneo. Dia 3: La Boca + Caminito + Bombonera. Dia 4: Palermo Soho + bares. Dia 5: Puerto Madero + volta.',
 '{"viagem", "argentina", "roteiro", "buenos aires"}', 4, NULL, NULL),

(uid, 'Viagens', 'idea', 'Mochilão pelo sudeste asiático',
 'Plano: Tailândia (Bangkok + Chiang Mai + ilhas) > Vietnã (Hanoi + Ha Long Bay) > Camboja (Angkor Wat). Orçamento estimado: 3 meses, R$15.000 incluindo passagens.',
 '{"viagem", "ásia", "mochilão", "plano"}', NULL, 1500000, NULL);

-- ========== TECH ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Tech', 'snippet', 'Debounce em TypeScript',
 'function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}',
 '{"typescript", "utils", "performance"}', 4, NULL, NULL),

(uid, 'Tech', 'snippet', 'CSS Grid responsivo sem media query',
 'display: grid;
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1.5rem;

Isso cria um grid que se adapta automaticamente ao tamanho da tela. Cada coluna tem no mínimo 280px.',
 '{"css", "grid", "responsivo", "layout"}', 5, NULL, NULL),

(uid, 'Tech', 'note', 'Supabase RLS cheat sheet',
 'RLS = Row Level Security. Sempre ativar em tabelas com dados de usuários.
Padrão: CREATE POLICY "nome" ON tabela FOR SELECT USING (auth.uid() = user_id);
Operações: SELECT, INSERT, UPDATE, DELETE. Usar WITH CHECK para INSERT/UPDATE.',
 '{"supabase", "segurança", "database", "RLS"}', 4, NULL, NULL);

-- ========== LIVROS ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Livros', 'note', 'O Alquimista — Paulo Coelho',
 'Leitura leve sobre seguir seus sonhos. A história do pastor Santiago que viaja ao Egito em busca de um tesouro. A melhor frase: "Quando você quer alguma coisa, todo o universo conspira para que você realize o seu desejo."',
 '{"livro", "ficção", "autoajuda", "clássico"}', 4, 3490,
 'https://picsum.photos/seed/books/400/300'),

(uid, 'Livros', 'note', 'Clean Code — Robert C. Martin',
 'Essencial pra qualquer dev. Principais lições: nomes significativos, funções pequenas (fazem UMA coisa), sem comentários óbvios, DRY, tratamento de erros com exceções.',
 '{"livro", "programação", "boas práticas", "tech"}', 5, 8900, NULL);

-- ========== FILMES ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Filmes', 'note', 'Interestelar',
 'Christopher Nolan no seu melhor. A cena do planeta com ondas gigantes e a dilatação temporal são de arrepiar. A trilha do Hans Zimmer é obra-prima. Chorei no final com a cena da estante.',
 '{"filme", "ficção científica", "nolan", "favorito"}', 5, NULL,
 'https://picsum.photos/seed/space/400/300'),

(uid, 'Filmes', 'idea', 'Lista de filmes pra assistir',
 '- Oppenheimer
- Duna Parte 2
- Pobres Criaturas
- Anatomia de uma Queda
- O Menino e a Garça (Miyazaki)',
 '{"filme", "lista", "watchlist"}', NULL, NULL, NULL);

-- ========== MÚSICA ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Música', 'note', 'Playlist para codar',
 'Lo-fi hip hop, Tycho, Bonobo, Nujabes, Khruangbin. Evitar letras em português porque distrai. Spotify playlist "Deep Focus" é boa. Volume baixo.',
 '{"música", "produtividade", "playlist", "foco"}', 4, NULL, NULL),

(uid, 'Música', 'experience', 'Show do Tame Impala em SP',
 'Melhor show que já fui. O visual é insano — luzes sincronizadas em 360°. Setlist perfeita: Let It Happen, The Less I Know The Better, Feels Like We Only Go Backwards. Allianz Parque lotado.',
 '{"música", "show", "tame impala", "experiência"}', 5, 35000,
 'https://picsum.photos/seed/concert/400/300');

-- ========== COMPRAS ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Compras', 'note', 'Fone Sony WH-1000XM5',
 'Melhor cancelamento de ruído que já testei. Confortável pra usar o dia todo. Bateria dura uns 30h. Único defeito: não dobra como o XM4. Comprei na Amazon.',
 '{"gadget", "fone", "review", "tech"}', 5, 179900,
 'https://picsum.photos/seed/headphones/400/300'),

(uid, 'Compras', 'idea', 'Presentes de Natal 2026',
 '- Mãe: perfume ou bolsa
- Pai: camisa polo ou livro
- Irmã: skincare ou vale presente Renner
- Namorada: experiência (jantar + show)',
 '{"compras", "presentes", "natal", "lista"}', NULL, NULL, NULL);

-- ========== FITNESS ==========
INSERT INTO entries (user_id, context, type, title, content_text, tags, rating, price_cents, image_url)
VALUES
(uid, 'Fitness', 'note', 'Treino push pull legs (PPL)',
 'Push: supino, desenvolvimento, tríceps. Pull: remada, puxada, bíceps. Legs: agachamento, leg press, stiff. 6x por semana, 2 ciclos. Descanso: 60-90s entre séries.',
 '{"treino", "academia", "musculação", "rotina"}', 4, NULL,
 'https://picsum.photos/seed/gym/400/300'),

(uid, 'Fitness', 'snippet', 'Macro cálculo rápido',
 'Proteína: 2g por kg de peso corporal
Gordura: 0.8-1g por kg
Carboidrato: preencher o restante das calorias

Exemplo (80kg, 2500kcal):
Proteína: 160g = 640kcal
Gordura: 70g = 630kcal
Carboidrato: (2500 - 640 - 630) / 4 = 307g',
 '{"nutrição", "macros", "dieta", "cálculo"}', 3, NULL, NULL);

END $$;
