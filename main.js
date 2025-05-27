// main.js
let device, server, tpmsService;
const connectBtn = document.getElementById('connectBtn');
const scanBtn = document.getElementById('scanBtn');
const saveBtn = document.getElementById('saveBtn');
const statusDiv = document.getElementById('status');
const tpmsList = document.getElementById('tpmsList');
let discoveredTPMS = [];
let selectedTPMS = [];

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
    // Simulate scan: Replace with BLE characteristic read/write as needed
    setTimeout(() => {
        discoveredTPMS = [
            { id: 'TPMS-1', name: 'TPMS Module 1' },
            { id: 'TPMS-2', name: 'TPMS Module 2' }
        ];
        discoveredTPMS.forEach(tpms => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tpms.id;
            checkbox.onchange = (e) => {
                if (e.target.checked) {
                    selectedTPMS.push(tpms);
                } else {
                    selectedTPMS = selectedTPMS.filter(t => t.id !== tpms.id);
                }
                saveBtn.disabled = selectedTPMS.length === 0;
            };
            li.appendChild(checkbox);
            li.appendChild(document.createTextNode(' ' + tpms.name));
            tpmsList.appendChild(li);
        });
        statusDiv.textContent = 'Scan complete.';
    }, 1500);
};

saveBtn.onclick = async () => {
    statusDiv.textContent = 'Saving selected modules to ESP32...';
    // Simulate save: Replace with BLE write as needed
    setTimeout(() => {
        statusDiv.textContent = 'Saved ' + selectedTPMS.length + ' module(s) to ESP32.';
    }, 1000);
};
