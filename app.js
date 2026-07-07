// Global State
let ecoPoints = 0;
let savedApiKey = '';
let selectedModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
if (selectedModel === 'gemini-1.5-flash') {
  selectedModel = 'gemini-2.5-flash';
}
let activeView = 'fan';
let currentLanguage = 'en';

// Simulated Gate Wait Times (Synced with sliders)
const gateWaitTimes = {
  a: 5,
  b: 12,
  c: 25,
  d: 8
};

// Dynamic Map Paths Database (from Gates to Sections)
const pathCoordinates = {
  // Gate A (220, 300)
  'gate-a-to-sector-100': 'M 220 300 Q 250 300 290 300',
  'gate-a-to-sector-200': 'M 220 300 Q 250 220 350 210',
  'gate-a-to-sector-300': 'M 220 300 Q 400 300 480 300',
  'gate-a-to-sector-400': 'M 220 300 Q 250 380 350 390',
  
  // Gate B (400, 160)
  'gate-b-to-sector-100': 'M 400 160 Q 330 200 310 280',
  'gate-b-to-sector-200': 'M 400 160 V 210',
  'gate-b-to-sector-300': 'M 400 160 Q 470 200 490 280',
  'gate-b-to-sector-400': 'M 400 160 Q 300 300 400 380',

  // Gate C (580, 300)
  'gate-c-to-sector-100': 'M 580 300 Q 400 300 310 300',
  'gate-c-to-sector-200': 'M 580 300 Q 550 220 450 210',
  'gate-c-to-sector-300': 'M 580 300 Q 550 300 490 300',
  'gate-c-to-sector-400': 'M 580 300 Q 550 380 450 395',

  // Gate D (400, 440)
  'gate-d-to-sector-100': 'M 400 440 Q 320 400 310 320',
  'gate-d-to-sector-200': 'M 400 440 Q 300 300 400 220',
  'gate-d-to-sector-300': 'M 400 440 Q 480 400 490 320',
  'gate-d-to-sector-400': 'M 400 440 V 380'
};

