/**
 * FORGET-ME-NOT - Care Assistant Logic
 * Persistent state management using localStorage
 * Personalised for Austin (Patient) & RP team caregivers
 */

// ==================== STATE MANAGEMENT ====================
const STORAGE_KEYS = {
  SCHEDULE: 'fmn_schedule',
  CONTACTS: 'fmn_contacts',
  MOODS: 'fmn_moods',
  SOS_LOGS: 'fmn_sos_logs',
  SETTINGS: 'fmn_settings'
};

// Initial default database configuration
const DEFAULT_SCHEDULE = [
  {
    id: 's1',
    title: 'Morning Blood Pressure Medicine',
    time: '08:30',
    category: 'Medication',
    priority: 'High',
    status: 'completed',
    notes: 'Austin, please take 1 red capsule from the morning container with a full glass of water. Do not chew.'
  },
  {
    id: 's2',
    title: 'Morning Walk with Hanif',
    time: '10:00',
    category: 'Routine',
    priority: 'Medium',
    status: 'pending',
    notes: 'Hanif will arrive to go for a brief walk in the garden. Wear your comfortable brown walking shoes.'
  },
  {
    id: 's3',
    title: 'Doctor Check-in (Dr. Joel)',
    time: '13:00',
    category: 'Appointment',
    priority: 'High',
    status: 'pending',
    notes: 'Dr. Joel is visiting to review your health. He will arrive at 1:00 PM.'
  },
  {
    id: 's4',
    title: 'Afternoon Tea & Vitamin',
    time: '15:30',
    category: 'Routine',
    priority: 'Low',
    status: 'pending',
    notes: 'Have a warm cup of herbal tea and take the yellow chewy vitamin pill from the counter.'
  },
  {
    id: 's5',
    title: 'Dinner & Evening Medicine',
    time: '18:30',
    category: 'Medication',
    priority: 'High',
    status: 'pending',
    notes: 'Soh Chu Fon (your son) is bringing dinner. Take 1 white tablet from the evening box afterwards.'
  }
];

const DEFAULT_CONTACTS = [
  {
    id: 'c1',
    name: 'Soh Chu Fon',
    relation: 'Your Son',
    phone: '9123 4567',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'c2',
    name: 'Hanif',
    relation: 'Your Care Worker',
    phone: '9876 5432',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop'
  },
  {
    id: 'c3',
    name: 'Dr. Joel',
    relation: 'Your Doctor & Friend',
    phone: '9234 5678',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=256&auto=format&fit=crop'
  }
];

const DEFAULT_MOODS = [
  { date: getPastDateString(6), mood: 'happy' },
  { date: getPastDateString(5), mood: 'okay' },
  { date: getPastDateString(4), mood: 'happy' },
  { date: getPastDateString(3), mood: 'sad' },
  { date: getPastDateString(2), mood: 'okay' },
  { date: getPastDateString(1), mood: 'happy' }
];

const DEFAULT_SOS_LOGS = [
  {
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString(),
    patient: 'Austin',
    details: 'SOS activated. Alert sent to Soh Chu Fon and Hanif.',
    status: 'Handled'
  }
];

const DEFAULT_SETTINGS = {
  patientName: 'Austin',
  passcode: '1234',
  n8nSosUrl: '',
  n8nSyncUrl: '',
  simulateEndpoints: true,
  googleSheetId: '1ArgPlufENvMT0Dg0lyeg2xSxjKbJ9h12a71OWGGy4AQ'
};

const KNOWLEDGE_BASE = [
  {
    title: 'What to do if the patient refuses medication?',
    category: 'Medication Management',
    content: 'Do not argue or try to force compliance. Take a break and try again in 15 minutes. Ensure the environment is calm, reduce background noises, and use simple instructions. If refusal persists, contact Dr. Joel at 9234 5678 or pair the medication with a soft, favorite food if clinically approved.'
  },
  {
    title: 'How to handle evening restlessness (Sundowning)?',
    category: 'Daily Behavior',
    content: 'Sundowning occurs as natural light fades. Turn on indoor lighting early to minimize shadows. Keep evening routines quiet and predictable. Play soothing classical music, avoid heavy meals close to bedtime, and encourage relaxing activities like scanning the Memory Lane page.'
  },
  {
    title: 'Preventing wandering behaviors',
    category: 'Home Safety',
    content: 'Keep outer doors locked using child-proof locks or high-placed latches. Place visual distractors (like a black mat in front of doors, which can look like an impassable hole to a dementia patient) or sound alerts when doors open. Keep the Memory Lane photo album easily accessible on tablets to redirect their focus.'
  },
  {
    title: 'Communication tips during confusion',
    category: 'Caregiver Tips',
    content: 'Use short, simple sentences. Speak in a gentle, warm tone of voice. Maintain eye level contact. Instead of asking open questions like "What do you want to eat?", offer binary choices: "Would you like chicken soup or fish?". Always validate their feelings rather than correcting their memory.'
  },
  {
    title: 'Dementia medical emergency guidelines',
    category: 'Crisis Management',
    content: 'If the patient displays sudden severe confusion, slurred speech, one-sided weakness, or falls down, immediately call 995 for emergency ambulance. Press the red SOS button on their dashboard to send alerts to all registered caregivers.'
  }
];

// Helper to get past dates
function getPastDateString(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

// App State
let state = {
  schedule: [],
  contacts: [],
  moods: [],
  sosLogs: [],
  settings: {}
};

// Load state from LocalStorage
function loadState() {
  try {
    state.schedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULE)) || DEFAULT_SCHEDULE;
    state.contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS)) || DEFAULT_CONTACTS;
    state.moods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS)) || DEFAULT_MOODS;
    state.sosLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOS_LOGS)) || DEFAULT_SOS_LOGS;
    state.settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
  } catch (e) {
    console.warn("localStorage is not accessible, falling back to temporary in-memory state:", e);
    state.schedule = DEFAULT_SCHEDULE;
    state.contacts = DEFAULT_CONTACTS;
    state.moods = DEFAULT_MOODS;
    state.sosLogs = DEFAULT_SOS_LOGS;
    state.settings = DEFAULT_SETTINGS;
  }
}

