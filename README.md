# 🏎️ LH44 — Low to High Speed

**LH44** é um jogo arcade de corrida retrô em perspectiva pseudo-3D (estilo clássico *Top Gear*, *OutRun* e *Horizon Chase*), desenvolvido com gráficos vetoriais de alta precisão em Canvas HTML5 (`384×216` escalado), áudio sintetizado via Web Audio API, suporte offline (PWA/Service Worker) e versão nativa para Android (WebView/APK).

---

## 📌 Sumário
1. [Visão Geral](#-visão-geral)
2. [Modos de Jogo, Qualy e Dificuldade](#-modos-de-jogo-qualy-e-dificuldade)
3. [Os 20 Carros Brasileiros](#-os-20-carros-brasileiros)
4. [Sistema de Upgrades, Economia e Conquistas](#-sistema-de-upgrades-economia-e-conquistas)
5. [Física de Pilotagem, Câmbio e Controles](#-física-de-pilotagem-câmbio-e-controles)
6. [As 31 Pistas do Campeonato](#-as-31-pistas-do-campeonato)
7. [Sistema de Clima, Horários Dinâmicos e Cenários](#️-sistema-de-clima-horários-dinâmicos-e-cenários)
8. [Pilotos da IA e Personalidades](#-pilotos-da-ia-e-personalidades)
9. [Arquitetura e Módulos do Projeto](#-arquitetura-e-módulos-do-projeto)
10. [Como Jogar, Testar e Compilar](#-como-jogar-testar-e-compilar)

---

## 🎮 Visão Geral

No LH44, o jogador assume o papel de um piloto brasileiro enfrentando 19 rivais inspirados nas maiores lendas da Fórmula 1 (como Ayrton Senna, Lewis Hamilton, Michael Schumacher e Max Verstappen) a bordo dos carros mais icônicos do Brasil — desde o lendário **Fusca 1300** e a **Kombi Corujinha** até o bólido supremo da firma: o **Uno Mille com Escadinha**.

O jogo conta com HUD completo em tempo real (velocímetro, conta-giros, marcha, barras de nitro, minimapa da pista, posição atual e diferença de tempo para os carros à frente e atrás), além de tela de preparação pré-corrida (`RACE_SETUP`) com escolha de **clima/horário**, **trilha sonora** e **classificação (Qualy)**.

---

## 🏁 Modos de Jogo, Qualy e Dificuldade

### 1. Campeonato F1 Oficial (Season Mode)
* **31 Etapas:** O campeonato completo percorre os 26 estados do Brasil + Distrito Federal e 4 circuitos clássicos, com grande final em **São Paulo (SP)**.
* **Sistema de Pontuação Oficial da F1:** 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 pontos (P1 ao P10).
* **3 Slots de Salvamento (`SaveManager`):** Salva progresso, pontuação, grid dos bots, créditos, upgrades, carro, cor e escolha climática em `localStorage`.
* **Oficina entre Corridas & Zeramento:** No modo Normal, os créditos acumulados permitem comprar melhorias mecânicas entre etapas. Ao concluir a última etapa, o jogo exibe o pódio final do campeonato (`CHAMPIONSHIP_RESULT`) e a cena de encerramento (`ENDING_SCENE`) com fogos, confetes e música comemorativa.

### 2. Campeonato Customizado
* Ativado diretamente no card **CAMPEONATO F1** (`◀ OFICIAL (31) ▶` / `◀ CUSTOM (5-31) ▶`).
* **Calendário Livre:** O jogador escolhe entre **5 e 31 pistas** disponíveis, entrando exatamente na **ordem em que forem selecionadas** (com atalhos para **Aleatório 10** e **Limpar Tudo**).
* **Progressão Completa:** Mantém salvamento nos 3 slots, modo Qualy, upgrades entre corridas (com premiação escalonada automaticamente conforme o número de etapas), disputa de pontos e cena de zeramento ao final da última pista escolhida.

### 3. Modo Qualy (Classificação Pré-Corrida)
* Na tela de preparação (`RACE_SETUP`), após definir clima/horário e música, o jogador pode optar por disputar o **Qualy** (1 volta rápida cronometrada para definir sua posição real no grid de largada) ou largar diretamente em **P20**.

### 4. Corrida Rápida (Quick Race)
* Escolha livre de qualquer um dos 31 circuitos, condição climática/horário, música, Qualy e suporte opcional ao **Modo Espelho** (traçado invertido).

### 5. Time Trial (Contra o Relógio)
* Pista 100% livre para busca da volta perfeita, com **Carro Fantasma** reproduzindo a sua melhor volta registrada naquele circuito e suporte opcional ao **Modo Espelho**.

### 6. Níveis de Dificuldade
* **Modo Normal:**
  * Modo carreira completo com premiação em créditos e oficina de upgrades.
  * Os carros possuem suas características de fábrica balanceadas, evoluindo etapa a etapa.
* **Modo Avançado:**
  * Foco em pilotagem competitiva pura no limite.
  * Todos os carros correm nivelados a **280 km/h** de velocidade máxima, com upgrades e prêmios desativados.

---

## 🚗 Os 20 Carros Brasileiros

Todos os carros são desenhados em código vetorial puro (Canvas 2D em `js/cars.js`), com detalhes como escapamento, lanternas noturnas, luzes de freio, retrovisores, estepe, pintura personalizável e decalques próprios:

| Carro | Velocidade Base | Máxima com Upgrades (Nv 3) | Aceleração | Grip (Curva) | Destaque e Estilo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| 🚀 **Uno Mille** | 298 km/h | **308 km/h** | 0.82 | 0.65 | O mais rápido em reta! Escada de firma no teto. |
| 🏎️ **VW Santana GLSi** | 286 km/h | **300 km/h** | 0.84 | 0.82 | Sedã executivo clássico, reta muito potente. |
| 🏎️ **Opala SS 4.100** | 284 km/h | **298 km/h** | 1.05 | 0.74 | Monstro do torque, aceleração brutal e traseira viva. |
| 🚗 **Ford Focus** | 275 km/h | **294 km/h** | 0.96 | 0.80 | Equilíbrio dinâmico perfeito e chassi moderno. |
| 🚗 **Sandero R.S.** | 272 km/h | **292 km/h** | 0.98 | 0.84 | Hot hatch puro-sangue, excelente em curvas rápidas. |
| 🚗 **Gol GTS 1.8S** | 270 km/h | **290 km/h** | 0.98 | 0.80 | O esportivo quadrado dos anos 90, veloz e ágil. |
| 🚗 **Chevrolet Onix** | 268 km/h | **288 km/h** | 0.90 | 0.80 | Moderno, confiável e muito balanceado. |
| 🚗 **Hyundai HB20** | 260 km/h | **285 km/h** | 0.88 | 0.82 | Ágil nas retomadas e visual arrojado. |
| 🚗 **Fiat Palio** | 260 km/h | **285 km/h** | 0.87 | 0.80 | Hatch clássico das famílias brasileiras. |
| 🚗 **Chevrolet Celta** | 258 km/h | **284 km/h** | 0.88 | 0.82 | Leve e excelente para costurar no tráfego. |
| 🚗 **Corsa Wind** | 254 km/h | **284 km/h** | 0.86 | 0.82 | Compacto com curvas aerodinâmicas dos anos 90. |
| 🚗 **Chevette Tubarão** | 250 km/h | **282 km/h** | 0.85 | 0.78 | Tração traseira raiz, clássico dos track days. |
| 🚗 **Ford Ka** | 250 km/h | **282 km/h** | 0.84 | 0.85 | Compacto com dirigibilidade de kart em curvas. |
| 🚗 **Fiat Mobi** | 246 km/h | **280 km/h** | 0.84 | 0.80 | Pequeno e muito prático para manobras rápidas. |
| 🚗 **Renault Kwid** | 244 km/h | **280 km/h** | 0.82 | 0.80 | Compacto leve com suspensão elevada. |
| 🚙 **Peugeot 206** | **238 km/h** | **284 km/h** | 1.00 | 0.88 | Aceleração rápida, ágil e muito forte de chão. |
| 🚙 **Rural Willys** | 236 km/h | **280 km/h** | 0.88 | 0.95 | Chassi robusto que não perde estabilidade. |
| 🚗 **Brasília Amarela** | 232 km/h | **279 km/h** | 0.70 | 0.92 | Muito estável nas curvas com design inconfundível. |
| 🚐 **Kombi Corujinha** | 230 km/h | **278 km/h** | 0.69 | 0.88 | Embala nas retas e esbanja carisma histórico. |
| 🐢 **Fusca 1300** | **228 km/h** | **278 km/h** | 0.58 | **1.00** | **Grip perfeito!** Faz qualquer curva de pé cravado. |

---

## 🛠️ Sistema de Upgrades, Economia e Conquistas

### Premiação Base por Corrida (Modo Normal)
| Posição | Prêmio Base |
| :---: | :---: |
| 🥇 **1º Lugar** | **R$ 10.000** |
| 🥈 **2º Lugar** | **R$ 8.000** |
| 🥉 **3º Lugar** | **R$ 6.000** |
| **4º ao 6º** | **R$ 4.000** |
| **7º ao 10º** | **R$ 2.500** |
| **11º ao 20º** | **R$ 1.000** |

* **Escalonamento em Campeonatos Customizados:** Em temporadas menores que 31 etapas, os prêmios em dinheiro são multiplicados proporcionalmente ($\sqrt{31 / \text{etapas}}$, limitado a `3x`), permitindo evoluir o carro mesmo em torneios curtos (ex.: 5 ou 10 corridas).

### As 3 Categorias de Preparação
1. **⚡ Motor & Preparação:**
   * Eleva progressivamente a velocidade final do veículo até o **Target Competitivo** (entre 278 km/h e 308 km/h no Nível 3) e adiciona +5% de aceleração por nível (+15% no Nível 3).
   * Custos: **R$ 4.000** (Nv 1) | **R$ 8.000** (Nv 2) | **R$ 14.000** (Nv 3).
2. **🏁 Pneus & Aderência:**
   * Melhora o grip lateral em +6% por nível (+18% no Nível 3), reduzindo a força centrífuga nas curvas.
   * Custos: **R$ 3.500** (Nv 1) | **R$ 7.000** (Nv 2) | **R$ 12.000** (Nv 3).
3. **🚀 Turbo & Nitro:**
   * Aumenta a duração de cada uma das 3 cargas de nitro em +0.60s por nível (+1.80s no Nível 3).
   * Custos: **R$ 4.500** (Nv 1) | **R$ 9.000** (Nv 2) | **R$ 15.000** (Nv 3).

### Conquistas & Recordes (`CareerStats` e `TrackRecords`)
* **Recordes por Pista:** Armazena a melhor volta e a melhor colocação obtida em cada circuito (exibindo medalhas de ouro/prata/bronze na tela de seleção).
* **6 Troféus de Carreira:**
  * 🏆 **1ª Vitória** — Vencer uma corrida pela primeira vez.
  * 🥉 **3 Pódios** — Conquistar 3 pódios na carreira.
  * 🌧️ **Rei da Chuva** — Vencer uma corrida sob chuva intensa.
  * 🚀 **P20 ao P1** — Vencer largando de último (20º lugar).
  * 🐢 **Mestre do Fusca** — Vencer uma corrida pilotando o Fusca 1300.
  * 👑 **Campeão** — Terminar em 1º lugar geral na pontuação ao fim de um campeonato.

---

## 🏎️ Física de Pilotagem, Câmbio e Controles

* **Câmbio Automático / Manual (`Car`):** Simulação de marchas baseada em `GEAR_RATIOS` com opção de troca automática ou manual.
* **Vácuo (Slipstream / Slingshot):** Posicionar-se diretamente atrás de um adversário reduz o arrasto, gerando aumento progressivo de velocidade máxima e aceleração para ultrapassagens.
* **Sistema de Nitro Progressivo:** O nitro confere +30% de velocidade máxima e +85% de aceleração instantânea, com decaimento suave ao término da carga.
* **Colisão e Contato Porta a Porta:** Calibrado com precisão física (`0.365`), permitindo disputas lado a lado com faíscas nas latarias (`ParticlePool`).
* **Controles Suportados (`InputHandler`):**
  * **Teclado:** Setas ou `W`/`A`/`S`/`D` (Acelera, Freia, Direção), `Espaço` ou `N` (Nitro), `Enter`/`Esc` (Menus e Pausa).
  * **Gamepad (USB/Bluetooth):** Suporte nativo a analógicos, direcionais e gatilhos progressivos (`L2`/`R2`).
  * **Touchscreen (Mobile):** Botões virtuais na tela com detecção multitoque e resposta imediata.

---

## 🗺️ As 31 Pistas do Campeonato

O calendário visita 4 pistas clássicas e as 27 capitais brasileiras, cada uma com curva de elevação, traçado próprio (`tracks_data.js`) e monumentos regionais exclusivos:

1. **Brasil GP (Autódromo de Interlagos)** — Abertura clássica com o S do Senna e reta dos boxes.
2. **Serra Brasileira** — Descidas sinuosas e relevo desafiador.
3. **Cidade Metrópole** — Circuito urbano rápido entre arranha-céus e luzes noturnas.
4. **Deserto do Sertão** — Longas retas sob o sol forte e asfalto abrasivo.
5. **São Paulo • SP (MASP e Ponte Estaiada)**
6. **Rio de Janeiro • RJ (Cristo Redentor e Pão de Açúcar)**
7. **Brasília • DF (Catedral e Congresso Nacional)**
8. **Salvador • BA (Farol da Barra e Elevador Lacerda)**
9. **Belo Horizonte • MG (Igreja da Pampulha)**
10. **Curitiba • PR (Jardim Botânico)**
11. **Porto Alegre • RS (Laçador e Gasômetro)**
12. **Recife • PE (Pontes Históricas e Marco Zero)**
13. **Fortaleza • CE (Dragão do Mar e Praia de Iracema)**
14. **Manaus • AM (Teatro Amazonas e Ponte Rio Negro)**
15. **Belém • PA (Mercado Ver-o-Peso)**
16. **Goiânia • GO (Monumento às Três Raças)**
17. **Florianópolis • SC (Ponte Hercílio Luz)**
18. **Vitória • ES (Terceira Ponte e Convento da Penha)**
19. **Natal • RN (Forte dos Reis Magos e Dunas)**
20. **Maceió • AL (Pajuçara e Orla das Jangadas)**
21. **João Pessoa • PB (Farol do Cabo Branco)**
22. **São Luís • MA (Casarões Coloniais e Azulejos)**
23. **Teresina • PI (Ponte Estaiada de Teresina)**
24. **Aracaju • SE (Arcos da Orla de Atalaia)**
25. **Cuiabá • MT (Centro Geodésico da América do Sul)**
26. **Campo Grande • MS (Parque das Nações Indígenas)**
27. **Porto Velho • RO (Estrada de Ferro Madeira-Mamoré)**
28. **Rio Branco • AC (Passarela Joaquim Macedo)**
29. **Macapá • AP (Fortaleza de São José e Linha do Equador)**
30. **Boa Vista • RR (Monumento aos Pioneiros)**
31. **Palmas • TO (Palácio Araguaia e Grande Reta Final)**

---

## 🌤️ Sistema de Clima, Horários Dinâmicos e Cenários

O LH44 conta com simulação atmosférica em tempo real (`sky_renderer.js` e `tracks.js`), calculando paletas de cores, reflexos de asfalto molhado, iluminação dos faróis e partículas meteorológicas.

### Condições Climáticas Selecionáveis
* **🌤️ DIA:** Sol aberto, céu azul vibrante e alta visibilidade.
* **🌇 TARDE:** Crepúsculo dourado/alaranjado com transição atmosférica.
* **🌙 NOITE:** Noite fechada com postes urbanos, estrelas, Lua e faróis ativos nos carros.
* **🌧️ CHUVA DIA / ⛈️ CHUVA NOITE:** Chuva contínua com poças d'água e reflexos no asfalto molhado.
* **❄️ NEVE DIA / 🌨️ NEVE NOITE:** Pistas e montanhas cobertas por neve e flocos caindo ao vento.

### Modo Dinâmico (`DINAMICO`)
* **Ciclo Cronológico Contínuo:**
  $$\text{DIA} \longrightarrow \text{TARDE} \longrightarrow \text{NOITE} \longrightarrow \text{DIA}$$
* **Transição Gradual:** Cada etapa permanece por **18 segundos** (`DYN_HOLD = 18`) e transiciona suavemente ao longo de **16 segundos** (`DYN_BLEND = 16`), enquanto mudanças manuais de ambiente interpolam em **2.8 segundos** (`envBlend`).
* **Precipitação Independente e Persistência:** Condições de chuva ou neve podem surgir de forma autônoma ao longo do ciclo, e a escolha do modo Dinâmico é preservada em todo o campeonato e nos saves.

### 🏙️ Cenários e Horizontes Vivos
* **Prédios com Janelas Reativas:** Exibem vidros reflexivos azulados mesmo durante o **dia**, acendem luzes âmbar na **penumbra** e iluminam apartamentos em amarelo/ciano à **noite**.
* **Nuvens Sólidas e Orgânicas (`drawArcadeCloud`):** Desenhadas em silhueta única arredondada com gradiente opaco do ambiente (`E.css.cloudTop` / `E.css.cloudBot`), garantindo oclusão real ao passar na frente do Sol, da Lua e das estrelas.
* **Pontes, Orlas e Monumentos:** Pontes pênseis e estaiadas iluminadas, faixas d'água com reflexos noturnos, antenas com balizas piscantes e relevo regional.

---

## 🤖 Pilotos da IA e Personalidades

O grid é composto por 19 inteligências artificiais com traços comportamentais distintos:
* **Técnicos (`TECHNICAL`):** **HAM**, **SCH**, **RAI**, **FIT**, **VET** — traçado preciso e frenagem otimizada.
* **Agressivos (`AGGRESSIVE`):** **SEN**, **VER**, **ALO**, **MON** — forçam ultrapassagens por dentro e defendem posição com firmeza.
* **Sob Pressão (`PRESSURE_PRONE`):** **BAR**, **BOT**, **NOR** — pilotos rápidos que podem espalhar na curva quando pressionados de perto.

---

## 💻 Arquitetura e Módulos do Projeto

* `index.html` — Ponto de entrada, canvas, overlays de áudio/qualidade/touch e carregamento ordenado dos scripts.
* `css/style.css` — Estilização responsiva e controles mobile.
* `sw.js` & `manifest.webmanifest` — Suporte PWA e cache offline versionado.
* `js/constants.js` — Constantes globais, pilotos da F1, pontuação, marchas e músicas.
* `js/audio.js` — Motor de áudio procedural via Web Audio API (motor, derrapagem, efeitos e trilha chiptune).
* `js/particles.js` — Pool de partículas (`ParticlePool`) para poeira, faíscas, fumaça, chuva e neve.
* `js/input.js` — Gerenciador unificado de Teclado, Gamepad e Touch (`InputHandler`).
* `js/cars.js` — Definições e renderização vetorial dos 20 carros brasileiros (`CAR_MODELS` e `CarArt`).
* `js/car.js` — Física individual dos veículos, transmissão, nitro e IA (`Car`).
* `js/tracks_data.js` — Geometria, curvas e elevações pré-calculadas das 31 pistas.
* `js/tracks.js` — Construtor de pistas (`TrackBuilder`) e presets/interpolação atmosférica (`ENV_PRESETS`).
* `js/monuments.js` — Horizontes, nuvens, skyline com janelas reativas e monumentos de cada cidade.
* `js/sky_renderer.js` — Mixin de renderização de céu, Sol/Lua, estrelas, biomas e chuva/neve.
* `js/road_renderer.js` — Mixin de projeção pseudo-3D de pista, zebras, postes, placas e carros.
* `js/hud_renderer.js` — Mixin de HUD de corrida, minimapa, gap de tempo, Qualy e layouts de tela.
* `js/menu_renderer.js` — Mixin de menus, seleção de modos, calendário customizado, garagem, upgrades e encerramento.
* `js/save.js` — Persistência local em `localStorage` (`SaveManager`, `TrackRecords`, `CareerStats`).
* `js/game.js` — Loop principal, máquina de estados, regras de corrida/campeonato e integração geral (`LH44RacingGame`).
* `js/main.js` — Inicialização do jogo e registro do Service Worker.
* `tests/game.test.mjs` — Suíte automatizada de testes unitários com `node:test`.
* `android-project/` — Projeto Android nativo em WebView com assets sincronizados e script de build.

---

## 🚀 Como Jogar, Testar e Compilar

### 1. No Navegador Web
Inicie um servidor HTTP local na raiz do projeto:
```bash
python3 -m http.server 8080
```
Acesse `http://localhost:8080` (pressione `Ctrl+F5` após atualizações para renovar o cache).

### 2. Testes Automatizados
Execute a suíte de testes com Node.js:
```bash
node --test tests/game.test.mjs
```

### 3. No Smartphone (Android)
O APK pronto para instalação encontra-se na raiz (`LH44_V1.7.apk`). Para recompilar após sincronizar `android-project/assets/`:
```bash
cd android-project
./build_apk.sh
```

---
*LH44 — Do clássico ao bólido dos sonhos nas pistas do Brasil!* 🇧🇷🏁