// Multilingual Chatbot Knowledge Base (Local Fallback)
const localLangDB = {
  en: {
    welcome: "Welcome to the FIFA World Cup 2026 Stadium Concierge! 🏆 I can help you with wayfinding, accessibility, transit options, concessions, and real-time alerts. Ask me anything in your preferred language.",
    placeholder: "Type your question about MetLife Stadium...",
    answering: "Thinking...",
    unknown: "I apologize, but I did not fully catch that. Try asking about 'wheelchair access', 'parking shuttle', 'Gate C congestion', 'recycle coupons', or 'vegan food'.",
    keywords: [
      {
        keys: ['wheelchair', 'ada', 'accessible', 'elevator', 'disability', 'sensory'],
        response: "♿ **Accessibility Guide**: MetLife Stadium provides step-free access. Primary **Elevator Hubs** are situated directly inside **Gate A (West)** and **Gate C (East)**. Dedicated wheelchair companion seating is in Row A of Sections 101, 102, 120, and 301. A quiet **Sensory Calming Room** is behind Section 404 for neurodivergent guests. Sensory packs and noise-canceling headphones are available there."
      },
      {
        keys: ['parking', 'shuttle', 'bus', 'rideshare', 'transit', 'train', 'uber', 'taxi', 'station'],
        response: "🚗 **Transport & Transit Directions**:\n- **Train**: NJ Transit trains arrive at MetLife Station directly adjacent to **Gate C**. Wheelchair-accessible boarding ramps are present.\n- **Shuttles**: Park in the North Lot and take the Rapid Express Shuttles directly to Gate B.\n- **Rideshare**: Uber/Lyft pickup/dropoff is located at the South Lot, a short walk from Gate D.\n- **ADA Drop-off**: West Lot, adjacent to Gate A."
      },
      {
        keys: ['food', 'concession', 'vegan', 'drink', 'beer', 'eat', 'gluten'],
        response: "🍔 **Concessions & Food Hubs**:\n- **Vegan/Gluten-Free**: Visit Section 205 for specialty hotdogs, plant-based burgers, and gluten-free snacks.\n- **Eco-Concessions**: Sector 406 features the Main Eco Hub. Return your reusable cups here to scan for +20 Green Points!\n- **Local Favorites**: Section 112 hosts Jersey Shore Boardwalk Fries."
      },
      {
        keys: ['gate', 'entry', 'queue', 'line', 'wait', 'busy'],
        response: () => `🏟️ **Gate Entry Status**:\n- **Gate A (West)**: Wait time is **${gateWaitTimes.a} mins** (Normal/Fast).\n- **Gate B (North)**: Wait time is **${gateWaitTimes.b} mins** (Moderate).\n- **Gate C (East)**: Wait time is **${gateWaitTimes.c} mins** (Very busy due to train arrivals).\n- **Gate D (South)**: Wait time is **${gateWaitTimes.d} mins** (Normal).\n\n*Recommendation*: Enter via Gate A or D to bypass queues. You can walk inside the stadium concourse to get to your section.`
      },
      {
        keys: ['points', 'points', 'recycle', 'eco', 'sustainability', 'ecopass', 'coupon', 'discount'],
        response: "🌱 **EcoPass Rewards System**: Earn Green Points by using our Sustainability tracker! Scan PET bottles (+50 pts), Aluminum Cans (+50 pts), or check-in with your NJ Transit Train Ticket (+100 pts). Earn 100 points to unlock a 20% discount coupon valid at all concession stands."
      },
      {
        keys: ['match', 'schedule', 'fifa', 'world cup', 'game', 'final', 'playoff'],
        response: "⚽ **Match Information**: Welcome to the FIFA World Cup 2026! Today MetLife Stadium hosts the Group Stage match. Gates open 3 hours prior to kickoff. Ensure you have your digital tickets loaded on your mobile wallet before arriving at the outer security perimeter."
      }
    ]
  },
  es: {
    welcome: "¡Bienvenido al Asistente Digital de la Copa Mundial de la FIFA 2026! 🏆 Puedo ayudarle con mapas, accesibilidad, transporte, comidas y alertas en tiempo real. Pregúnteme lo que desee.",
    placeholder: "Escriba su pregunta sobre el estadio...",
    answering: "Pensando...",
    unknown: "Lo siento, no comprendí bien. Intente preguntar sobre 'silla de ruedas', 'estacionamiento de autobús', 'espera de puertas', 'reciclaje' o 'comida vegana'.",
    keywords: [
      {
        keys: ['silla', 'ruedas', 'ada', 'accesible', 'ascensor', 'discapacidad', 'sensorial'],
        response: "♿ **Guía de Accesibilidad**: El estadio cuenta con accesos sin escalones. Los **Ascensores Principales** están junto a la **Puerta A (Oeste)** y la **Puerta C (Este)**. Los asientos para silla de ruedas están en la Fila A de las Secciones 101, 102, 120 y 301. Hay una **Sala de Calma Sensorial** detrás de la Sección 404 para personas neurodivergentes."
      },
      {
        keys: ['autobus', 'estacionamiento', 'tren', 'transporte', 'uber', 'taxi', 'shuttle', 'parqueo'],
        response: "🚗 **Transporte y Tránsito**:\n- **Tren**: NJ Transit llega a la estación de MetLife junto a la **Puerta C**. Cuenta con rampa accesible.\n- **Autobuses Express**: Desde el Lote Norte hasta la Puerta B.\n- **Rideshare/Uber**: Zona de recogida en el Lote Sur, cerca de la Puerta D.\n- **ADA Drop-off**: Lote Oeste, cerca de la Puerta A."
      },
      {
        keys: ['comida', 'vegano', 'comer', 'bebida', 'cerveza', 'restaurante', 'singluten'],
        response: "🍔 **Comida y Concesiones**:\n- **Vegano/Sin Gluten**: Sección 205 tiene perritos calientes y hamburguesas veganas.\n- **Eco-Concesiones**: Sección 406. ¡Devuelva sus vasos reutilizables para ganar +20 Puntos Verdes!\n- **Especialidades locales**: Papas fritas en la Sección 112."
      },
      {
        keys: ['puerta', 'entrada', 'cola', 'espera', 'fila', 'tiempo'],
        response: () => `🏟️ **Estado de Puertas**:\n- **Puerta A**: Espera de **${gateWaitTimes.a} min** (Rápido).\n- **Puerta B**: Espera de **${gateWaitTimes.b} min** (Moderado).\n- **Puerta C**: Espera de **${gateWaitTimes.c} min** (Muy congestionado).\n- **Puerta D**: Espera de **${gateWaitTimes.d} min** (Normal).\n\n*Consejo*: Entre por la Puerta A o D para evitar esperas largas.`
      },
      {
        keys: ['puntos', 'reciclar', 'sostenibilidad', 'ecopass', 'descuento', 'cupon'],
        response: "🌱 **Programa EcoPass**: ¡Gane Puntos Verdes reciclando! Escanee botellas de plástico (+50 pts), latas (+50 pts) o su boleto de tren (+100 pts). Al llegar a 100 puntos, obtendrá un cupón de 20% de descuento en comida."
      }
    ]
  },
  fr: {
    welcome: "Bienvenue au service Concierge du Stade de la Coupe du Monde de la FIFA 2026 ! 🏆 Je peux vous aider avec l'orientation, l'accessibilité, les transports et les concessions.",
    placeholder: "Posez votre question sur le stade...",
    answering: "Réflexion...",
    unknown: "Désolé, je n'ai pas bien compris. Posez une question sur 'fauteuil roulant', 'navette parking', 'attente porte', 'recyclage' ou 'nourriture'.",
    keywords: [
      {
        keys: ['fauteuil', 'roulant', 'accessibilité', 'ada', 'ascenseur', 'handicap'],
        response: "♿ **Guide d'Accessibilité**: L'accès est de plain-pied. Les **Ascenseurs Principaux** se trouvent aux **Portes A (Ouest)** et **Porte C (Est)**. Les places accessibles sont situées au rang A des sections 101, 102 et 120. Une **Chambre Sensorielle Calme** est disponible derrière la section 404."
      },
      {
        keys: ['parking', 'navette', 'bus', 'train', 'transport', 'taxi', 'uber'],
        response: "🚗 **Transports & Accès**:\n- **Train**: Trains NJ Transit à la gare MetLife à côté de la **Porte C**.\n- **Navettes**: Parking Nord vers Porte B.\n- **Rideshare/Uber**: Dépose au Parking Sud (près de la Porte D)."
      },
      {
        keys: ['porte', 'attente', 'file', 'queue', 'entrée'],
        response: () => `🏟️ **Temps d'attente aux Portes**:\n- **Porte A**: **${gateWaitTimes.a} min** (Fluide).\n- **Porte B**: **${gateWaitTimes.b} min** (Modéré).\n- **Porte C**: **${gateWaitTimes.c} min** (Surchargé).\n- **Porte D**: **${gateWaitTimes.d} min** (Normal).`
      }
    ]
  },
  ar: {
    welcome: "مرحباً بكم في مساعد ملعب كأس العالم لكرة القدم ٢٠٢٦! 🏆 يمكنني مساعدتك في تحديد الاتجاهات، والوصول الميسر، والمواصلات، والمطاعم. اسألني أي شيء.",
    placeholder: "اكتب سؤالك هنا...",
    answering: "جاري التفكير...",
    unknown: "عذراً، لم أفهم سؤالك جيداً. جرب السؤال عن 'كرسي متحرك'، 'حافلات المواصلات'، 'انتظار البوابات'، أو 'نقاط إعادة التدوير'.",
    keywords: [
      {
        keys: ['كرسي', 'متحرك', 'عربة', 'ذوي', 'همم', 'ميسر', 'مصعد'],
        response: "♿ **دليل الوصول الميسر**: يوفر الملعب مسارات خالية من الدرجات. توجد **المصاعد الرئيسية** عند **البوابة A (الغربية)** و**البوابة C (الشرقية)**. أماكن الكراسي المتحركة متوفرة في الصف A بالقطاعات 101، 102، و 120. توجد **غرفة التهدئة الحسية** خلف قطاع 404."
      },
      {
        keys: ['بوابة', 'بوابات', 'انتظار', 'طابور', 'زحام'],
        response: () => `🏟️ **حالة بوابات الدخول**:\n- **البوابة A**: الانتظار **${gateWaitTimes.a} دقائق** (سريع)\n- **البوابة B**: الانتظار **${gateWaitTimes.b} دقيقة** (متوسط)\n- **البوابة C**: الانتظار **${gateWaitTimes.c} دقيقة** (مزدحم جداً بسبب القطارات)\n- **البوابة D**: الانتظار **${gateWaitTimes.d} دقائق** (طبيعي)`
      }
    ]
  }
};

