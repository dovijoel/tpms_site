// main.js
let device, server, tpmsService;
const connectBtn = document.getElementById('connectBtn');
const scanBtn = document.getElementById('scanBtn');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');
const tpmsList = document.getElementById('tpmsList');
let discoveredTPMS = [];
let selectedTPMS = [];

// UUIDs for TPMS BLE service and characteristics
const TPMS_SERVICE_UUID = '28f55143-64f6-4806-a9a9-dd3eb0e78faf';
const SNIFFED_DEVICES_CHAR_UUID = 'e87b4980-2aa7-4f8e-8ed1-7b61da4f9f99';
const TIRE_CHAR_UUIDS = [
    'e87b4980-2aa7-4f8e-8ed1-7b61da4f9f41',
    'e87b4980-2aa7-4f8e-8ed1-7b61da4f9f42',
    'e87b4980-2aa7-4f8e-8ed1-7b61da4f9f43',
    'e87b4980-2aa7-4f8e-8ed1-7b61da4f9f44'
];

let sniffedDevices = [];
let tireAssignments = [null, null, null, null];

connectBtn.onclick = async () => {
    statusDiv.textContent = 'Requesting ESP32 device...';
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [{ namePrefix: 'ESP32' }],
            optionalServices: ['battery_service', 'device_information', '0000ffe0-0000-1000-8000-00805f9b34fb'] // Add your custom service UUID
        });
        statusDiv.textContent = 'Connecting...';
        server = await device.gatt.connect();
        statusDiv.textContent = 'Connected to ESP32!';
        scanBtn.disabled = false;
    } catch (error) {
        statusDiv.textContent = 'Connection failed: ' + error;
    }
};

scanBtn.onclick = async () => {
    statusDiv.textContent = 'Scanning for TPMS modules...';
    tpmsList.innerHTML = '';
    discoveredTPMS = [];
    selectedTPMS = [];
    try {
        if (!server) {
            statusDiv.textContent = 'Not connected to ESP32.';
            return;
        }
        tpmsService = await server.getPrimaryService(TPMS_SERVICE_UUID);
        const sniffedChar = await tpmsService.getCharacteristic(SNIFFED_DEVICES_CHAR_UUID);
        const value = await sniffedChar.readValue();
        const jsonStr = new TextDecoder().decode(value.buffer);
        sniffedDevices = JSON.parse(jsonStr);
        tpmsList.innerHTML = '';
        sniffedDevices.forEach((dev, idx) => {
            const li = document.createElement('li');
            li.textContent = `Serial: ${dev.serial}, Desc: ${dev.desc}`;
            // Tire assignment dropdown
            const select = document.createElement('select');
            select.innerHTML = '<option value="">Assign to tire...</option>' +
                ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'].map((t, i) => `<option value="${i}">${t}</option>`).join('');
            select.onchange = async (e) => {
                const tireIdx = parseInt(e.target.value);
                if (!isNaN(tireIdx)) {
                    tireAssignments[tireIdx] = dev.serial;
                    // Write assignment to ESP32
                    const tireChar = await tpmsService.getCharacteristic(TIRE_CHAR_UUIDS[tireIdx]);
                    await tireChar.writeValue(new TextEncoder().encode(dev.serial));
                    statusDiv.textContent = `Assigned ${dev.serial} to ${select.options[tireIdx+1].text}`;
                }
            };
            li.appendChild(select);
            tpmsList.appendChild(li);
        });
        statusDiv.textContent = 'Scan complete.';
    } catch (err) {
        statusDiv.textContent = 'Scan failed: ' + err;
    }
};

saveBtn.onclick = async () => {
    statusDiv.textContent = 'Saving tire assignments to ESP32...';
    // Optionally, trigger a save characteristic or just rely on tire assignments
    setTimeout(() => {
        statusDiv.textContent = 'Tire assignments sent to ESP32.';
    }, 1000);
};

// Add a function to read current tire assignments
async function readTireAssignments() {
    if (!server) return;
    tpmsService = await server.getPrimaryService(TPMS_SERVICE_UUID);
    let assignments = [];
    for (let i = 0; i < 4; ++i) {
        const tireChar = await tpmsService.getCharacteristic(TIRE_CHAR_UUIDS[i]);
        const value = await tireChar.readValue();
        assignments[i] = new TextDecoder().decode(value.buffer);
    }
    return assignments;
}