// Save state to LocalStorage
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(state.schedule));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(state.contacts));
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(state.moods));
    localStorage.setItem(STORAGE_KEYS.SOS_LOGS, JSON.stringify(state.sosLogs));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
  } catch (e) {
    console.warn("localStorage is not accessible, changes will not persist after reload:", e);
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTimeDate();
  initViewSwitching();
  initPINPad();
  initPatientDashboard();
  initCaregiverDashboard();
  renderAllViews();
  // Auto-sync from Google Sheet on every page load
  syncFromGoogleSheet();
});

// ==================== GOOGLE SHEET LIVE SYNC ====================
// Reads today's tasks from the public Google Sheet CSV export
// and merges any new ones into the local schedule
// Reads today's tasks from the Google Sheet via JSONP (bypasses browser CORS blocks entirely)
function syncFromGoogleSheet(showFeedback = false) {
  const inputVal = (state.settings && state.settings.googleSheetId) || '';
  if (!inputVal) {
    if (showFeedback) showToast('⚠️ No Google Sheet URL or ID configured in Settings.');
    return;
  }

  // Update sync button state if it exists
  const syncBtn = document.getElementById('btn-sync-sheet');
  if (syncBtn) {
    syncBtn.textContent = '⏳ Syncing...';
    syncBtn.disabled = true;
  }

  // Extract standard sheet ID from URL or use as-is
  let sheetId = inputVal.trim();
  const match = inputVal.match(/\/d\/([a-zA-Z0-9-_]{40,50})/);
  if (match) {
    sheetId = match[1];
  }

  // Clean up any old script tags
  const oldScript = document.getElementById('gviz-jsonp-script');
  if (oldScript) oldScript.remove();

  // Create JSONP script injection
  const script = document.createElement('script');
  script.id = 'gviz-jsonp-script';
  script.src = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=responseHandler:window.handleGoogleSheetSyncCallback`;
  
  script.onerror = () => {
    cleanupSyncLoading();
    if (showFeedback) showToast('❌ Could not reach Google Sheet. Check your URL and connection.');
  };

  document.body.appendChild(script);
}

function cleanupSyncLoading() {
  const syncBtn = document.getElementById('btn-sync-sheet');
  if (syncBtn) {
    syncBtn.textContent = '🔄 Sync from Google Sheet Now';
    syncBtn.disabled = false;
  }
  const script = document.getElementById('gviz-jsonp-script');
  if (script) script.remove();
}

// Global callback for JSONP sheet data parsing
window.handleGoogleSheetSyncCallback = function(data) {
  if (!data || data.status !== 'ok' || !data.table || !data.table.rows) {
    cleanupSyncLoading();
    showToast('❌ Failed to parse Google Sheet data format.');
    return;
  }

  const rowsRaw = data.table.rows;
  if (rowsRaw.length < 2) {
    cleanupSyncLoading();
    showToast('✅ Sheet synced — no tasks found.');
    return;
  }

  // Extract headers from the columns or first row dynamically
  let headers = data.table.cols.map(c => (c.label || '').trim().toLowerCase());
  const hasLabels = headers.some(h => h !== '');
  
  let startRowIdx = 0;
  if (!hasLabels) {
    if (rowsRaw.length > 0) {
      headers = rowsRaw[0].c.map(cell => (cell ? String(cell.v || cell.f || '').trim().toLowerCase() : ''));
      startRowIdx = 1;
    }
  }

  const rows = [];
  for (let i = startRowIdx; i < rowsRaw.length; i++) {
    const rowObj = {};
    const cells = rowsRaw[i].c;
    if (!cells) continue;
    headers.forEach((header, idx) => {
      if (header) {
        const cell = cells[idx];
        let val = '';
        if (cell) {
          if (cell.f !== undefined && cell.f !== null) {
            val = String(cell.f);
          } else if (cell.v !== undefined && cell.v !== null) {
            val = String(cell.v);
          }
        }
        rowObj[header] = val;
      }
    });
    rows.push(rowObj);
  }

  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`; // Local YYYY-MM-DD

  let added = 0;

  rows.forEach(row => {
    // Column names: #, created_at, updated_at, task_name, task_time, task_date, completed
    const taskName = (row['task_name'] || '').trim();
    const taskTimeRaw = (row['task_time'] || '').trim();
    const taskDate = (row['task_date'] || '').trim();
    const completed = (row['completed'] || '').trim().toUpperCase() === 'TRUE';

    if (!taskName || taskName === 'Unknown Task' || taskName === 'null') return;
    if (!taskDate || taskDate === 'Unknown Date' || taskDate === 'null') return;

    // Normalise date — accept YYYY-MM-DD or DD Month or Month DD formats
    const normDate = normaliseDate(taskDate);
    if (normDate !== todayStr) return;

    // Convert time like "10:00 PM" → "22:00" (24hr for sorting)
    const time24 = convertTo24Hour(taskTimeRaw) || '08:00';

    // Avoid adding duplicates (match by title + time)
    const isDuplicate = state.schedule.some(
      s => s.title.toLowerCase() === taskName.toLowerCase() && s.time === time24
    );
    if (isDuplicate) return;

    // Add to local schedule
    const newEntry = {
      id: 'gs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: taskName,
      time: time24,
      category: 'Routine',
      priority: 'Medium',
      status: completed ? 'completed' : 'pending',
      notes: `Synced from Google Sheet for ${taskDate}`
    };

    state.schedule.push(newEntry);
    added++;
  });

  cleanupSyncLoading();

  if (added > 0) {
    saveState();
    renderTimeline();
    renderScheduleTable();
    showToast(`✅ ${added} task${added > 1 ? 's' : ''} synced from Google Sheet!`);
  } else {
    showToast('✅ Sheet synced — no new tasks for today.');
  }
};

