# 🏎️ LH44 — Low to High Speed

**LH44** é um jogo arcade de corrida retrô em perspectiva pseudo-3D (estilo clássico *Top Gear*, *OutRun* e *Horizon Chase*), desenvolvido com gráficos vetoriais de alta precisão em Canvas HTML5, áudio sintetizado via Web Audio API e suporte multiplataforma (Web e Android APK).

---

## 📌 Sumário
1. [Visão Geral](#-visão-geral)
2. [Modos de Jogo e Dificuldade](#-modos-de-jogo-e-dificuldade)
3. [Os 20 Carros Brasileiros](#-os-20-carros-brasileiros)
4. [Sistema de Upgrades & Economia](#-sistema-de-upgrades--economia)
5. [Física de Pilotagem e Controles](#-física-de-pilotagem-e-controles)
6. [As 31 Pistas do Campeonato](#-as-31-pistas-do-campeonato)
7. [Sistema de Clima e Horários Dinâmicos](#️-sistema-de-clima-e-horários-dinâmicos)
8. [Pilotos da IA e Personalidades](#-pilotos-da-ia-e-personalidades)
9. [Tecnologia e Arquitetura do Projeto](#-tecnologia-e-arquitetura-do-projeto)
10. [Como Jogar e Compilar](#-como-jogar-e-compilar)

---

## 🎮 Visão Geral

No LH44, o jogador assume o papel de um piloto brasileiro enfrentando 19 rivais inspirados nas maiores lendas da Fórmula 1 (como Ayrton Senna, Lewis Hamilton, Michael Schumacher e Max Verstappen) a bordo dos carros mais icônicos do Brasil — desde o lendário **Fusca 1300** e a **Kombi Corujinha** até o bólido supremo da firma: o **Uno Mille com Escadinha**.

---

## 🏁 Modos de Jogo e Dificuldade

### 1. Campeonato por Temporadas (Season Mode)
* **31 Etapas:** O campeonato percorre os 26 estados do Brasil + Distrito Federal e 4 circuitos especiais.
* **Sistema de Pontuação da F1:** 25, 18, 15, 12, 10, 8, 6, 4, 2, 1 pontos (P1 ao P10).
* **Grid de Largada:** O jogador sempre larga em último lugar (**P20**) e precisa escalar o pelotão com ultrapassagens precisas e gestão do Nitro.
* **Oficina entre Corridas:** A premiação em dinheiro acumulada permite comprar melhorias mecânicas.

### 2. Corrida Rápida (Quick Race)
* Escolha livre de pista, condições climáticas (Dia, Tarde, Noite, Chuva, Neve) e número de voltas para disputas imediatas.

### 3. Níveis de Dificuldade
* **Modo Normal:**
  * Modo carreira completo com economia e upgrades na oficina.
  * Os carros possuem suas velocidades de fábrica balanceadas, e o jogador evolui seu veículo etapa a etapa.
* **Modo Avançado:**
  * Foco puramente em pilotagem competitiva no limite.
  * Todos os carros correm rigorosamente nivelados a **280 km/h** de velocidade máxima.
  * Desativa upgrades e prêmios em dinheiro.

---

## 🚗 Os 20 Carros Brasileiros

Todos os carros são desenhados em código vetorial puro (Canvas 2D), com detalhes realistas como escapamento, lanternas com iluminação noturna, luzes de freio, retrovisores dinâmicos, estepe e decalques próprios:

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

## 🛠️ Sistema de Upgrades & Economia

### Premiação por Corrida
| Posição | Prêmio em Dinheiro |
| :---: | :---: |
| 🥇 **1º Lugar** | **R$ 15.000** |
| 🥈 **2º Lugar** | **R$ 10.000** |
| 🥉 **3º Lugar** | **R$ 7.500** |
| **4º ao 6º** | **R$ 4.500** |
| **7º ao 10º** | **R$ 2.500** |
| **11º ao 20º** | **R$ 1.000** |

### As 3 Categorias de Preparação:
1. **⚡ Motor & Preparação:**
   * Eleva progressivamente a velocidade final do veículo para o **Target Competitivo** (todos os carros no Nível 3 atingem entre 278 km/h e 308 km/h) e adiciona +5% de aceleração por nível (+15% no Nível 3).
   * Custos: **R$ 4.000** (Nv 1) | **R$ 8.000** (Nv 2) | **R$ 14.000** (Nv 3).
2. **🏁 Pneus & Aderência:**
   * Melhora o grip lateral em +6% por nível (+18% no Nível 3), diminuindo a força centrífuga nas curvas.
   * Custos: **R$ 3.500** (Nv 1) | **R$ 7.000** (Nv 2) | **R$ 12.000** (Nv 3).
3. **🚀 Turbo & Nitro:**
   * Aumenta a duração de cada uma das 3 cargas de nitro em +0.60s por nível (+1.80s no Nível 3, alcançando quase 4 segundos contínuos de empurrão).
   * Custos: **R$ 4.500** (Nv 1) | **R$ 9.000** (Nv 2) | **R$ 15.000** (Nv 3).

---

## 🏎️ Física de Pilotagem e Controles

* **Vácuo (Slipstream / Slingshot):**
  Posicionar-se diretamente atrás de um adversário reduz o arrasto, gerando aumento progressivo de velocidade máxima e aceleração para ultrapassagem estilo estilingue.
* **Sistema de Nitro Progressivo:**
  O nitro confere +30% de velocidade máxima e +85% de aceleração instantânea, com decaimento suave de 3 segundos ao término da carga.
* **Colisão e Contato Porta a Porta:**
  Calibrado com precisão física (`0.365`): permite disputas lado a lado justas e agressivas com faíscas nas latarias, sem efeitos de "campo magnético" ou batidas no vazio.
* **Controles Suportados:**
  * **Teclado:** Setas ou W/A/S/D (Acelera, Freia, Direção), Barra de Espaço ou N (Nitro).
  * **Gamepad (Controle USB/Bluetooth):** Suporte total a analógicos, botões e gatilhos de aceleração/frenagem progressivos (L2/R2).
  * **Touchscreen (Mobile):** Botões virtuais na tela com detecção de toque múltiplo e resposta instantânea.

---

## 🗺️ As 31 Pistas do Campeonato

O calendário do campeonato visita circuitos temáticos com clima dinâmico, túneis, viadutos, pontes pênseis e monumentos icônicos de cada região:

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

## 🌤️ Sistema de Clima e Horários Dinâmicos

O LH44 conta com uma simulação visual atmosférica processada em tempo real, calculando paletas de cores, reflexos de asfalto molhado, iluminação dos faróis e partículas meteorológicas para cada ambiente.

### Padrão das Pistas
* **Todas as 31 pistas** possuem configuração padrão em **Dia Ensolarado** (`DIA`), assegurando visibilidade limpa inicial e permitindo que qualquer variação dependa estritamente da escolha do piloto ou do modo dinâmico.

### Condições Climáticas Selecionáveis
* **🌤️ DIA:** Sol aberto, céu azul vibrante e alta visibilidade.
* **🌇 TARDE:** Crepúsculo dourado/alaranjado com transição atmosférica.
* **🌙 NOITE:** Noite fechada com iluminação de postes urbanos, estrelas e faróis ativos nos carros.
* **🌧️ CHUVA DIA / ⛈️ CHUVA NOITE:** Chuva contínua com poças d'água e reflexos espelhados das latarias e luzes de freio no asfalto molhado.
* **❄️ NEVE DIA / 🌨️ NEVE NOITE:** Pistas e montanhas cobertas por neve, geada branca na vegetação e flocos caindo ao sabor do vento.

### Modo Dinâmico (🔄)
* **Ciclo Cronológico Rigoroso:** O tempo segue estritamente a ordem lógica natural:
  $$\text{DIA} \longrightarrow \text{TARDE} \longrightarrow \text{NOITE} \longrightarrow \text{DIA}$$
* **Partida Aleatória:** Qualquer corrida pode se iniciar em qualquer uma das três etapas (começar de dia e entardecer, começar de tarde e anoitecer, ou começar de noite e amanhecer).
* **Precipitação Independente e Imprevisível:** As condições meteorológicas (**Limpo**, **Chuva** ou **Neve**) são sorteadas de forma autônoma para cada período do dia. Uma corrida pode começar com chuva matinal, abrir sol ao entardecer e nevar durante a noite.
* **Transição Suave (Blend Contínuo):** A transição entre os estados ocorre gradualmente a cada ~20 segundos de sustentação com 8 segundos de interpolação não-linear de cores, névoa e partículas.
* **Persistência no Campeonato:** A escolha pelo modo Dinâmico permanece ativa por todas as etapas da temporada, sendo devidamente gravada nos slots de progresso salvos.

### 🏙️ Cenários e Horizontes Vivos das 31 Pistas
Cada um dos circuitos brasileiros conta com uma ambientação própria distribuída em 4 grandes biomas regionais, mantendo seus monumentos oficiais preservados e enriquecidos com elementos vivos:
* **Prédios com Janelas Reativas:** Refletem a luz azulada do céu durante o dia, acendem-se suavemente em tons âmbar ao crepúsculo da tarde e brilham em amarelo, dourado e azul ciano à noite (com variação orgânica realista de apartamentos acesos e apagados).
* **Antenas e Balizas de Aviação:** Mastros no topo dos edifícios com luzes vermelhas piscantes em sincronia com o horário.
* **Orlas, Praias e Lagos:** Faixas d'água fluviais e marítimas com gradientes dinâmicos de profundidade, faixas de areia litorânea e reflexos ondulantes da cidade na água à noite.
* **Pontes Pênseis e Estaiadas:** Cabos e mastros iluminados atravessando rios e baías (Hercílio Luz, Newton Navarro, Terceira Ponte, Estaiada de Teresina, Ponte JK, Ponte Rio Negro e Octávio Frias de Oliveira).
* **Relevo e Vegetação Regional:** Cordilheiras montanhosas, picos alpinos, paredões rochosos de cânions, florestas tropicais de várzea, coqueirais e bosques de araucárias estilizados.

---

## 🤖 Pilotos da IA e Personalidades

O grid é composto por 19 inteligências artificiais com traços comportamentais distintos:

* **Técnicos (`TECHNICAL`):**
  * Exemplos: **HAM** (Hamilton), **SCH** (Schumacher), **RAI** (Räikkönen), **FIT** (Fittipaldi), **VET** (Vettel).
  * Calculam o traçado perfeito, freiam no momento ideal e compensam deficiências de estabilidade do carro.
* **Agressivos (`AGGRESSIVE`):**
  * Exemplos: **SEN** (Senna), **VER** (Verstappen), **ALO** (Alonso), **MON** (Montoya).
  * Forçam ultrapassagens por dentro, entram no limite nas curvas e defendem posição com firmeza.
* **Sob Pressão (`PRESSURE_PRONE`):**
  * Exemplos: **BAR** (Barrichello), **BOT** (Bottas), **NOR** (Norris).
  * Pilotos rápidos que podem espalhar na curva ao serem pressionados de perto pelo jogador.

---

## 💻 Tecnologia e Arquitetura do Projeto

* **Linguagem Principal:** JavaScript ES6+ Vanilla (sem frameworks pesados, 60 FPS cravados).
* **Renderização:** HTML5 `<canvas>` 2D com projeção geométrica pseudo-3D e interpolação de subpixel.
* **Áudio:** Sintetizador sonoro próprio com osciladores Web Audio API (tons polifônicos, ruído de derrapagem, motor dinâmico e trilha sonora chiptune arcade).
* **Mobile / Android:**
  * Projeto Android nativo leve (`android-project/`) encapsulado em WebView acelerada por hardware.
  * Script de compilação automatizado via CLI usando ferramentas oficiais do Android SDK (`aapt2`, `d8`, `zipalign`, `apksigner`).
  * APK final leve (~354 KB) com suporte a tela cheia imersiva e economia de bateria.

---

## 🚀 Como Jogar e Compilar

### 1. No Navegador Web:
Basta iniciar um servidor web local na pasta raiz do projeto:
```bash
python3 -m http.server 8080
```
E acessar no navegador: `http://localhost:8080`

### 2. No Smartphone (Android):
O APK pronto para instalação encontra-se na raiz do projeto:
* **Arquivo:** `LH44_V1.7.apk`
* Para recompilar uma nova versão do APK após editar os códigos web:
```bash
cd android-project
./build_apk.sh
```

---
*LH44 — Do clássico ao bólido dos sonhos nas pistas do Brasil!* 🇧🇷🏁