// Fallback logic for missing languages (Redirect to English defaults)
function getLanguageDB(lang) {
  return localLangDB[lang] || localLangDB['en'];
}

// -------------------------------------------------------------
// CORE INTERFACE FUNCTIONS
// -------------------------------------------------------------

// Switch Portal Views (Fan Concierge <=> Staff Command)
function switchView(view) {
  activeView = view;
  
  // Update navbar button states
  document.getElementById('btn-fan-view').classList.toggle('active', view === 'fan');
  document.getElementById('btn-ops-view').classList.toggle('active', view === 'ops');
  
  // Toggle visible sections
  document.getElementById('fan-screen').classList.toggle('active', view === 'fan');
  document.getElementById('ops-screen').classList.toggle('active', view === 'ops');

  // Trigger visual updates for stats/charts if opening Ops
  if (view === 'ops') {
    recalculateOpsStats();
  }
}

// Translate language updates on Fan Chat UI
function changeLanguage() {
  const langSelect = document.getElementById('fan-lang');
  currentLanguage = langSelect.value;
  
  const db = getLanguageDB(currentLanguage);
  
  // Update elements
  document.getElementById('welcome-msg').innerText = db.welcome;
  document.getElementById('chat-input').placeholder = db.placeholder;
}

// Toggle Gemini API configuration modal
function toggleApiModal() {
  const modal = document.getElementById('api-modal');
  modal.classList.toggle('hidden');
  
  if (!modal.classList.contains('hidden')) {
    document.getElementById('gemini-key').value = savedApiKey;
    document.getElementById('gemini-model').value = selectedModel;
  }
}

// Save Gemini credentials
function saveApiKey() {
  const key = document.getElementById('gemini-key').value.trim();
  const model = document.getElementById('gemini-model').value;
  
  savedApiKey = key;
  selectedModel = model;
  
  localStorage.setItem('gemini_api_key', key);
  localStorage.setItem('gemini_model', model);
  
  const statusTag = document.getElementById('api-status-tag');
  const copilotModeLbl = document.getElementById('copilot-mode-lbl');
  
  if (key) {
    statusTag.classList.remove('offline');
    statusTag.classList.add('online');
    statusTag.querySelector('.status-label').innerText = 'Live Gemini ' + (model.includes('flash') ? 'Flash' : 'Pro');
    if (copilotModeLbl) copilotModeLbl.innerText = 'Connected: ' + model;
  } else {
    statusTag.classList.remove('online');
    statusTag.classList.add('offline');
    statusTag.querySelector('.status-label').innerText = 'Mock Gemini Eng.';
    if (copilotModeLbl) copilotModeLbl.innerText = 'Running in Offline Mode';
  }
  
  toggleApiModal();
}

// Remove credentials
function clearApiKey() {
  document.getElementById('gemini-key').value = '';
  savedApiKey = '';
  localStorage.removeItem('gemini_api_key');
  
  const statusTag = document.getElementById('api-status-tag');
  statusTag.classList.remove('online');
  statusTag.classList.add('offline');
  statusTag.querySelector('.status-label').innerText = 'Mock Gemini Eng.';
  
  const copilotModeLbl = document.getElementById('copilot-mode-lbl');
  if (copilotModeLbl) copilotModeLbl.innerText = 'Running in Offline Mode';
  
  toggleApiModal();
}

// -------------------------------------------------------------
// INTERACTIVE MAP CONTROLS
// -------------------------------------------------------------

let selectedMapElement = null;