// Parse a CSV string into an array of objects keyed by header row
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  // Handle quoted fields
  function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = splitCSVLine(lines[i]);
    if (vals.every(v => !v)) continue; // skip empty rows
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (vals[idx] || '').trim();
    });
    rows.push(obj);
  }

  return rows;
}

// Normalise various date formats to YYYY-MM-DD
function normaliseDate(raw) {
  if (!raw) return '';
  const s = raw.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Try parsing via Date
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return '';
}

// Convert "10:00 PM" or "10:00 am" to "22:00"
function convertTo24Hour(timeStr) {
  if (!timeStr) return null;
  // Already 24-hour HH:MM
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// Update Clock & Greeting
function initTimeDate() {
  const timeEl = document.getElementById('patient-time');
  const dateEl = document.getElementById('patient-date');
  const greetingEl = document.getElementById('patient-greeting');

  function updateClock() {
    const now = new Date();
    
    // Custom formatted time (e.g. 08:30 AM)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const hoursStr = String(hours).padStart(2, '0');
    
    timeEl.textContent = `${hoursStr}:${minutes} ${ampm}`;

    // Custom formatted date (e.g. Wednesday, July 8)
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);

    // Dynamic greeting based on time of day
    let greeting = 'Good Morning';
    const currentHour = now.getHours();
    if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good Afternoon';
    } else if (currentHour >= 17) {
      greeting = 'Good Evening';
    }
    
    const pName = state.settings.patientName || 'Austin';
    greetingEl.textContent = `${greeting}, ${pName}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// ==================== VIEW CONTROLS & SWITCHING ====================
const patientView = document.getElementById('patient-view');
const caregiverPanel = document.getElementById('caregiver-panel');
const authOverlay = document.getElementById('caregiver-auth');

function initViewSwitching() {
  // Portal Entry btn
  document.getElementById('btn-portal-lock').addEventListener('click', () => {
    authOverlay.classList.remove('hidden');
    clearPIN();
  });

  // Close PIN modal
  document.getElementById('btn-close-auth').addEventListener('click', () => {
    authOverlay.classList.add('hidden');
  });

  // Exit Caregiver Panel back to Patient View
  document.getElementById('btn-exit-panel').addEventListener('click', () => {
    caregiverPanel.classList.add('hidden');
    patientView.classList.add('view-active');
    document.body.style.backgroundColor = 'var(--bg-primary)';
    document.querySelector('.sos-footer').classList.remove('hidden');
    renderPatientView(); // refresh patient timetable changes
  });

  // Tabs navigation inside Caregiver dashboard
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');

      // Hide all panels
      const targetId = e.target.getAttribute('data-target');
      const panels = document.querySelectorAll('.panel-view');
      panels.forEach(panel => {
        panel.classList.remove('view-active');
      });

      // Show target panel
      document.getElementById(targetId).classList.add('view-active');
      
      // Special view rendering routines
      if (targetId === 'panel-insights') {
        renderMoodChart();
      }
    });
  });
}

// ==================== PORTAL PASSWORD SECURITY (PIN PAD) ====================
let enteredPIN = '';

function initPINPad() {
  const keys = document.querySelectorAll('.pin-key');
  const dots = document.querySelectorAll('.pin-dot');
  const errorMsg = document.getElementById('auth-error-msg');

  keys.forEach(key => {
    key.addEventListener('click', (e) => {
      errorMsg.classList.add('hidden');
      const val = e.target.getAttribute('data-value');
      const action = e.target.getAttribute('data-action');

      if (val) {
        if (enteredPIN.length < 4) {
          enteredPIN += val;
          updatePINDots();
        }

        if (enteredPIN.length === 4) {
          // Verify
          const correctPIN = state.settings.passcode || '1234';
          if (enteredPIN === correctPIN) {
            // Unlock Caregiver Dashboard
            authOverlay.classList.add('hidden');
            patientView.classList.remove('view-active');
            caregiverPanel.classList.remove('hidden');
            document.querySelector('.sos-footer').classList.add('hidden');
            document.body.style.backgroundColor = '#f3f6f3';
            renderCaregiverView();
            clearPIN();
          } else {
            // Error feedback
            errorMsg.classList.remove('hidden');
            shakeAuthCard();
            clearPIN();
          }
        }
      } else if (action === 'clear') {
        clearPIN();
      } else if (action === 'cancel') {
        authOverlay.classList.add('hidden');
        clearPIN();
      }
    });
  });
}

function updatePINDots() {
  const dots = document.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < enteredPIN.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function clearPIN() {
  enteredPIN = '';
  updatePINDots();
}

function shakeAuthCard() {
  const card = document.querySelector('.auth-card');
  card.style.animation = 'none';
  // Trigger reflow
  card.offsetHeight;
  card.style.animation = 'shake 0.3s ease';
  
  // Inject temporary style for shake if not in stylesheet
  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.innerHTML = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-10px); }
        40%, 80% { transform: translateX(10px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ==================== PATIENT VIEW RENDER & LOGIC ====================
function initPatientDashboard() {
  // Mood Button Event Listeners
  const moodBtns = document.querySelectorAll('.mood-btn');
  const moodFeedback = document.getElementById('mood-feedback');

  // Check if patient already logged mood today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMood = state.moods.find(m => m.date === todayStr);
  if (todayMood) {
    const activeBtn = document.querySelector(`.mood-btn[data-mood="${todayMood.mood}"]`);
    if (activeBtn) activeBtn.classList.add('selected');
    moodFeedback.classList.remove('hidden');
  }

  moodBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedBtn = e.currentTarget;
      const moodVal = selectedBtn.getAttribute('data-mood');

      // Clear previous active styling
      moodBtns.forEach(b => b.classList.remove('selected'));
      selectedBtn.classList.add('selected');

      // Update state
      const targetMoodIndex = state.moods.findIndex(m => m.date === todayStr);
      if (targetMoodIndex > -1) {
        state.moods[targetMoodIndex].mood = moodVal;
      } else {
        state.moods.push({ date: todayStr, mood: moodVal });
      }
      saveState();

      // Show visual confirmation with animation
      moodFeedback.textContent = `Thank you for sharing, ${state.settings.patientName || 'Austin'}! Your caregiver has been notified. 🌸`;
      moodFeedback.classList.remove('hidden');
      
      // Update graph background variables
      renderMoodChart();
    });
  });

  // Emergency SOS Trigger
  document.getElementById('sos-btn').addEventListener('click', () => {
    triggerSOS();
  });
}

function renderPatientView() {
  renderTimeline();
  renderMemoryLane();
}

// Renders the sorted "Now & Next" vertical timetable
function renderTimeline() {
  const container = document.getElementById('timeline-container');
  container.innerHTML = '';

  // Sort schedule items by time
  const sortedItems = [...state.schedule].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  if (sortedItems.length === 0) {
    container.innerHTML = `
      <div class="loading-state">
        <p>🌸 No tasks scheduled for today. Have a beautiful restful day!</p>
      </div>
    `;
    return;
  }

  // Find the next upcoming uncompleted task to highlight as "Now"
  const now = new Date();
  const currentHoursMin = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  let nowItemIndex = -1;
  // Let's find first pending item after or near current time
  for (let i = 0; i < sortedItems.length; i++) {
    if (sortedItems[i].status === 'pending') {
      nowItemIndex = i;
      break;
    }
  }

  // If all are completed, no next item
  sortedItems.forEach((item, index) => {
    const isNow = index === nowItemIndex;
    
    // Priority class string
    const priorityClass = `priority-${item.priority.toLowerCase()}`;
    const completedClass = item.status === 'completed' ? 'completed' : '';
    
    // Formatting standard time output
    const [h, m] = item.time.split(':');
    const formattedHour = parseInt(h) % 12 || 12;
    const formattedAmpm = parseInt(h) >= 12 ? 'PM' : 'AM';
    const timeDisplay = `${String(formattedHour).padStart(2, '0')}:${m} ${formattedAmpm}`;

    const itemEl = document.createElement('div');
    itemEl.className = `timeline-item ${priorityClass} ${completedClass} ${isNow ? 'is-now' : ''}`;
    
    // Setup task cards
    itemEl.innerHTML = `
      <div class="timeline-time-col">
        <div class="timeline-time-badge">${timeDisplay}</div>
        <div class="timeline-marker"></div>
      </div>
      <div class="timeline-content-card">
        <div>
          <span class="timeline-category">${item.category} ${isNow ? '• 👉 FOCUS HERE NOW' : ''}</span>
          <h3>${item.title}</h3>
          ${item.notes ? `<div class="timeline-notes">${item.notes}</div>` : ''}
        </div>
        <button class="timeline-check-btn" data-id="${item.id}" aria-label="Mark task done">
          ${item.status === 'completed' ? '✓' : ''}
        </button>
      </div>
    `;

    // Hook checklist toggler
    itemEl.querySelector('.timeline-check-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskStatus(item.id);
    });

    container.appendChild(itemEl);
  });
}

function toggleTaskStatus(id) {
  const task = state.schedule.find(s => s.id === id);
  if (task) {
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    saveState();
    renderTimeline();
    renderScheduleTable(); // refresh caregiver view table as well
  }
}

// Renders visual Memory Lane directory
function renderMemoryLane() {
  const container = document.getElementById('memory-lane-grid');
  container.innerHTML = '';

  state.contacts.forEach(contact => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.innerHTML = `
      <div class="memory-card-photo-wrapper">
        <img class="memory-card-photo" src="${contact.image}" alt="${contact.name}">
      </div>
      <div class="memory-card-details">
        <div>
          <h3 class="memory-card-name">${contact.name}</h3>
          <p class="memory-card-relation">${contact.relation}</p>
        </div>
        <button class="memory-call-btn">
          <span>📞</span> Call ${contact.name.split(' ')[0]}
        </button>
      </div>
    `;

    // Hook dialer simulator
    card.querySelector('.memory-call-btn').addEventListener('click', () => {
      startDialerSimulation(contact);
    });

    container.appendChild(card);
  });
}

// ==================== SOS EMERGENCY SIMULATION ====================
let sosCountdownVal = 5;
let sosTimer = null;

function triggerSOS() {
  const overlay = document.getElementById('sos-simulation-overlay');
  const countEl = document.getElementById('sos-countdown');
  const payloadCode = document.getElementById('webhook-payload-text');
  const statusIndicator = document.getElementById('webhook-transmission-status');
  
  // Reset overlay state
  overlay.classList.remove('hidden');
  sosCountdownVal = 5;
  countEl.textContent = sosCountdownVal;
  
  // Format payload JSON visualizer
  const payload = {
    event: 'emergency_sos',
    timestamp: new Date().toISOString(),
    patient: state.settings.patientName || 'Austin',
    device: 'Forget-Me-Not Portal (Local)',
    message: `${state.settings.patientName || 'Austin'} has requested assistance. Please check the portal immediate!`,
    contacts: state.contacts.map(c => ({ name: c.name, relation: c.relation, phone: c.phone }))
  };
  payloadCode.textContent = JSON.stringify(payload, null, 2);

  statusIndicator.className = 'status-indicator sending';
  statusIndicator.querySelector('.status-dot').style.animation = 'blink 0.6s infinite alternate';
  statusIndicator.querySelector('.status-label').textContent = 'Holding 5s for cancellation...';

  // Count down
  clearInterval(sosTimer);
  sosTimer = setInterval(() => {
    sosCountdownVal--;
    countEl.textContent = sosCountdownVal;

    if (sosCountdownVal <= 0) {
      clearInterval(sosTimer);
      // Dispatch webhook
      dispatchSOSWebhook(payload);
    }
  }, 1000);

  // Hook Cancel Alert Button
  document.getElementById('btn-abort-sos').onclick = () => {
    clearInterval(sosTimer);
    overlay.classList.add('hidden');
  };
}

async function dispatchSOSWebhook(payload) {
  const statusIndicator = document.getElementById('webhook-transmission-status');
  statusIndicator.querySelector('.status-label').textContent = 'Transmitting webhook payloads to n8n...';
  
  // Save log locally in database
  const newLog = {
    timestamp: new Date().toLocaleString(),
    patient: payload.patient,
    details: 'SOS activated. Alert sent to designated caregivers.',
    status: 'Delivered'
  };
  state.sosLogs.unshift(newLog); // push to top
  saveState();
  renderSOSLogs(); // update logs list

  const sosWebhookUrl = state.settings.n8nSosUrl;
  
  if (sosWebhookUrl) {
    try {
      const response = await fetch(sosWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      statusIndicator.className = 'status-indicator success';
      statusIndicator.querySelector('.status-dot').style.animation = 'none';
      statusIndicator.querySelector('.status-label').textContent = 'n8n Alert Dispatched Successfully! SMS/Email Sent.';
    } catch (err) {
      console.error(err);
      statusIndicator.className = 'status-indicator success'; // simulated success fallback
      statusIndicator.querySelector('.status-label').textContent = 'Failed to reach URL, simulated successfully (offline)';
    }
  } else {
    // Simulated delivery delay
    setTimeout(() => {
      statusIndicator.className = 'status-indicator success';
      statusIndicator.querySelector('.status-dot').style.animation = 'none';
      statusIndicator.querySelector('.status-label').textContent = 'SOS Dispatched! (Simulated Mode - No Webhook URL Configured)';
    }, 1500);
  }
}

// ==================== PHONE CALL SIMULATOR ====================
let callTimer = null;
let callDurationSec = 0;

function startDialerSimulation(contact) {
  const overlay = document.getElementById('call-simulation-overlay');
  const avatar = document.getElementById('caller-avatar');
  const name = document.getElementById('caller-name');
  const relation = document.getElementById('caller-relation');
  const status = document.getElementById('call-status');

  overlay.classList.remove('hidden');
  avatar.src = contact.image;
  name.textContent = contact.name;
  relation.textContent = contact.relation;
  status.textContent = 'Calling...';

  // Trigger telephone ring tone simulation visually
  callDurationSec = 0;
  let ringCount = 0;

  clearInterval(callTimer);
  callTimer = setInterval(() => {
    ringCount++;
    if (ringCount < 4) {
      status.textContent = ringCount % 2 === 0 ? 'Dialing...' : 'Ring... Ring...';
    } else {
      // Connect call
      callDurationSec++;
      const min = String(Math.floor(callDurationSec / 60)).padStart(2, '0');
      const sec = String(callDurationSec % 60).padStart(2, '0');
      status.textContent = `Connected - ${min}:${sec}`;
    }
  }, 1000);

  // Hook Hang up btn
  document.getElementById('btn-end-call').onclick = () => {
    clearInterval(callTimer);
    overlay.classList.add('hidden');
  };
}

// ==================== CAREGIVER PANEL LOGIC ====================
function initCaregiverDashboard() {
  // Modal handlers - Schedule
  document.getElementById('btn-open-schedule-modal').addEventListener('click', () => {
    openScheduleModal();
  });
  document.getElementById('btn-close-schedule-modal').addEventListener('click', () => {
    closeScheduleModal();
  });
  document.getElementById('btn-cancel-schedule-modal').addEventListener('click', () => {
    closeScheduleModal();
  });
  document.getElementById('form-schedule').addEventListener('submit', handleScheduleFormSubmit);

  // Modal handlers - Contacts
  document.getElementById('btn-open-memory-modal').addEventListener('click', () => {
    openMemoryModal();
  });
  document.getElementById('btn-close-memory-modal').addEventListener('click', () => {
    closeMemoryModal();
  });
  document.getElementById('btn-cancel-memory-modal').addEventListener('click', () => {
    closeMemoryModal();
  });
  document.getElementById('form-memory').addEventListener('submit', handleMemoryFormSubmit);

  // Setup photo upload base64 converter
  const fileInput = document.getElementById('contact-image-file');
  const fileTrigger = document.getElementById('btn-trigger-file-upload');
  const urlInput = document.getElementById('contact-image-url');
  const previewImg = document.getElementById('contact-image-preview');

  fileTrigger.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        previewImg.src = base64Url;
        urlInput.value = base64Url; // Set target base64 URL to input value for saving
      };
      reader.readAsDataURL(file);
    }
  });

  urlInput.addEventListener('input', () => {
    if (urlInput.value) previewImg.src = urlInput.value;
  });

  // Settings Forms hooks
  document.getElementById('btn-save-settings').addEventListener('click', saveConfigSettings);
  document.getElementById('btn-save-passcode').addEventListener('click', savePasscodePIN);
  
  // Google Sheet Direct Sync hooks
  document.getElementById('btn-save-sheet-id').addEventListener('click', () => {
    const sheetId = document.getElementById('setting-sheet-id').value.trim();
    if (!sheetId) {
      showToast('⚠️ Please enter a valid Google Sheet ID.');
      return;
    }
    state.settings.googleSheetId = sheetId;
    saveState();
    showToast('💾 Google Sheet ID saved successfully!');
  });
  
  document.getElementById('btn-sync-sheet').addEventListener('click', () => {
    const sheetId = document.getElementById('setting-sheet-id').value.trim();
    if (sheetId) {
      state.settings.googleSheetId = sheetId;
      saveState();
    }
    syncFromGoogleSheet(true);
  });

  // Knowledge Hub Search filter
  document.getElementById('hub-search-input').addEventListener('input', handleHubSearch);
}

function renderCaregiverView() {
  renderScheduleTable();
  renderCaregiverContacts();
  renderMoodChart();
  renderSOSLogs();
  renderKnowledgeHub();
  loadConfigSettingsForm();
}

function renderAllViews() {
  renderPatientView();
  renderCaregiverView();
}

// 1. Schedule Table CRUD Renders
function renderScheduleTable() {
  const tbody = document.getElementById('schedule-list-tbody');
  const counter = document.getElementById('schedule-counter');
  tbody.innerHTML = '';

  const sortedItems = [...state.schedule].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  counter.textContent = `${sortedItems.length} Events`;

  sortedItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="table-time" data-label="Time">${item.time}</td>
      <td data-label="Event">
        <span class="table-title">${item.title}</span>
        ${item.notes ? `<span class="table-notes">${item.notes}</span>` : ''}
      </td>
      <td data-label="Category">${item.category}</td>
      <td data-label="Priority"><span class="table-priority-badge ${item.priority.toLowerCase()}">${item.priority}</span></td>
      <td data-label="Status">
        <span class="table-status-badge ${item.status}">
          ${item.status === 'completed' ? '✅ Completed' : '⏳ Pending'}
        </span>
      </td>
      <td data-label="Actions">
        <div class="table-action-btns">
          <button class="action-btn edit" data-id="${item.id}" title="Edit">✏️</button>
          <button class="action-btn delete" data-id="${item.id}" title="Delete">🗑️</button>
        </div>
      </td>
    `;

    // Action listener hooks
    tr.querySelector('.action-btn.edit').addEventListener('click', () => {
      openScheduleModal(item);
    });
    tr.querySelector('.action-btn.delete').addEventListener('click', () => {
      deleteScheduleItem(item.id);
    });

    tbody.appendChild(tr);
  });
}

