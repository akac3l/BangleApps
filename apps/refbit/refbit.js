/**
 * Bangle.js 2 Watch Soccer Referee App with support for Rarebit Beeper Flags.
 * Name: Refbit 
 * This is a customized version of the original Rarebit app: https://earp123.github.io/BangleApps/
 * Added a manual debug mode to test flag alerts, support for 2 halves with two overtime periods, and other enhancements.
 * dclaguna@gmail.com
 */

// --- Constants ---
let appversion = 1.04;
const DEBUG_MODE = false; // Set to true to simulate AR notifications, false for production
const PAG_SERVICE_UUID = "23210001-28d5-4b7b-bad0-7dee1eee1b6d";
const PAG_CHAR_UUID = "23210002-28d5-4b7b-bad0-7dee1eee1b6d";
const BT_DEVICE_NAME_PREFIX = 'rareBit';
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(10);

const PERIODS = {
  SET_1H: "SET 1H", H1: "1H",
  SET_HT: "SET HT", HT: "HT",
  SET_2H: "SET 2H", H2: "2H",
  SET_OTB: "SET OTB", OTB: "OTB",
  SET_OT1: "SET OT1", OT1: "OT1",
  SET_OTH: "SET OTH", OTH: "OTH",
  SET_OT2: "SET OT2", OT2: "OT2",
  END: "END",
};