// Handle clicking on map sections or gates
function selectMapItem(name, details) {
  // Reset previously highlighted paths/elements
  resetMapHighlights();

  // Highlight selected element visually if applicable
  const mapDetailPanel = document.getElementById('map-meta-panel');
  const emptyPanel = document.getElementById('map-detail-empty');
  const contentPanel = document.getElementById('map-detail-content');
  
  emptyPanel.classList.add('hidden');
  contentPanel.classList.remove('hidden');
  
  document.getElementById('map-detail-title').innerText = name;
  document.getElementById('map-detail-text').innerText = details;

  // Render quick wayfinding actions depending on type
  const routingActions = document.getElementById('routing-actions');
  routingActions.innerHTML = '';

  if (name.includes('Section') || name.includes('SEC')) {
    // Sector clicked - propose routing buttons
    const cleanSecId = name.match(/\d+/)[0]; // e.g. "100"
    
    routingActions.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="calculateRoute('gate-a', 'sector-${cleanSecId}')">🚶 Route from Gate A</button>
      <button class="btn btn-secondary btn-sm" onclick="calculateRoute('gate-b', 'sector-${cleanSecId}')">🚶 Route from Gate B</button>
    `;
  } else if (name.includes('Station') || name.includes('Parking') || name.includes('Drop-off')) {
    // Transit Hub clicked - propose routing to main entries
    routingActions.innerHTML = `
      <button class="btn btn-primary btn-sm" onclick="highlightTransitLink('${name}')">💡 Show Direct Gate Pathway</button>
    `;
  }
}

// Calculate route pathing coordinates
function calculateRoute(gateId, targetSectorId) {
  const pathId = `${gateId}-to-${targetSectorId}`;
  const coordinates = pathCoordinates[pathId];
  const dynamicPath = document.getElementById('dynamic-nav-path');

  if (coordinates && dynamicPath) {
    dynamicPath.setAttribute('d', coordinates);
    dynamicPath.classList.remove('hidden');
    
    // Add success notification in chat log simulating wayfinding copilot guidance
    appendChatLog('🤖 Concierge Wayfinder', `I have highlighted the optimal route from **${gateId.toUpperCase().replace('-', ' ')}** directly into **${targetSectorId.toUpperCase().replace('-', ' ')}** on your display map. Safe walking!`, 'assistant');
    
    // Highlight the sector path
    document.getElementById(targetSectorId).classList.add('highlighted');
  }
}

function highlightTransitLink(zoneName) {
  const dynamicPath = document.getElementById('dynamic-nav-path');
  let dAttr = '';
  let msg = '';
  
  if (zoneName.includes('Station')) {
    dAttr = "M 730 300 H 580";
    msg = "NJ Transit Station links directly to Gate C via step-free asphalt walkways.";
  } else if (zoneName.includes('Parking')) {
    dAttr = "M 400 70 V 160";
    msg = "Express shuttles from the North Lot park and load at Gate B entry plaza.";
  } else if (zoneName.includes('Drop-off')) {
    dAttr = "M 70 300 H 220";
    msg = "ADA West Drop-off features immediate level pathways straight into Gate A wheelchair lanes.";
  }

  if (dAttr && dynamicPath) {
    dynamicPath.setAttribute('d', dAttr);
    dynamicPath.classList.remove('hidden');
    appendChatLog('🤖 Concierge Wayfinder', msg, 'assistant');
  }
}

function resetMapHighlights() {
  document.getElementById('dynamic-nav-path').classList.add('hidden');
  document.querySelectorAll('.map-sector').forEach(sec => sec.classList.remove('highlighted'));
}

// Map layer overlays controller
function setMapLayer(layer) {
  const mapSvg = document.getElementById('stadium-svg');
  
  // Reset active button tags
  document.getElementById('map-mode-normal').classList.remove('active');
  document.getElementById('map-mode-access').classList.remove('active');
  document.getElementById('map-mode-crowd').classList.remove('active');
  
  // Set correct active view
  if (layer === 'normal') {
    document.getElementById('map-mode-normal').classList.add('active');
    mapSvg.className.baseVal = 'stadium-map';
  } else if (layer === 'access') {
    document.getElementById('map-mode-access').classList.add('active');
    mapSvg.className.baseVal = 'stadium-map show-ada';
  } else if (layer === 'crowd') {
    document.getElementById('map-mode-crowd').classList.add('active');
    mapSvg.className.baseVal = 'stadium-map show-crowd';
  }
}

// -------------------------------------------------------------
// ECOPASS SUSTAINABILITY SCANNER
// -------------------------------------------------------------

function triggerScan(item) {
  const viewfinder = document.getElementById('scanner-viewfinder');
  const idleState = document.getElementById('scan-idle');
  const loadingState = document.getElementById('scan-loading');
  const resultState = document.getElementById('scan-result');
  
  // Reset views
  idleState.classList.add('hidden');
  resultState.classList.add('hidden');
  loadingState.classList.remove('hidden');
  
  // Trigger laser scan line
  viewfinder.classList.add('scanning');

  setTimeout(() => {
    // Scanning complete
    viewfinder.classList.remove('scanning');
    loadingState.classList.add('hidden');
    resultState.classList.remove('hidden');
    
    let itemName = '';
    let pointsAwarded = 0;
    
    if (item === 'plastic') {
      itemName = 'PET Recyclable Bottle';
      pointsAwarded = 50;
    } else if (item === 'can') {
      itemName = 'Aluminum Can';
      pointsAwarded = 50;
    } else if (item === 'transit') {
      itemName = 'NJ Transit Train Ticket';
      pointsAwarded = 100;
    }
    
    document.getElementById('scan-result-title').innerText = itemName;
    document.getElementById('scan-result-points').innerText = `+${pointsAwarded} Green Points`;
    
    // Accumulate points
    addEcoPoints(pointsAwarded);
    
    // Notify chatbot logs
    appendChatLog('🌱 EcoPass Agent', `Successfully scanned **${itemName}**! Awarded **${pointsAwarded} Green Points** to your EcoPass. Keep up the green work! 🌍`, 'assistant');
    
    // Reset view to idle after 3.5s
    setTimeout(() => {
      if (resultState.classList.contains('hidden')) return; // Avoid reset if another click happens
      resultState.classList.add('hidden');
      idleState.classList.remove('hidden');
    }, 3500);

  }, 1800);
}

function addEcoPoints(pts) {
  ecoPoints += pts;
  document.getElementById('eco-points').innerText = ecoPoints;
  
  // Update progress bar towards next coupon
  const progressPercent = Math.min((ecoPoints % 100), 100);
  const progressBar = document.getElementById('eco-progress');
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }
  
  // Check coupon thresholds
  evaluateRewards();
}

function evaluateRewards() {
  const rewardsList = document.getElementById('rewards-list');
  const numCoupons = Math.floor(ecoPoints / 100);
  
  if (numCoupons > 0) {
    rewardsList.innerHTML = '';
    for (let i = 1; i <= numCoupons; i++) {
      const uniqueCode = `FIFA-ECO-${2026 + i}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const coupon = document.createElement('div');
      coupon.className = 'coupon-card';
      coupon.innerHTML = `
        <div class="coupon-info">
          <strong>20% Off Concessions</strong>
          <span>Valid at all food halls & shops</span>
        </div>
        <div class="coupon-code">${uniqueCode}</div>
      `;
      rewardsList.appendChild(coupon);
    }
  }
}