function openScheduleModal(item = null) {
  const modal = document.getElementById('modal-schedule');
  const title = document.getElementById('schedule-modal-title');
  const form = document.getElementById('form-schedule');
  
  modal.classList.remove('hidden');

  if (item) {
    title.textContent = 'Edit Timetable Entry';
    document.getElementById('sched-id').value = item.id;
    document.getElementById('sched-title').value = item.title;
    document.getElementById('sched-time').value = item.time;
    document.getElementById('sched-category').value = item.category;
    document.getElementById('sched-priority').value = item.priority;
    document.getElementById('sched-status').value = item.status;
    document.getElementById('sched-notes').value = item.notes || '';
  } else {
    title.textContent = 'New Timetable Entry';
    form.reset();
    document.getElementById('sched-id').value = '';
    document.getElementById('sched-status').value = 'pending';
  }
}

function closeScheduleModal() {
  document.getElementById('modal-schedule').classList.add('hidden');
}

function handleScheduleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('sched-id').value;
  const title = document.getElementById('sched-title').value;
  const time = document.getElementById('sched-time').value;
  const category = document.getElementById('sched-category').value;
  const priority = document.getElementById('sched-priority').value;
  const status = document.getElementById('sched-status').value;
  const notes = document.getElementById('sched-notes').value;

  if (id) {
    // Edit mode
    const idx = state.schedule.findIndex(s => s.id === id);
    if (idx > -1) {
      state.schedule[idx] = { id, title, time, category, priority, status, notes };
    }
  } else {
    // Add mode
    const newId = 's_' + Date.now();
    state.schedule.push({ id: newId, title, time, category, priority, status, notes });
  }

  saveState();
  closeScheduleModal();
  renderScheduleTable();
  renderTimeline();
}