// --- Custom Font ---
Graphics.prototype.setFontAnton = function(scale) {
  // Actual height 69 (68 - 0)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAAAAAAAAA/gAAAAAAAAAAP/gAAAAAAAAAH//gAAAAAAAAB///gAAAAAAAAf///gAAAAAAAP////gAAAAAAD/////gAAAAAA//////gAAAAAP//////gAAAAH///////gAAAB////////gAAAf////////gAAP/////////gAD//////////AA//////////gAA/////////4AAA////////+AAAA////////gAAAA///////wAAAAA//////8AAAAAA//////AAAAAAA/////gAAAAAAA////4AAAAAAAA///+AAAAAAAAA///gAAAAAAAAA//wAAAAAAAAAA/8AAAAAAAAAAA/AAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////AAAAAB///////8AAAAH////////AAAAf////////wAAA/////////4AAB/////////8AAD/////////+AAH//////////AAP//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wA//8AAAAAB//4A//wAAAAAAf/4A//gAAAAAAP/4A//gAAAAAAP/4A//gAAAAAAP/4A//wAAAAAAf/4A///////////4Af//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH//////////AAD/////////+AAB/////////8AAA/////////4AAAP////////gAAAD///////+AAAAAf//////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAP/gAAAAAAAAAAf/gAAAAAAAAAAf/gAAAAAAAAAAf/AAAAAAAAAAA//AAAAAAAAAAA/+AAAAAAAAAAB/8AAAAAAAAAAD//////////gAH//////////gAP//////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/4AAAAB/gAAD//4AAAAf/gAAP//4AAAB//gAA///4AAAH//gAB///4AAAf//gAD///4AAA///gAH///4AAD///gAP///4AAH///gAP///4AAP///gAf///4AAf///gAf///4AB////gAf///4AD////gA////4AH////gA////4Af////gA////4A/////gA//wAAB/////gA//gAAH/////gA//gAAP/////gA//gAA///8//gA//gAD///w//gA//wA////g//gA////////A//gA///////8A//gA///////4A//gAf//////wA//gAf//////gA//gAf/////+AA//gAP/////8AA//gAP/////4AA//gAH/////gAA//gAD/////AAA//gAB////8AAA//gAA////wAAA//gAAP///AAAA//gAAD//8AAAA//gAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/+AAAAAD/wAAB//8AAAAP/wAAB///AAAA//wAAB///wAAB//wAAB///4AAD//wAAB///8AAH//wAAB///+AAP//wAAB///+AAP//wAAB////AAf//wAAB////AAf//wAAB////gAf//wAAB////gA///wAAB////gA///wAAB////gA///w//AAf//wA//4A//AAA//wA//gA//AAAf/wA//gB//gAAf/wA//gB//gAAf/wA//gD//wAA//wA//wH//8AB//wA///////////gA///////////gA///////////gA///////////gAf//////////AAf//////////AAP//////////AAP/////////+AAH/////////8AAH///+/////4AAD///+f////wAAA///8P////gAAAf//4H///+AAAAH//gB///wAAAAAP4AAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAA//wAAAAAAAAAP//wAAAAAAAAB///wAAAAAAAAf///wAAAAAAAH////wAAAAAAA/////wAAAAAAP/////wAAAAAB//////wAAAAAf//////wAAAAH///////wAAAA////////wAAAP////////wAAA///////H/wAAA//////wH/wAAA/////8AH/wAAA/////AAH/wAAA////gAAH/wAAA///4AAAH/wAAA//+AAAAH/wAAA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gA///////////gAAAAAAAAH/4AAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAH/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//8AAA/////+B///AAA/////+B///wAA/////+B///4AA/////+B///8AA/////+B///8AA/////+B///+AA/////+B////AA/////+B////AA/////+B////AA/////+B////gA/////+B////gA/////+B////gA/////+A////gA//gP/gAAB//wA//gf/AAAA//wA//gf/AAAAf/wA//g//AAAAf/wA//g//AAAA//wA//g//gAAA//wA//g//+AAP//wA//g////////gA//g////////gA//g////////gA//g////////gA//g////////AA//gf///////AA//gf//////+AA//gP//////+AA//gH//////8AA//gD//////4AA//gB//////wAA//gA//////AAAAAAAH////8AAAAAAAA////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//////gAAAAB///////+AAAAH////////gAAAf////////4AAB/////////8AAD/////////+AAH//////////AAH//////////gAP//////////gAP//////////gAf//////////wAf//////////wAf//////////wAf//////////wAf//////////4A//wAD/4AAf/4A//gAH/wAAP/4A//gAH/wAAP/4A//gAP/wAAP/4A//gAP/4AAf/4A//wAP/+AD//4A///wP//////4Af//4P//////wAf//4P//////wAf//4P//////wAf//4P//////wAP//4P//////gAP//4H//////gAH//4H//////AAH//4D/////+AAD//4D/////8AAB//4B/////4AAA//4A/////wAAAP/4AP////AAAAB/4AD///4AAAAAAAAAH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAAAAA//gAAAAAAADgA//gAAAAAAP/gA//gAAAAAH//gA//gAAAAB///gA//gAAAAP///gA//gAAAD////gA//gAAAf////gA//gAAB/////gA//gAAP/////gA//gAB//////gA//gAH//////gA//gA///////gA//gD///////gA//gf///////gA//h////////gA//n////////gA//////////gAA/////////AAAA////////wAAAA///////4AAAAA///////AAAAAA//////4AAAAAA//////AAAAAAA/////4AAAAAAA/////AAAAAAAA////8AAAAAAAA////gAAAAAAAA///+AAAAAAAAA///4AAAAAAAAA///AAAAAAAAAA//4AAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gB///wAAAAP//4H///+AAAA///8P////gAAB///+f////4AAD///+/////8AAH/////////+AAH//////////AAP//////////gAP//////////gAf//////////gAf//////////wAf//////////wAf//////////wA///////////wA//4D//wAB//4A//wB//gAA//4A//gA//gAAf/4A//gA//AAAf/4A//gA//gAAf/4A//wB//gAA//4A///P//8AH//4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////gAP//////////gAP//////////AAH//////////AAD/////////+AAD///+/////8AAB///8f////wAAAf//4P////AAAAH//wD///8AAAAA/+AAf//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//gAAAAAAAAB///+AA/+AAAAP////gA//wAAAf////wA//4AAB/////4A//8AAD/////8A//+AAD/////+A///AAH/////+A///AAP//////A///gAP//////A///gAf//////A///wAf//////A///wAf//////A///wAf//////A///wA///////AB//4A//4AD//AAP/4A//gAB//AAP/4A//gAA//AAP/4A//gAA/+AAP/4A//gAB/8AAP/4A//wAB/8AAf/4Af//////////wAf//////////wAf//////////wAf//////////wAf//////////wAP//////////gAP//////////gAH//////////AAH/////////+AAD/////////8AAB/////////4AAAf////////wAAAP////////AAAAB///////4AAAAAD/////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAB/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAA//AAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), 46, atob("EiAnGicnJycnJycnEw=="), 78 + (scale << 8) + (1 << 16));
};