// -------------------------------------------------------------
// FAN CONCIERGE CHAT LOGIC (GENAI IMPLEMENTATION)
// -------------------------------------------------------------

function quickQuery(queryType) {
  let text = '';
  if (queryType === 'restroom') text = 'Where are the wheelchair accessible restrooms?';
  else if (queryType === 'parking') text = 'How do I get to the Shuttle Parking North Lot?';
  else if (queryType === 'sustainability') text = 'Explain the EcoPass system and discount coupons';
  else if (queryType === 'gate') text = 'Check the wait times for entry gates';
  
  document.getElementById('chat-input').value = text;
  handleChatSubmit(new Event('submit'));
}

async function handleChatSubmit(event) {
  if (event) event.preventDefault();
  
  const inputEl = document.getElementById('chat-input');
  const query = inputEl.value.trim();
  if (!query) return;

  // Render User Message
  appendChatLog('You', query, 'user');
  inputEl.value = '';

  // Render Bot Loading Bubble
  const botBubble = appendChatLog('Concierge AI', getLanguageDB(currentLanguage).answering, 'assistant loading');

  // Request actual Gemini response OR fall back locally
  try {
    let responseText = '';
    if (savedApiKey) {
      try {
        responseText = await callLiveGeminiAPI(query, true);
      } catch (apiError) {
        console.warn("Gemini API error, falling back to local database:", apiError);
        responseText = getMockChatbotResponse(query) + "\n\n*(Offline Fallback Mode due to API error)*";
      }
    } else {
      responseText = getMockChatbotResponse(query);
    }
    
    // Replace typing loading bubble with response text
    botBubble.querySelector('.message-content').innerHTML = parseMarkdown(responseText);
    botBubble.classList.remove('loading');
  } catch (error) {
    console.error(error);
    botBubble.querySelector('.message-content').innerHTML = parseMarkdown(getMockChatbotResponse(query) + "\n\n*(Offline Fallback Mode due to system error)*");
    botBubble.classList.remove('loading');
  }
}

function appendChatLog(sender, text, type) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = `message ${type}`;
  
  const avatarText = type.includes('user') ? '👤' : '🤖';
  
  bubble.innerHTML = `
    <div class="avatar">${avatarText}</div>
    <div class="message-content">
      <p>${text}</p>
    </div>
  `;
  
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

// Parse markdown locally for simple styling
function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/♿/g, '<span style="color: #10b981;">♿</span>')
    .replace(/🌱/g, '<span style="color: #10b981;">🌱</span>')
    .replace(/\n/g, '<br>');
}

// Local mock parser
function getMockChatbotResponse(query) {
  const cleanQuery = query.toLowerCase();
  const db = getLanguageDB(currentLanguage);
  
  for (const item of db.keywords) {
    if (item.keys.some(key => cleanQuery.includes(key))) {
      if (typeof item.response === 'function') {
        return item.response();
      }
      return item.response;
    }
  }
  return db.unknown;
}

// -------------------------------------------------------------
// LIVE GEMINI API CONNECTOR
// -------------------------------------------------------------

async function callLiveGeminiAPI(promptText, isChatbot = true) {
  const systemInstruction = isChatbot 
    ? `You are the official Multilingual AI Concierge for the FIFA World Cup 2026 stadium (MetLife Stadium/NYNJ). 
       Provide helpful, clear navigation, seating, transit, accessibility, and concession details.
       Keep responses brief, structured, and friendly. Current gate queues: Gate A (${gateWaitTimes.a} mins), Gate B (${gateWaitTimes.b} mins), Gate C (${gateWaitTimes.c} mins), Gate D (${gateWaitTimes.d} mins).
       Respond in the language of the user's query.`
    : `You are the ArenaOps Decision Support Copilot for FIFA World Cup 2026 venue operations. 
       Generate detailed standard operating procedures (SOPs), safety/medical incident action checklists, crowd re-routing recommendations, and draft announcement texts in both English and Spanish. 
       Format using clear sections: Action Plan, Crowd Re-routing, and Public Broadcast Alerts.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${savedApiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: `${systemInstruction}\n\nUser Query: ${promptText}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 800
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API Error: Status ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    }
    
    throw new Error("Invalid format returned by Gemini API");
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// -------------------------------------------------------------
// OPERATIONAL SIMULATOR (SLIDERS & ALERTS)
// -------------------------------------------------------------