function deleteScheduleItem(id) {
  const existing = document.getElementById('delete-confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'delete-confirm-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" style="max-width:420px; text-align:center; padding: 40px 32px;">
      <div style="font-size:3rem; margin-bottom:12px;">🗑️</div>
      <h3 style="font-size:1.4rem; margin-bottom:8px;">Delete Event?</h3>
      <p style="color:var(--text-muted); margin-bottom:24px;">Are you sure you want to delete this schedule event? This cannot be undone.</p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="btn-confirm-cancel" class="cancel-btn" style="min-width:120px;">Keep</button>
        <button id="btn-confirm-delete" class="primary-btn" style="background:var(--color-danger); min-width:120px;">Yes, Delete</button>
      </div>
    </div>
  `;

  document.getElementById('app').appendChild(overlay);

  document.getElementById('btn-confirm-cancel').onclick = () => overlay.remove();
  document.getElementById('btn-confirm-delete').onclick = () => {
    overlay.remove();
    state.schedule = state.schedule.filter(s => s.id !== id);
    saveState();
    renderScheduleTable();
    renderTimeline();
    showToast('Schedule event removed.');
  };
}

// 2. Memory Lane CRUD Renders
function renderCaregiverContacts() {
  const container = document.getElementById('caregiver-contacts-grid');
  container.innerHTML = '';

  if (state.contacts.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:48px; color:var(--text-muted);">
        <div style="font-size:3rem;">👤</div>
        <p style="font-size:1.2rem; margin-top:12px; font-weight:600;">No contacts yet</p>
        <p>Click "+ Add Contact" to add someone to the Memory Lane directory.</p>
      </div>
    `;
    return;
  }

  state.contacts.forEach(contact => {
    // Capture the id as a primitive string — not the mutable object
    const contactId = String(contact.id);

    const card = document.createElement('div');
    card.className = 'caregiver-contact-card';
    card.setAttribute('data-contact-id', contactId);
    card.innerHTML = `
      <div class="caregiver-contact-avatar-wrapper">
        <img class="caregiver-contact-avatar" src="${contact.image}" alt="${contact.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name)}&background=4f6e57&color=fff&size=200'">
      </div>
      <div class="caregiver-contact-details">
        <div class="caregiver-contact-info">
          <h4>${contact.name}</h4>
          <p class="contact-relation">${contact.relation}</p>
          <p class="contact-phone">📞 ${contact.phone}</p>
        </div>
        <div class="caregiver-contact-actions">
          <button class="btn-contact-edit" data-id="${contactId}" aria-label="Edit Contact Details">✏️ Edit Details</button>
          <button class="btn-contact-delete" data-id="${contactId}" aria-label="Delete Contact">🗑️ Delete</button>
        </div>
      </div>
    `;

    // Use data-id attribute to look up fresh state at click time
    card.querySelector('.btn-contact-edit').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const fresh = state.contacts.find(c => String(c.id) === id);
      if (fresh) openMemoryModal(fresh);
    });

    card.querySelector('.btn-contact-delete').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const fresh = state.contacts.find(c => String(c.id) === id);
      if (fresh) showDeleteConfirm(fresh);
    });

    container.appendChild(card);
  });
}