// --- State Management ---
let timerState = {
  setMinutes: 40,
  remaining: 40 * 60,
  elapsed: 0,
  savedElapsed: 0,
  period: PERIODS.SET_1H,
  halfLength: 40,
  isRunning: false,
  timerInterval: null,
  stoppageTime: 0,
  stoppageInterval: null,
  addedStoppageTime: 0,
  lastTapTime: 0,
  periodEnded: false,
  timeFlashInterval: null,
};

// Generic device object structure
function createDeviceState(name) {
  return {
    name: name,
    device: null,
    characteristic: null,
    isConnected: false,
  };
}

let ar1 = createDeviceState("AR1");
let ar2 = createDeviceState("AR2");
let scanning = false;

// --- Core Functions ---
function formatTime(secs) {
  const mins = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${("0" + mins).slice(-2)}:${("0" + sec).slice(-2)}`;
}

function stopStoppageTimer() {
  if (timerState.stoppageInterval) {
    clearInterval(timerState.stoppageInterval);
    timerState.stoppageInterval = null;
  }
}

function tick() {
  // Add stoppage time to remaining when countdown hits 1 second
  if (timerState.remaining === 1 && timerState.stoppageTime > 0) {
    const timeToAdd = timerState.stoppageTime;
    print(`Adding ${timeToAdd}s of stoppage time.`);
    timerState.remaining += timeToAdd;
    timerState.addedStoppageTime = timeToAdd;
    timerState.stoppageTime = 0;
    Bangle.buzz(1000, 1);
    Bangle.setLCDPower(1);
    Bangle.setLCDTimeout(5);
  }

  if (timerState.remaining > 0) {
    timerState.remaining--;
    draw();
    return;
  }

  // --- Timer finished for the period ---
  clearInterval(timerState.timerInterval);
  stopStoppageTimer();
  timerState.isRunning = false;
  timerState.periodEnded = true;

  // Start flashing TIME message by redrawing periodically
  if (!timerState.timeFlashInterval) {
    timerState.timeFlashInterval = setInterval(draw, 500);
  }

  const endedPeriod = timerState.period;
  
  // Correct the final elapsed time
  const playPeriods = [PERIODS.H1, PERIODS.H2, PERIODS.OT1, PERIODS.OT2];
  if (playPeriods.includes(endedPeriod)) {
    let periodLength = 0;
    if (endedPeriod === PERIODS.H1 || endedPeriod === PERIODS.H2) {
      periodLength = timerState.halfLength * 60;
    } else if (endedPeriod === PERIODS.OT1 || endedPeriod === PERIODS.OT2) {
      periodLength = 5 * 60;
    }
    timerState.elapsed = timerState.savedElapsed + periodLength;
    print(`Corrected elapsed time for ${endedPeriod} to ${formatTime(timerState.elapsed)}`);
  }
  
  timerState.addedStoppageTime = 0;
  timerState.savedElapsed = timerState.elapsed;
      Bangle.setLCDPower(1);
    Bangle.setLCDTimeout(10);
  Bangle.buzz(1000, 1).then(() => Bangle.buzz(500, 0.33)).then(() => Bangle.buzz(1000,1)).then(() => Bangle.buzz(500,0.33)).then(() => Bangle.buzz(3000,1));

  draw();
}

function advancePeriod() {
  // Stop the flashing TIME message
  if (timerState.timeFlashInterval) {
    clearInterval(timerState.timeFlashInterval);
    timerState.timeFlashInterval = null;
  }
  
  const lastPeriod = timerState.period;
  switch (lastPeriod) {
    case PERIODS.H1:
      timerState.period = PERIODS.SET_HT; timerState.setMinutes = 5;
      timerState.stoppageTime = 0;
      break;
    case PERIODS.HT:
      timerState.period = PERIODS.SET_2H; timerState.setMinutes = timerState.halfLength;
      break;
    case PERIODS.H2:
      timerState.period = PERIODS.SET_OTB; timerState.setMinutes = 0;
      timerState.stoppageTime = 0;
      break;
    case PERIODS.OTB:
      timerState.period = PERIODS.SET_OT1; timerState.setMinutes = 5;
      break;
    case PERIODS.OT1:
      timerState.period = PERIODS.SET_OTH; timerState.setMinutes = 2;
      timerState.stoppageTime = 0;
      break;
    case PERIODS.OTH:
      timerState.period = PERIODS.SET_OT2; timerState.setMinutes = 5;
      break;
    case PERIODS.OT2:
      timerState.period = PERIODS.END;
      break;
  }
  timerState.periodEnded = false;
  timerState.remaining = timerState.setMinutes * 60;
  draw();
}

// --- UI Drawing ---
function draw() {
  g.clear();
  g.setColor("#000");
  g.setFont("Vector", 23);
  g.setFontAlign(-1, 0);
  g.drawString(timerState.period, 10, 20);

// Adjust screen spacing if flags are connected
  if(ar1.isConnected || ar2.isConnected) {
    g.setFontAnton(1);
    g.setFontAlign(0, 0);
    g.drawString(formatTime(timerState.elapsed), g.getWidth() / 2, g.getHeight() / 2 - 7);

    g.setFont("Vector", 45);
    g.drawString(formatTime(timerState.remaining), g.getWidth() / 2, g.getHeight() / 2 + 51); 
  }
    else {
    g.setFontAnton(1);
    g.setFontAlign(0, 0);
    g.drawString(formatTime(timerState.elapsed), g.getWidth() / 2, g.getHeight() / 2 - 3);

    g.setFont("Vector", 45);
    g.drawString(formatTime(timerState.remaining), g.getWidth() / 2, g.getHeight() / 2 + 60);
    }

  // Draw AR connection status at the bottom
  if (ar1.isConnected) drawAR(ar1);
  if (ar2.isConnected) drawAR(ar2);
  
  // Top-right corner display logic
  if (timerState.periodEnded) {
    // Flash "TIME" in top right corner with alternating background
    const show = Math.floor(getTime() * 2) % 2 === 0;
    const text = "TIME";
    const fontSize = 23;
    g.setColor("#000");
    g.setFont("Vector", fontSize);
    g.setFontAlign(1, 0);
    
    const w = g.stringWidth(text);
    const x = g.getWidth() - 5;
    const y = 10;
    
    const xRect = x - w;
    const yRect = y;

    g.setColor(show ? "#000" : "#fff");
    g.fillRect(xRect - 2, yRect - 2, x + 2, yRect + fontSize + 2);

    g.setColor(show ? "#fff" : "#000");
    g.drawString(text, x, y);
    
  } else if (timerState.stoppageTime > 0) {
    g.setColor("#000");
    g.setFont("Vector", 24);
    g.setFontAlign(1, -1);
    g.drawString(formatTime(timerState.stoppageTime), g.getWidth() - 5, 9);
  } else if (timerState.period.startsWith("SET")) {
    const battery = E.getBattery();
    g.setColor("#000");
    g.setFont("Vector", 23);
    g.setFontAlign(1, -1);
    g.drawString(`${battery}%`, g.getWidth() - 5, 9);
  }
  
  // Draw debug indicator if in debug mode
  if (DEBUG_MODE) {
    g.setFont("6x8", 1.5).setFontAlign(0, 1);
    g.drawString("DEBUG", g.getWidth() / 2, g.getHeight() - 2);
  }
}

// Generic function to draw device status
function drawAR(device) {
  g.setFont("Vector", 12); // Set font size to 2
  const isAR1 = device.name === "AR1";
  const x = isAR1 ? 5 : g.getWidth() - 5; // Position left or right
  const y = g.getHeight() - 2; // Position at the bottom
  g.setFontAlign(isAR1 ? -1 : 1, 1); // Align left/right and bottom
  g.drawString(device.name, x, y);
}


function flashAR(device) {
  let state = false;
  let count = 0;
  const maxFlashes = 15;
  
  const interval = setInterval(() => {
    const text = device.name;
    const isAR1 = device.name === "AR1";
    
    // Set font and alignment to match drawAR
    g.setFont("Vector", 25); // Use a slightly larger font for visibility
    const x = isAR1 ? 5 : g.getWidth() - 5;
    const y = g.getHeight() - 2;
    g.setFontAlign(isAR1 ? -1 : 1, 1); // Align left/right and bottom

    const w = g.stringWidth(text);
    const h = 8 * 3; // Font height * scale

    // Calculate rectangle for background flashing
    const xRect = isAR1 ? x : x - w;
    const yRect = y - h;

    // Draw flashing background
    g.setColor(state ? "#F00" : "#fff");
    g.fillRect(xRect, yRect, xRect + w, yRect + h);

    // Draw text
    g.setColor(state ? "#fff" : "#F00");
    g.drawString(text, x, y);

    state = !state;
    count++;
    if (count >= maxFlashes) {
      clearInterval(interval);
      draw(); // Redraw the screen cleanly after flashing
    }
  }, 200);
}

// --- Event Handlers ---
function swipeHandle(lr, ud) {
  if (!DEBUG_MODE) return;
  
  if (ud === -1) { // Swipe Up
    print("Simulating AR1 notification");
    flashAR(ar1);
    Bangle.buzz(3000, 0.1);
  } else if (ud === 1) { // Swipe Down
    print("Simulating AR2 notification");
    flashAR(ar2);
    Bangle.buzz(3000, 0.1);
  }
}

function touchHandle() {
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(10);

  const now = getTime();
  if ((now - timerState.lastTapTime) < 0.3) {
    timerState.lastTapTime = 0;
    if (!timerState.isRunning && (timerState.period === PERIODS.HT || timerState.period === PERIODS.OTH || timerState.period === PERIODS.OTB)) {
      print(`Double tap in ${timerState.period}. Skipping.`);
      advancePeriod();
      return;
    }
  }
  timerState.lastTapTime = now;

  if (!timerState.period.startsWith("SET")) {
    print("Not in a SET period. Time adjustment disabled.");
    return;
  }

  print("Screen Tap: Adjusting time");
  timerState.setMinutes += 5;
  Bangle.buzz(75, 0.1);
  if (timerState.setMinutes > 45) timerState.setMinutes = 5;
  
  timerState.remaining = timerState.setMinutes * 60;
  if (timerState.elapsed > 0) timerState.elapsed = timerState.savedElapsed;

  if (timerState.period === PERIODS.SET_1H) {
    timerState.halfLength = timerState.setMinutes;
  }
  draw();
}

function buttonHandle() {
  Bangle.buzz(100, 0.5);
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(10);
  
  print("Button Pressed: Toggling timer");

  // If a period just ended, this button press advances to the next SET screen.
  if (timerState.periodEnded) {
    advancePeriod();
    return;
  }

  const isPlayPeriod = [PERIODS.H1, PERIODS.H2, PERIODS.OT1, PERIODS.OT2].includes(timerState.period);

  if (timerState.isRunning) {
    // --- STOPPING THE TIMER ---
    clearInterval(timerState.timerInterval);
    timerState.isRunning = false;

    if (isPlayPeriod) {
      if (!timerState.stoppageInterval) {
        timerState.stoppageInterval = setInterval(() => {
          timerState.stoppageTime++;
          timerState.elapsed++;
          if (timerState.stoppageTime > 0 && timerState.stoppageTime % 15 === 0) {
            Bangle.buzz(1000, 0.5);
            Bangle.setLCDPower(1);
            Bangle.setLCDTimeout();
          }
          draw();
        }, 1000);
      }
    }

  } else {
    // --- STARTING THE TIMER ---
    stopStoppageTimer();

    if (timerState.period.startsWith("SET")) {
      timerState.period = timerState.period.substring(4);
      timerState.savedElapsed = timerState.elapsed; // Save elapsed time before the period starts
    }
    
    if (timerState.period !== PERIODS.END) {
        timerState.timerInterval = setInterval(() => {
            if (timerState.period !== PERIODS.HT && timerState.period !== PERIODS.OTB && timerState.period !== PERIODS.OTH) {
              timerState.elapsed++;
            }
            tick();
        }, 1000);
        timerState.isRunning = true;
    }
  }
  draw();
}

// --- Bluetooth Functions ---
function connectToDevice(deviceState) {
  if (scanning) {
    print("Scan already in progress. Aborting.");
    return;
  }
  scanning = true;
  print(`Scanning for a device for ${deviceState.name}...`);

  NRF.requestDevice({ phy: "coded", filters: [{ namePrefix: BT_DEVICE_NAME_PREFIX }] })
    .then(device => {
      const otherDevice = deviceState.name === 'AR1' ? ar2 : ar1;
      if (otherDevice.isConnected && otherDevice.device.id === device.id) {
        throw new Error(`Device ${device.id} already connected as ${otherDevice.name}`);
      }
      print(`Found device: ${device.id}`);
      deviceState.device = device;
      
      device.on('gattserverdisconnected', (reason) => {
        deviceState.isConnected = false;
        deviceState.characteristic = null;
        print(`${deviceState.name} disconnected: ${reason}. Re-scanning...`);
        draw();
        setTimeout(() => connectToDevice(deviceState), 2000);
      });
      return device.gatt.connect({ phy: "coded", minInterval: 15, maxInterval: 30 });
    })
    .then(gatt => gatt.getPrimaryService(PAG_SERVICE_UUID))
    .then(service => service.getCharacteristic(PAG_CHAR_UUID))
    .then(characteristic => {
      deviceState.characteristic = characteristic;
      characteristic.on('characteristicvaluechanged', () => {
        print(`Notification from ${deviceState.name}`);
        flashAR(deviceState);
        Bangle.buzz(3000, 1);
      });
      return characteristic.startNotifications();
    })
    .then(() => {
      print(`${deviceState.name} connected and notifications started.`);
      deviceState.isConnected = true;
      scanning = false;
      draw();
    })
    .catch(err => {
      print(`Error for ${deviceState.name}: ${err}`);
      scanning = false;
    });
}

// --- App Initialization ---
function init() {
  g.clear();
  Bangle.setUI({
    mode: "custom",
    btn: buttonHandle,
    touch: touchHandle,
    swipe: swipeHandle, // Added swipe handler
  });
  
  print(`Starting RefBit App Version ${appversion}`);
  Bangle.buzz(100, 0.1);
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(5);
  
  if (DEBUG_MODE) {
    print("--- DEBUG MODE ACTIVE ---");
    ar1.isConnected = true;
    ar2.isConnected = true;
  } else {
    connectToDevice(ar1);
    setTimeout(() => connectToDevice(ar2), 5000);
  }
  
  draw();
}

init();