function updateGateSimulation(gate) {
  const slider = document.getElementById(`slider-gate-${gate}`);
  const val = slider.value;
  
  gateWaitTimes[gate] = parseInt(val);
  document.getElementById(`val-gate-${gate}-wait`).innerText = `${val}m`;
  
  // Update badge UI
  const badge = document.getElementById(`ctrl-gate-${gate}-status`);
  const mapDot = document.getElementById(`gate-${gate}-status`);
  
  badge.className = 'badge';
  
  if (val <= 10) {
    badge.innerText = 'NORMAL';
    badge.classList.add('status-green');
    if (mapDot) { mapDot.className.baseVal = 'congestion-indicator status-green'; }
  } else if (val <= 20) {
    badge.innerText = 'MODERATE';
    badge.classList.add('status-orange');
    if (mapDot) { mapDot.className.baseVal = 'congestion-indicator status-orange'; }
  } else {
    badge.innerText = 'CRITICAL';
    badge.classList.add('status-red');
    if (mapDot) { mapDot.className.baseVal = 'congestion-indicator status-red'; }
  }
  
  recalculateOpsStats();
}

function recalculateOpsStats() {
  // Wait times summary
  const avg = Math.round((gateWaitTimes.a + gateWaitTimes.b + gateWaitTimes.c + gateWaitTimes.d) / 4);
  document.getElementById('stat-avg-wait').innerText = `${avg}m`;
  
  const deltaTag = document.getElementById('stat-wait-delta');
  
  // Find highest queue
  let highest = 'a';
  for (let g in gateWaitTimes) {
    if (gateWaitTimes[g] > gateWaitTimes[highest]) {
      highest = g;
    }
  }
  
  if (gateWaitTimes[highest] > 20) {
    deltaTag.innerText = `Gate ${highest.toUpperCase()} Bottleneck`;
    deltaTag.className = 'stat-delta warning';
  } else {
    deltaTag.innerText = 'Optimal flow';
    deltaTag.className = 'stat-delta positive';
  }
}

// Trigger simulated incidents
function triggerAlertSimulation(alertType) {
  if (alertType === 'concession') {
    document.getElementById('copilot-input').value = "Concession stands near Section 300 reporting severe queues. Suggest mitigation and customer redirection.";
    switchView('ops');
  } else if (alertType === 'transit') {
    document.getElementById('copilot-input').value = "NJ Transit station reporting power line fault. 20-minute passenger boarding delay expected. Compile crowd holds.";
    switchView('ops');
  } else if (alertType === 'weather') {
    document.getElementById('copilot-input').value = "Lightning strike observed 3 miles north. Safety officer calls for stadium concourse seek shelter alert.";
    switchView('ops');
  }
  
  handleCopilotSubmit(new Event('submit'));
}