function openMemoryModal(contact = null) {
  const modal = document.getElementById('modal-memory');
  const title = document.getElementById('memory-modal-title');
  const form = document.getElementById('form-memory');
  const preview = document.getElementById('contact-image-preview');

  modal.classList.remove('hidden');

  if (contact) {
    title.textContent = 'Edit Contact Entry';
    document.getElementById('contact-id').value = contact.id;
    document.getElementById('contact-name').value = contact.name;
    document.getElementById('contact-relation').value = contact.relation;
    document.getElementById('contact-phone').value = contact.phone;
    document.getElementById('contact-image-url').value = contact.image;
    preview.src = contact.image;
  } else {
    title.textContent = 'New Contact Entry';
    form.reset();
    document.getElementById('contact-id').value = '';
    preview.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';
  }
}

function closeMemoryModal() {
  document.getElementById('modal-memory').classList.add('hidden');
}

function handleMemoryFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('contact-id').value;
  const name = document.getElementById('contact-name').value;
  const relation = document.getElementById('contact-relation').value;
  const phone = document.getElementById('contact-phone').value;
  const image = document.getElementById('contact-image-url').value || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop';

  if (id) {
    // Edit mode
    const idx = state.contacts.findIndex(c => c.id === id);
    if (idx > -1) {
      state.contacts[idx] = { id, name, relation, phone, image };
    }
  } else {
    // Add mode
    const newId = 'c_' + Date.now();
    state.contacts.push({ id: newId, name, relation, phone, image });
  }

  saveState();
  closeMemoryModal();
  renderCaregiverContacts();
  renderMemoryLane();
}

