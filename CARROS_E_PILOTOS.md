# 🏎️ LH44 — Guia Completo de Carros, Upgrades e Pilotos da IA

Documentação técnica detalhada dos **20 carros brasileiros**, da progressão completa de **upgrades (Níveis 1, 2 e 3)**, da **tabela dos 19 pilotos rivais** e das regras reais de **comportamento da Inteligência Artificial** no jogo.

---

## 📌 Sumário
1. [Tabela Técnica dos 20 Carros](#-tabela-técnica-dos-20-carros)
2. [Progressão de Upgrades (Base, Nv 1, Nv 2 e Nv 3)](#-progressão-de-upgrades-base-nv-1-nv-2-e-nv-3)
3. [Características Individuais por Modelo](#-características-individuais-por-modelo)
4. [Os 19 Pilotos da IA e Personalidades](#-os-19-pilotos-da-ia-e-personalidades)
5. [Comportamento e Lógica da IA na Pista](#-comportamento-e-lógica-da-ia-na-pista)

---

## 📊 Tabela Técnica dos 20 Carros

Todos os atributos abaixo são lidos diretamente de `CAR_MODELS` (`js/cars.js`) e `MODEL_ENGINE_SPEED_BONUS` (`js/constants.js`):

| Carro                | Base (km/h) | Nv 1 (km/h) | Nv 2 (km/h) | Nv 3 (km/h) | Aceleração | Frenagem | Handling | Grip | Resist. Centrífuga | Potência Nitro |
| :------------------- | :---------: | :---------: | :---------: | :---------: | :--------: | :------: | :------: | :--: | :----------------: | :------------: |
| 🚀 **UNO MILLE**     |     298     |     301     |     305     |   **308**   |    0.82    |   0.90   |   0.60   | 0.65 |        0.62        |      1.10      |
| 🏎️ **VW SANTANA GLSi** |   286     |     291     |     295     |   **300**   |    0.84    |   0.87   |   0.72   | 0.82 |        0.84        |      1.02      |
| 🏎️ **OPALA SS 4.100**  |   284     |     289     |     293     |   **298**   |  **1.05**  |   0.72   |   0.70   | 0.74 |        0.70        |      1.05      |
| 🚗 **FORD FOCUS**    |     275     |     281     |     288     |   **294**   |    0.86    |   0.92   |   0.94   | 0.94 |        0.93        |      0.96      |
| 🚗 **SANDERO R.S.**  |     272     |     279     |     285     |   **292**   |    0.85    | **0.93** |   0.90   | 0.91 |        0.90        |      0.98      |
| 🚗 **GOL GTS 1.8S**  |     270     |     277     |     283     |   **290**   |    0.94    |   0.86   |   0.86   | 0.86 |        0.85        |      0.98      |
| 🚗 **ONIX**          |     268     |     275     |     281     |   **288**   |    0.83    |   0.88   |   0.85   | 0.86 |        0.85        |      0.90      |
| 🚗 **HB20**          |     260     |     268     |     277     |   **285**   |    0.76    |   0.82   |   0.82   | 0.84 |        0.84        |      0.88      |
| 🚗 **FIAT PALIO**    |     260     |     268     |     277     |   **285**   |    0.78    |   0.87   |   0.85   | 0.86 |        0.85        |      0.87      |
| 🚗 **CELTA**         |     258     |     267     |     275     |   **284**   |    0.80    |   0.85   |   0.89   | 0.88 |        0.88        |      0.88      |
| 🚗 **CORSA WIND**    |     254     |     264     |     274     |   **284**   |    0.77    |   0.86   |   0.88   | 0.87 |        0.86        |      0.86      |
| 🚗 **CHEVETTE TUBARÃO** |  250     |     261     |     271     |   **282**   |    0.82    |   0.82   |   0.96   | 0.92 |        0.90        |      0.85      |
| 🚗 **FORD KA**       |     250     |     261     |     271     |   **282**   |    0.79    |   0.88   |   0.98   | 0.96 |        0.95        |      0.84      |
| 🚗 **FIAT MOBI**     |     246     |     257     |     269     |   **280**   |    0.81    |   0.86   |   0.92   | 0.88 |        0.89        |      0.84      |
| 🚗 **RENAULT KWID**  |     244     |     256     |     268     |   **280**   |    0.84    |   0.83   |   0.81   | 0.83 |        0.81        |      0.82      |
| 🚙 **PEUGEOT 206**   |     238     |     253     |     269     |   **284**   |    1.00    |   0.85   |   0.84   | 0.88 |        0.88        |      0.95      |
| 🚙 **RURAL WILLYS**  |     236     |     251     |     265     |   **280**   |    0.88    |   0.78   |   0.68   | 0.95 |        0.86        |      0.85      |
| 🚗 **BRASÍLIA AMARELA** |  232     |     248     |     263     |   **279**   |    0.70    |   0.80   |   0.89   | 0.92 |        0.92        |      0.80      |
| 🚐 **KOMBI CORUJINHA** |   230     |     246     |     262     |   **278**   |    0.69    |   0.79   |   0.66   | 0.88 |        0.78        |      0.75      |
| 🐢 **FUSCA 1300**    |     228     |     245     |     262     |   **278**   |    0.58    |   0.75   | **1.00** | **1.00** |    **1.00**    |      0.78      |

> **Nota sobre o Modo Avançado:** No modo **Avançado**, todos os 20 carros correm nivelados em **280 km/h** de velocidade máxima e os upgrades ficam desativados, mantendo apenas as diferenças naturais de chassi (aceleração, frenagem, handling e grip).

---

## 🛠️ Progressão de Upgrades (Base, Nv 1, Nv 2 e Nv 3)

Os upgrades ficam disponíveis na oficina entre etapas (`SEASON_UPGRADES`) no **Campeonato Normal** (Oficial ou Customizado):

| Categoria              | Nível 1    | Nível 2    | Nível 3    | Custo Total | Efeito por Nível                                                       |
| :--------------------- | :--------: | :--------: | :--------: | :---------: | :--------------------------------------------------------------------- |
| ⚡ **Motor & Preparação** | R$ 4.000   | R$ 8.000   | R$ 14.000  | **R$ 26.000** | Bônus de velocidade final específico do modelo + **+5% aceleração** (+15% no Nv 3). |
| 🏁 **Pneus & Aderência**  | R$ 3.500   | R$ 7.000   | R$ 12.000  | **R$ 22.500** | **+6% de grip e tração em curvas** por nível (+18% no Nv 3).           |
| 🚀 **Turbo & Nitro**      | R$ 4.500   | R$ 9.000   | R$ 15.000  | **R$ 29.000** | **+0.60s de duração contínua** por carga de nitro (+1.80s no Nv 3).    |
| **TOTAL COMPLETO**     | **R$ 12.000** | **R$ 24.000** | **R$ 41.000** | **R$ 77.500** | Carro no auge competitivo de velocidade, curva e nitro.                |

### Bônus de Velocidade do Motor por Carro (`MODEL_ENGINE_SPEED_BONUS`)
* Carros com velocidade base menor recebem ganhos maiores por nível para alcançar o pelotão competitivo no Nível 3:
  * **Fusca 1300:** `+17` (Nv 1) / `+34` (Nv 2) / `+50` (Nv 3) → `228 → 245 → 262 → 278 km/h`
  * **Kombi / Brasília / Peugeot 206 / Rural:** ganham de `+15` a `+16` por nível até `278–284 km/h`
  * **Uno Mille / Santana / Opala:** recebem incrementos menores (`+3/+4` a `+5`), mantendo a liderança em velocidade final (`298–308 km/h`)

---

## 🚘 Características Individuais por Modelo

| Carro                  | Perfil de Pilotagem                                                                 |
| :--------------------- | :---------------------------------------------------------------------------------- |
| **UNO MILLE**          | Maior velocidade final (`298→308`) e nitro mais forte (`1.10`), porém menor grip (`0.65`) e handling (`0.60`). Exige cuidado em curvas fechadas. |
| **VW SANTANA GLSi**    | Sedã estradeiro de altíssima final (`286→300`) e ótimo nitro (`1.02`), equilibrado em curvas abertas. |
| **OPALA SS 4.100**     | Maior aceleração pura do jogo (`1.05`), nitro fortíssimo (`1.05`), mas freio (`0.72`) e grip (`0.74`) exigem antecipação. |
| **FORD FOCUS**         | Um dos pacotes mais completos: final alta (`275→294`), freio excelente (`0.92`) e grip/handling de `0.94`. |
| **SANDERO R.S.**       | Melhor frenagem do jogo (`0.93`) com ótimo equilíbrio geral (`0.90–0.91`) e velocidade competitiva (`272→292`). |
| **GOL GTS 1.8S**       | Retomada muito forte (`0.94`), bom nitro (`0.98`) e conjunto ágil (`0.86`). |
| **ONIX**               | All-rounder moderno e previsível (`268→288`), sem pontos fracos evidentes. |
| **HB20 / FIAT PALIO**  | Compactos equilibrados (`260→285`), fáceis de controlar tanto para iniciantes quanto em tráfego intenso. |
| **CELTA / CORSA WIND** | Leves e ágeis em curvas médias (`0.87–0.89`), com boa progressão até `284 km/h` no Nv 3. |
| **CHEVETTE TUBARÃO**   | Handling muito alto (`0.96`) e grip forte (`0.92`), excelente para circuitos travados e curvas rápidas. |
| **FORD KA**            | Segundo melhor conjunto de curva do jogo (`handling 0.98`, `grip 0.96`, `resistência 0.95`). |
| **FIAT MOBI / KWID**   | Ágeis nas manobras urbanas (`Mobi` com `handling 0.92`; `Kwid` com boa arrancada `0.84`). |
| **PEUGEOT 206**        | Segunda maior aceleração do jogo (`1.00`), compensando a base mais baixa (`238→284`) com retomadas agressivas. |
| **RURAL WILLYS**       | Excelente grip (`0.95`) e boa arrancada (`0.88`), embora com direção mais pesada (`0.68`). |
| **BRASÍLIA AMARELA**   | Muito estável em curvas abertas (`grip 0.92`, `resistência 0.92`), velocidade final moderada (`232→279`). |
| **KOMBI CORUJINHA**    | Desafio clássico de carisma máximo (`230→278`), direção pesada (`0.66`), mas boa sustentação em retas longas. |
| **FUSCA 1300**         | **Rei da aderência** (`handling 1.00`, `grip 1.00`, `resistência 1.00`). Faz curvas sem aliviar o pé, compensando a arrancada lenta (`0.58`). |

---

## 🤖 Os 19 Pilotos da IA e Personalidades

A lista de adversários (`F1_DRIVERS` em `js/constants.js`) é combinada com personalidades fixas e habilidade base definida em `initSeasonRoster()` (`js/game.js`):

| Ordem Base | Sigla | Piloto       | Personalidade    | Faixa de Habilidade Base | Estilo na Pista                                                    |
| :--------: | :---: | :----------- | :--------------- | :----------------------- | :----------------------------------------------------------------- |
|     01     | `HAM` | HAMILTON     | `TECHNICAL`      | ~`0.980` (±0.0175)       | Líder técnico; traçado cirúrgico no apex e ritmo constante.        |
|     02     | `SEN` | SENNA        | `AGGRESSIVE`     | ~`0.973` (±0.0175)       | Defesa agressiva de linha e ataques incisivos.                     |
|     03     | `BAR` | BARRICHELO   | `PRESSURE_PRONE` | ~`0.966` (±0.0175)       | Rápido, porém suscetível a oscilar quando pressionado de perto.    |
|     04     | `RUS` | RUSSEL       | `AGGRESSIVE`     | ~`0.959` (±0.0175)       | Fecha portas em reta com firmeza.                                  |
|     05     | `VER` | VERSTAPPEN   | `AGGRESSIVE`     | ~`0.952` (±0.0175)       | Ultra-agressivo na defesa de posição.                              |
|     06     | `BOT` | BOTTAS       | `PRESSURE_PRONE` | ~`0.945` (±0.0175)       | Bom ritmo limpo, perde estabilidade sob pressão prolongada.        |
|     07     | `RAI` | RAIKKONEN    | `TECHNICAL`      | ~`0.938` (±0.0175)       | Consistente em curvas e eficiente na defesa.                       |
|     08     | `SCH` | SCHUMACHER   | `TECHNICAL`      | ~`0.931` (±0.0175)       | Precisão no contorno de curvas e leitura de corrida.               |
|     09     | `BUT` | BUTTON       | `TECHNICAL`      | ~`0.924` (±0.0175)       | Traçado suave e econômico em curvas técnicas.                      |
|     10     | `ANT` | ANTONELLI    | `PRESSURE_PRONE` | ~`0.917` (±0.0175)       | Jovem veloz que sente o calor das disputas coladas.                |
|     11     | `FIT` | FITTIPALDI   | `TECHNICAL`      | ~`0.910` (±0.0175)       | Regularidade e controle preciso nas tangências.                    |
|     12     | `KUB` | KUBICA       | `PRESSURE_PRONE` | ~`0.903` (±0.0175)       | Competitivo no pelotão intermediário, oscila sob pressão extrema.  |
|     13     | `MON` | MONTOYA      | `AGGRESSIVE`     | ~`0.896` (±0.0175)       | Disputas duras lado a lado e bloqueios firmes.                     |
|     14     | `SAT` | SATO         | `AGGRESSIVE`     | ~`0.889` (±0.0175)       | Arrojado nas manobras em reta.                                     |
|     15     | `ALO` | ALONSO       | `AGGRESSIVE`     | ~`0.882` (±0.0175)       | Defesa tática ferrenha contra ataques do jogador.                  |
|     16     | `VET` | VETTEL       | `TECHNICAL`      | ~`0.875` (±0.0175)       | Excelente tangência no apex em trechos sinuosos.                   |
|     17     | `SAI` | SAINZ        | `TECHNICAL`      | ~`0.868` (±0.0175)       | Constante em sequências de curvas.                                 |
|     18     | `NOR` | NORRIS       | `PRESSURE_PRONE` | ~`0.861` (±0.0175)       | Ritmo forte, mas cede leve espaço se pressionado por >0.9s.        |
|     19     | `BOR` | BORTOLETO    | `PRESSURE_PRONE` | ~`0.854` (±0.0175)       | Estreante arrojado no grid, vulnerável à pressão direta.           |

> A habilidade final de corrida de cada bot (`bot.aiSkill`) recebe uma pequena variação por etapa (`±0.0125`) e é limitada ao intervalo **`0.78` a `0.99`**.

---

## 🧠 Comportamento e Lógica da IA na Pista

O comportamento dos 19 bots é controlado em tempo real no método de atualização de corrida (`js/game.js`):

### 1. Largada Limpa (`raceTimer < 2.6s`)
* Nos primeiros **2,6 segundos** após a largada, os bots mantêm rigorosamente sua faixa inicial do grid (`gridStartX`), evitando colisões caóticas e cruzamentos bruscos no funil da primeira curva.

### 2. Velocidade Alvo
* Cada bot calcula sua velocidade base de cruzeiro pela fórmula:
  $$\text{baseTargetSpeed} = \text{EffectiveMaxSpeed}(\text{bot}) \times \text{bot.aiSkill} \times 0.96$$
* Esse valor é ajustado dinamicamente em curvas fechadas, vácuo, ativação de nitro e situações de pressão.

### 3. Regras por Personalidade
| Personalidade    | Defesa Ativa em Reta (`defRate`) | Tangência em Curvas (`apexX`)               | Reação sob Pressão (`|pDistZ| < 160` e `|Δx| < 0.42`) |
| :--------------- | :------------------------------: | :------------------------------------------ | :---------------------------------------------------- |
| `AGGRESSIVE`     | **3.5** (fecha rápido a linha)   | Padrão (`-curve * 0.26`, taxa `2.1`)        | Mantém o ritmo sem ceder espaço.                      |
| `TECHNICAL`      | **2.6** (defesa equilibrada)     | **Cirúrgica** (`-curve * 0.34`, taxa `2.8`) | Mantém o traçado ideal com consistência.              |
| `PRESSURE_PRONE` | **1.9** (defesa mais branda)     | Padrão (`-curve * 0.26`, taxa `2.1`)        | Após **0.9s** colado, oscila lateralmente e cai para **97%** da velocidade alvo. |

### 4. Vácuo (Slipstream) e Nitro dos Bots
* **Vácuo:** Quando um bot entra no vácuo de outro carro à frente (`leadDist > 110`), ele alinha rapidamente atrás do líder (taxa `3.4`) para ganhar embalo e preparar ultrapassagem.
* **Uso de Nitro:** Os bots utilizam cargas de nitro (`3.0s` de duração, com cooldown entre `4.2s` e `8.7s`) para atacar ou responder em retas.

### 5. Formação do Grid no Campeonato
* Na **Etapa 1**, os bots largam ordenados pela habilidade base (`seasonGridOrder`).
* Nas **etapas seguintes**, o grid dos bots é recalculado conforme a **pontuação acumulada no campeonato** (quem lidera o torneio entre os bots larga na frente).
* O jogador larga na posição conquistada no **Qualy** ou em **P20** caso opte por largar sem classificação.

### 6. Regras no Multiplayer Online 2P
* **Grid de 20 Carros:** **Host (`P19`) + Amigo (`P20`) + 18 Bots** simulados pelo Host.
* **Carros e Cores Livres:** Ambos os jogadores podem escolher qualquer carro e cor, inclusive modelos e cores idênticos.
* **Upgrades Online:** No **Campeonato Online (Normal)**, cada jogador acumula seus próprios créditos e compra seus próprios upgrades de Motor, Pneus e Turbo entre etapas (sincronizados na sala); no **Modo Avançado**, todos correm nivelados a **280 km/h**.

---
*LH44 — Low to High Speed* 🏁🇧🇷