function resetAllSimulations() {
  document.getElementById('slider-gate-a').value = 5;
  document.getElementById('slider-gate-b').value = 12;
  document.getElementById('slider-gate-c').value = 25;
  document.getElementById('slider-gate-d').value = 8;
  
  updateGateSimulation('a');
  updateGateSimulation('b');
  updateGateSimulation('c');
  updateGateSimulation('d');
  
  clearCopilot();
  
  // Reset logs
  document.getElementById('incident-log-items').innerHTML = `
    <div class="incident-item severity-medium" id="incident-1">
      <div class="ii-header">
        <span class="ii-type">🧑‍⚕️ Medical Emergency</span>
        <span class="ii-time">21:28</span>
      </div>
      <p class="ii-details">Section 104, Fan feeling faint. First aid squad dispatched.</p>
      <div class="ii-footer">
        <span class="ii-loc">📌 Section 104</span>
        <button class="ii-action-btn" onclick="generateIncidentReport('Medical', 'Section 104', 'Medium', 'Fan feeling faint. First aid squad dispatched.')">Draft Report</button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// DECISION SUPPORT COPILOT & INCIDENT LOGGER
// -------------------------------------------------------------

function runCopilotScenario(scenario) {
  let prompt = '';
  if (scenario === 'bottleneck') prompt = "Gate C queues are at 25 minutes. NJ Transit train just unloaded 4,000 fans at Gate C. Outline a re-routing plan to Gate D.";
  else if (scenario === 'medical') prompt = "Medical emergency at Section 104. Fan with chest discomfort. Dispatched medical cart is blocked by crowd congestion. Outline evacuation pathway.";
  else if (scenario === 'storm') prompt = "Lightning warning issued for East Rutherford. Lightning strike detected 3 miles out. Outline stadium evacuation SOP and PA announcement.";
  else if (scenario === 'lost') prompt = "Lost 6-year-old child reported near Gate A wearing yellow jersey. Gate supervisor requests security sweep procedures.";
  
  document.getElementById('copilot-input').value = prompt;
  handleCopilotSubmit(new Event('submit'));
}

function clearCopilot() {
  document.getElementById('copilot-input').value = '';
  document.getElementById('copilot-output-wrapper').classList.add('hidden');
}

async function handleCopilotSubmit(event) {
  if (event) event.preventDefault();
  
  const inputEl = document.getElementById('copilot-input');
  const prompt = inputEl.value.trim();
  if (!prompt) return;
  
  const wrapper = document.getElementById('copilot-output-wrapper');
  const outputText = document.getElementById('copilot-output-text');
  
  // Open wrapper show loading
  wrapper.classList.remove('hidden');
  outputText.innerHTML = '<div class="spinner"></div><p style="margin-top:0.5rem">Generating custom playbook via GenAI...</p>';

  try {
    let playbookText = '';
    if (savedApiKey) {
      try {
        playbookText = await callLiveGeminiAPI(prompt, false);
        outputText.innerHTML = parseMarkdown(playbookText);
      } catch (apiError) {
        console.warn("Gemini API Copilot error, falling back to local database:", apiError);
        playbookText = getLocalMockPlaybook(prompt) + "<p style='font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;'>*(Offline Fallback Mode due to API error)*</p>";
        outputText.innerHTML = playbookText;
      }
    } else {
      playbookText = getLocalMockPlaybook(prompt);
      outputText.innerHTML = playbookText;
    }
  } catch (error) {
    console.error(error);
    outputText.innerHTML = getLocalMockPlaybook(prompt) + "<p style='font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;'>*(Offline Fallback Mode due to system error)*</p>";
  }
}

function getLocalMockPlaybook(prompt) {
  const query = prompt.toLowerCase();
  
  if (query.includes('bottleneck') || query.includes('gate c')) {
    return `
      <div class="playbook-section">
        <strong>⚠️ SOP Checklist: Gate C Congestion</strong>
        <ul class="playbook-list">
          <li>Deploy dynamic digital signage boards to route incoming fans away from Gate C.</li>
          <li>Instruct plaza staff at MetLife station to direct pedestrian flow south towards Gate D.</li>
          <li>Open additional metal screening lanes at Gate D to accommodate shifted crowds.</li>
        </ul>
      </div>
      <div class="playbook-section">
        <strong>🗺️ Crowd Re-routing Plan</strong>
        <p>Direct the 3,000 fans arriving at transit terminal via path <em>Train Station -> South Ramp -> Gate D</em>. Highlights updated on Fan Map.</p>
      </div>
      <div class="playbook-section">
        <strong>📢 Public Broadcast Alert (Bilingual)</strong>
        <p class="playbook-broadcast">"ATTENTION FANS: Gate C is currently experiencing high wait times. Please proceed to Gate D (South Entry) for faster access. Clear paths are highlighted on your mobile app."</p>
        <p class="playbook-broadcast">"ATENCIÓN FANÁTICOS: La Puerta C registra largas esperas. Proceda a la Puerta D (Entrada Sur) para un ingreso rápido. Rutas marcadas en su aplicación móvil."</p>
      </div>
    `;
  } else if (query.includes('medical') || query.includes('chest')) {
    return `
      <div class="playbook-section">
        <strong>🚨 SOP Checklist: Section 104 Cardiac Event</strong>
        <ul class="playbook-list">
          <li>Dispatch Medical Cart 2 via the ground pitch ring wall access rather than outer concourse.</li>
          <li>Mobilize local AED supervisor stationed at Section 106.</li>
          <li>Instruct security marshals to construct a privacy cordon around Section 104 Row M.</li>
        </ul>
      </div>
      <div class="playbook-section">
        <strong>🗺️ Emergency Vehicle Routing</strong>
        <p>Route paramedic transport through West Tunnel Gate A to Section 104 tunnel exit. Clear of pedestrian queues.</p>
      </div>
      <div class="playbook-section">
        <strong>📢 Public Broadcast Alert</strong>
        <p class="playbook-broadcast">No public alert recommended. Direct staff radio channel 4 check-in.</p>
      </div>
    `;
  } else if (query.includes('lightning') || query.includes('storm') || query.includes('weather')) {
    return `
      <div class="playbook-section">
        <strong>⛈️ SOP Checklist: Extreme Weather Seek Shelter</strong>
        <ul class="playbook-list">
          <li>Halt field operations and recall ball-kids, teams, and field marshals.</li>
          <li>Open internal concourse access zones to absorb seating bowl evacuation.</li>
          <li>Cease ticket scanning gates; clear all outer plazas and move fans inside.</li>
        </ul>
      </div>
      <div class="playbook-section">
        <strong>📢 Public Broadcast Alert</strong>
        <p class="playbook-broadcast">"WEATHER ALERT: Lightning has been detected nearby. For your safety, please exit the seating bowl and seek shelter immediately inside the covered stadium concourse."</p>
        <p class="playbook-broadcast">"ALERTA CLIMÁTICA: Rayos detectados. Por su seguridad, por favor evacúe el tazón de asientos y busque refugio inmediato en los pasillos cubiertos del estadio."</p>
      </div>
    `;
  } else if (query.includes('lost') || query.includes('child')) {
    return `
      <div class="playbook-section">
        <strong>👧 SOP Checklist: Code Yellow (Lost Child)</strong>
        <ul class="playbook-list">
          <li>Deploy perimeter sweep checks at Gates A and B. Hold children exiting without guardians.</li>
          <li>Broadcast profile description on internal staff radio network (Age 6, yellow jersey).</li>
          <li>Direct parents to Guest Services Headquarters at Section 124.</li>
        </ul>
      </div>
      <div class="playbook-section">
        <strong>📢 Broadcast Announcement</strong>
        <p class="playbook-broadcast">Do not trigger public PA announcements immediately to prevent panic. Rely on staffed search grids.</p>
      </div>
    `;
  }
  
  // Custom fallback playbook
  return `
    <div class="playbook-section">
      <strong>📋 SOP Action Plan: Custom Incident</strong>
      <p>Analyze query: "${prompt}". Incident logged under operations desk.</p>
      <ul class="playbook-list">
        <li>Dispatch stadium supervisor to designated sector or gate.</li>
        <li>Review active security camera feeds of local area.</li>
        <li>Coordinate with safety controllers for crowd diversion if queues are compromised.</li>
      </ul>
    </div>
    <div class="playbook-section">
      <strong>📢 Public Broadcast Alert</strong>
      <p class="playbook-broadcast">"STAFF UPDATE: Incident team responding. Please maintain clear access pathways."</p>
    </div>
  `;
}

function copyCopilotOutput() {
  const container = document.getElementById('copilot-output-text');
  navigator.clipboard.writeText(container.innerText);
  alert("Operational Playbook copied to clipboard!");
}

// -------------------------------------------------------------
// INCIDENT LOGGING & EMAILS
// -------------------------------------------------------------

let incidentCount = 1;

function submitIncident(event) {
  event.preventDefault();
  
  const type = document.getElementById('inc-type').value;
  const loc = document.getElementById('inc-loc').value.trim();
  const severity = document.getElementById('inc-severity').value;
  const notes = document.getElementById('inc-notes').value.trim();
  
  incidentCount++;
  
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const logContainer = document.getElementById('incident-log-items');
  const item = document.createElement('div');
  item.className = `incident-item severity-${severity.toLowerCase()}`;
  item.id = `incident-${incidentCount}`;
  
  let emoji = '⚠️';
  if (type === 'Medical') emoji = '🧑‍⚕️';
  else if (type === 'Security') emoji = '👮';
  else if (type === 'Facilities') emoji = '🔧';
  else if (type === 'Crowd') emoji = '👥';

  item.innerHTML = `
    <div class="ii-header">
      <span class="ii-type">${emoji} ${type} Incident</span>
      <span class="ii-time">${timeStr}</span>
    </div>
    <p class="ii-details">${notes}</p>
    <div class="ii-footer">
      <span class="ii-loc">📌 ${loc}</span>
      <button class="ii-action-btn" onclick="generateIncidentReport('${type}', '${loc}', '${severity}', '${notes.replace(/'/g, "\\'")}')">Draft Report</button>
    </div>
  `;
  
  // Prepend
  logContainer.insertBefore(item, logContainer.firstChild);
  
  // Clear notes input
  document.getElementById('inc-notes').value = '';
  document.getElementById('inc-loc').value = '';

  // Scroll to top of logs
  logContainer.scrollTop = 0;
}

function toggleReportModal() {
  document.getElementById('report-modal').classList.toggle('hidden');
}

// GenAI Incident report email compiler
async function generateIncidentReport(type, loc, severity, notes) {
  const subjectEl = document.getElementById('report-email-subject');
  const bodyEl = document.getElementById('report-email-body');
  
  const now = new Date();
  const timestamp = now.toLocaleString();
  
  subjectEl.value = `[FIFA 2026 ALERT - ${severity.toUpperCase()}] Operational Incident Reported: ${type} at ${loc}`;
  
  const basePrompt = `Generate a professional administrative incident summary email for stadium directors. 
                      Incident Details:
                      - Type: ${type}
                      - Location: ${loc}
                      - Severity: ${severity}
                      - Timestamp: ${timestamp}
                      - Observer Notes: ${notes}`;

  toggleReportModal();
  bodyEl.value = "Drafting executive summary via GenAI engine...";

  const getMockReport = () => `TO: Stadium Executive Committee (Operations & Security)