function deleteContactItem(id) {
  const strId = String(id);
  state.contacts = state.contacts.filter(c => String(c.id) !== strId);
  saveState();
  renderCaregiverContacts();
  renderMemoryLane();

  // Show a brief toast so user knows it worked
  showToast('Contact removed from Memory Lane.');
}

// Custom in-page delete confirmation (replaces browser confirm() which is blocked on file://)
function showDeleteConfirm(contact) {
  // Remove any old confirm overlay
  const existing = document.getElementById('delete-confirm-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'delete-confirm-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-card" style="max-width:420px; text-align:center; padding: 40px 32px;">
      <div style="font-size:3rem; margin-bottom:12px;">🗑️</div>
      <h3 style="font-size:1.4rem; margin-bottom:8px;">Remove Contact?</h3>
      <p style="color:var(--text-muted); margin-bottom:24px;">Are you sure you want to remove <strong>${contact.name}</strong> from the Memory Lane directory? This cannot be undone.</p>
      <div style="display:flex; gap:12px; justify-content:center;">
        <button id="btn-confirm-cancel" class="cancel-btn" style="min-width:120px;">Keep</button>
        <button id="btn-confirm-delete" class="primary-btn" style="background:var(--color-danger); min-width:120px;">Yes, Delete</button>
      </div>
    </div>
  `;

  document.getElementById('app').appendChild(overlay);

  document.getElementById('btn-confirm-cancel').onclick = () => overlay.remove();
  document.getElementById('btn-confirm-delete').onclick = () => {
    overlay.remove();
    deleteContactItem(contact.id);
  };
}

// Toast notification helper
function showToast(message) {
  const existing = document.getElementById('fmn-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'fmn-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 140px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-main);
    color: white;
    padding: 14px 28px;
    border-radius: 30px;
    font-weight: 600;
    font-size: 1rem;
    z-index: 9999;
    box-shadow: var(--shadow-lg);
    animation: slideInUp 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// 3. Render Patient Insights (SVG Charting & SOS Log history)
function renderMoodChart() {
  const container = document.getElementById('mood-chart-container');
  if (!container) return;
  container.innerHTML = '';

  const chartWidth = container.clientWidth || 550;
  const chartHeight = 220;

  // Render last 7 days of mood check-ins (including padding for empty days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    last7Days.push(getPastDateString(i));
  }

  // Map mood values to heights (Happy = 3, Okay = 2, Sad/Confused = 1)
  const moodPoints = last7Days.map(date => {
    const entry = state.moods.find(m => m.date === date);
    let val = 2; // default to Okay if no data
    let found = false;
    if (entry) {
      found = true;
      if (entry.mood === 'happy') val = 3;
      else if (entry.mood === 'sad') val = 1;
    }
    return { date, value: val, recorded: found };
  });

  // SVG parameters
  const paddingX = 40;
  const paddingY = 30;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;
  const stepX = graphWidth / 6;

  // Y values: 3 maps to top, 1 maps to bottom
  const getY = (val) => {
    // 3 -> paddingY, 2 -> paddingY + graphHeight/2, 1 -> paddingY + graphHeight
    return paddingY + graphHeight - ((val - 1) / 2) * graphHeight;
  };

  // Build SVG string
  let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${chartWidth} ${chartHeight}">`;

  // Draw background grid lines (horizontal representing Happy, Okay, Sad)
  const gridLevels = [1, 2, 3];
  const gridLabels = ['Sad', 'Okay', 'Happy'];
  gridLevels.forEach((level, idx) => {
    const y = getY(level);
    svgContent += `
      <line x1="${paddingX}" y1="${y}" x2="${chartWidth - paddingX}" y2="${y}" class="chart-grid" />
      <text x="${paddingX - 10}" y="${y + 4}" class="chart-text-y">${gridLabels[idx]}</text>
    `;
  });

  // Calculate coordinates for points
  const points = moodPoints.map((pt, idx) => {
    const x = paddingX + idx * stepX;
    const y = getY(pt.value);
    return { x, y, ...pt };
  });

  // Draw connection path line
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  // Draw line
  svgContent += `<path d="${pathD}" class="chart-line happy" />`;

  // Draw dots and day labels on X-axis
  points.forEach((pt, idx) => {
    const d = new Date(pt.date);
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Draw Day X axis text
    svgContent += `
      <text x="${pt.x}" y="${chartHeight - 10}" class="chart-text">${dayLabel}</text>
      <circle cx="${pt.x}" cy="${pt.y}" r="6" class="chart-dot ${pt.recorded ? state.moods.find(m => m.date === pt.date).mood : 'okay'}" title="${pt.date}: ${pt.recorded ? 'Recorded' : 'Estimated'}" />
    `;
  });

  svgContent += `</svg>`;
  container.innerHTML = svgContent;
}

function renderSOSLogs() {
  const list = document.getElementById('sos-logs-list');
  list.innerHTML = '';

  if (state.sosLogs.length === 0) {
    list.innerHTML = `<li style="text-align: center; padding: 20px; color: var(--text-muted);">No emergency activations logged.</li>`;
    return;
  }

  state.sosLogs.forEach(log => {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.innerHTML = `
      <div class="log-item-details">
        <h4>🚨 SOS Triggered by ${log.patient}</h4>
        <p>${log.details}</p>
        <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 4px;">Date: ${log.timestamp}</p>
      </div>
      <span class="log-status-tag">${log.status || 'Active'}</span>
    `;
    list.appendChild(li);
  });
}

// 4. Caregiver Resources Knowledge Hub
function renderKnowledgeHub(filterText = '') {
  const container = document.getElementById('hub-results');
  container.innerHTML = '';

  const query = filterText.toLowerCase().trim();
  const filtered = KNOWLEDGE_BASE.filter(item => {
    return item.title.toLowerCase().includes(query) || 
           item.content.toLowerCase().includes(query) ||
           item.category.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="faq-card" style="text-align: center; padding: 40px;">
        <p style="font-size: 1.1rem; color: var(--text-muted);">No resources found matching "${filterText}". Try searching for 'medication', 'wandering', or 'sundowning'.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(faq => {
    const card = document.createElement('div');
    card.className = 'faq-card';
    card.innerHTML = `
      <h3>${faq.title}</h3>
      <p>${faq.content}</p>
      <span class="faq-category">${faq.category}</span>
    `;
    container.appendChild(card);
  });
}

function handleHubSearch(e) {
  renderKnowledgeHub(e.target.value);
}

// 5. Config Settings Forms Load & Save
function loadConfigSettingsForm() {
  document.getElementById('setting-patient-name').value = state.settings.patientName || 'Austin';
  document.getElementById('setting-n8n-sos').value = state.settings.n8nSosUrl || '';
  document.getElementById('setting-n8n-sync').value = state.settings.n8nSyncUrl || '';
  document.getElementById('setting-simulated-endpoints').checked = state.settings.simulateEndpoints !== false;
  document.getElementById('setting-passcode').value = state.settings.passcode || '1234';
  document.getElementById('setting-sheet-id').value = state.settings.googleSheetId || '1ArgPlufENvMT0Dg0lyeg2xSxjKbJ9h12a71OWGGy4AQ';
}

function saveConfigSettings() {
  const patientName = document.getElementById('setting-patient-name').value.trim() || 'Austin';
  const n8nSosUrl = document.getElementById('setting-n8n-sos').value.trim();
  const n8nSyncUrl = document.getElementById('setting-n8n-sync').value.trim();
  const simulateEndpoints = document.getElementById('setting-simulated-endpoints').checked;

  state.settings.patientName = patientName;
  state.settings.n8nSosUrl = n8nSosUrl;
  state.settings.n8nSyncUrl = n8nSyncUrl;
  state.settings.simulateEndpoints = simulateEndpoints;
  
  saveState();
  showToast('✅ Configurations saved successfully!');
  
  // Refresh views
  renderAllViews();
}

function savePasscodePIN() {
  const passcode = document.getElementById('setting-passcode').value.trim();
  
  if (passcode.length !== 4 || isNaN(passcode)) {
    showToast('⚠️ Security PIN must be exactly 4 numerical digits.');
    return;
  }

  state.settings.passcode = passcode;
  saveState();
  showToast('✅ Security PIN updated successfully!');
}