FROM: SmartStadium Command Center System
DATE: ${timestamp}
SUBJECT: ${subjectEl.value}

Dear Operations Directors,

This is a formal operational incident alert regarding an event tracked at ${loc}. 

INCIDENT SUMMARY:
-----------------
* TYPE: ${type} Incident
* SEVERITY STATUS: ${severity.toUpperCase()} Priority
* REPORTED LOCATION: ${loc}
* TIMESTAMP: ${timestamp}

DESCRIPTION AND OBSERVATIONS:
"${notes}"

IMMEDIATE CORRECTION ACTIONS COMPLETED:
1. Security/First-Aid dispatch coordinators notified instantly.
2. Local sector stewards instructed to keep pedestrian routes clear.
3. Heatmap variables adjusted on Fan Mobile Concierge.

A formal post-match operations review will log this event automatically. Please contact Command Center Desk 1 for real-time video surveillance feeds if required.

Sincerely,
FIFA ArenaOps Automated Reporting System
MetLife Stadium Operations Center`;

  try {
    let reportBody = '';
    if (savedApiKey) {
      try {
        reportBody = await callLiveGeminiAPI(basePrompt, false);
        bodyEl.value = reportBody;
      } catch (apiError) {
        console.warn("Gemini API Report error, falling back:", apiError);
        bodyEl.value = getMockReport() + "\n\n*(Offline Fallback Mode due to API error)*";
      }
    } else {
      bodyEl.value = getMockReport();
    }
  } catch (error) {
    console.error(error);
    bodyEl.value = getMockReport() + "\n\n*(Offline Fallback Mode due to system error)*";
  }
}

function copyReportEmail() {
  const body = document.getElementById('report-email-body').value;
  navigator.clipboard.writeText(body);
  alert("Incident email report copied to clipboard!");
  toggleReportModal();
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
window.onload = function() {
  // Restore API status label on initial load
  if (savedApiKey) {
    const statusTag = document.getElementById('api-status-tag');
    statusTag.classList.remove('offline');
    statusTag.classList.add('online');
    statusTag.querySelector('.status-label').innerText = 'Live Gemini ' + (selectedModel.includes('flash') ? 'Flash' : 'Pro');
    
    const copilotModeLbl = document.getElementById('copilot-mode-lbl');
    if (copilotModeLbl) copilotModeLbl.innerText = 'Connected: ' + selectedModel;
  }
  
  // Setup initial sliders values
  updateGateSimulation('a');
  updateGateSimulation('b');
  updateGateSimulation('c');
  updateGateSimulation('d');
};
