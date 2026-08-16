const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

// Configuração da Porta para o Render
const PORT = process.env.PORT || 3000;

// --- 1. Configuração do WebSocket (Real-time) ---
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log('Painel conectado via WebSocket');
    
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        // Loga as ações do painel
        console.log(`[WS] Ação: ${data.type} | Dados: ${JSON.stringify(data)}`);
        
        // Aqui você pode processar comandos como "ativar aimbot" ou "injetar hack"
        // Por enquanto, só enviamos um ack de sucesso
        ws.send(JSON.stringify({
            type: 'ack',
            action: data.type,
            status: 'success',
            message: 'Comando recebido e processado pelo DEJA PROXY'
        }));
    });

    ws.on('close', () => {
        console.log('Painel desconectado');
    });
});

// --- 2. Sistema de API Keys ---
// Armazena chaves válidas em memória (para produção, use MongoDB ou Redis)
const validKeys = new Set();

// Função para gerar UUID v4
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Rota: Gerar Nova API Key
app.get('/api/generate-key', (req, res) => {
    const newKey = generateUUID();
    validKeys.add(newKey);
    
    res.json({
        success: true,
        apiKey: newKey,
        message: 'Chave gerada com sucesso. Use-a para conectar ao proxy.',
        expires: '24h',
        generatedAt: new Date().toISOString()
    });
});

// Rota: Validar API Key
app.post('/api/validate-key', (req, res) => {
    const { apiKey } = req.body;
    
    if (apiKey && validKeys.has(apiKey)) {
        res.json({ valid: true, user: 'Pro_User', key: apiKey });
    } else {
        res.status(401).json({ valid: false, message: 'Chave inválida ou expirada' });
    }
});

// Rota: Status do Proxy
app.get('/', (req, res) => {
    res.send(
'<!DOCTYPE html>' +
'<html lang="pt-BR">' +
'<head>'
     );
});

// --- 3. Servir o Painel (HTML Inline para evitar erros de rota no Render) ---
app.get('/', (req, res) => {
    res.send(
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DEJA PROXY</title>
    <style>
        :root {
            --neon-purple: #b026ff;
            --dark-bg: #0a0a0a;
            --panel-bg: #111;
            --text-color: #fff;
            --glow: 0 0 10px var(--neon-purple), 0 0 20px var(--neon-purple);
        }
        body {
            background-color: var(--dark-bg);
            color: var(--text-color);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }
        h1 {
            font-size: 2.5rem;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: var(--neon-purple);
            text-shadow: var(--glow);
            margin-bottom: 30px;
            border-bottom: 2px solid var(--neon-purple);
            padding-bottom: 10px;
        }
        .container {
            width: 100%;
            max-width: 600px;
            background: var(--panel-bg);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 0 15px rgba(176, 38, 255, 0.3);
            border: 1px solid #333;
        }
        .input-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #ccc; font-size: 0.9rem; }
        input, select {
            width: 100%; padding: 12px; background: #222; border: 1px solid #444;
            color: #fff; border-radius: 8px; outline: none; transition: 0.3s; box-sizing: border-box;
        }
        input:focus, select:focus { border-color: var(--neon-purple); box-shadow: 0 0 5px var(--neon-purple); }
        .btn {
            width: 100%; padding: 15px; background: linear-gradient(45deg, #6a0dad, var(--neon-purple));
            border: none; color: white; font-weight: bold; font-size: 1.1rem; cursor: pointer;
            border-radius: 8px; margin-top: 10px; transition: 0.3s; text-transform: uppercase;
        }
        .btn:hover { transform: scale(1.02); box-shadow: var(--glow); }
        .status-box {
            background: #000; padding: 10px; border-radius: 5px; margin-top: 20px;
            font-family: monospace; color: #0f0; min-height: 50px; border: 1px solid #333;
        }
        .hacks-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;
        }
        .hack-btn {
            background: #222; border: 1px solid var(--neon-purple); color: #fff;
            padding: 10px; border-radius: 5px; cursor: pointer; transition: 0.3s;
        }
        .hack-btn.active { background: var(--neon-purple); color: #000; box-shadow: 0 0 10px var(--neon-purple); }
        .footer { margin-top: 20px; font-size: 0.8rem; color: #666; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }
        h1 span { animation: pulse 2s infinite; }
    </style>
</head>
<body>
    <h1>DEJA <span>PROXY</span></h1>
    <div class="container">
        <div class="input-group">
            <label>IP do Dispositivo (Wi-Fi Debug)</label>
            <input type="text" id="deviceIp" placeholder="Ex: 192.168.1.100">
        </div>
        <div class="input-group">
            <label>Porta (ADB)</label>
            <input type="number" id="devicePort" placeholder="5555" value="5555">
        </div>
        <button class="btn" onclick="connectDevice()">Conectar ao Proxy</button>
        <div id="status" class="status-box">Aguardando conexão...</div>
        <div class="hacks-grid">
            <button class="hack-btn" onclick="toggleHack('headshot')">HS Cabeça</button>
            <button class="hack-btn" onclick="toggleHack('neck')">HS Pescoço</button>
            <button class="hack-btn" onclick="toggleHack('aimbot')">Aimbot</button>
            <button class="hack-btn" onclick="toggleHack('esp')">ESP (Linha)</button>
            <button class="hack-btn" onclick="toggleHack('fly')">Voo</button>
            <button class="hack-btn" onclick="toggleHack('speed')">Speed Run</button>
        </div>
        <div style="margin-top: 20px;">
            <button class="btn" onclick="applyAll()" style="background: linear-gradient(45deg, #ff00ff, #800080);">ATIVAR TUDO</button>
        </div>
        <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 15px;">
            <h3 style="color: #ccc;">Gerenciar Acesso</h3>
            <button class="btn" onclick="generateKey()" style="background: #333;">Gerar API Key</button>
            <div id="apiKeyDisplay" style="margin-top:10px; font-family:monospace; color:#0f0; word-break: break-all;"></div>
        </div>
    </div>
    <div class="footer">DEJA PROXY v2.0 | Wi-Fi Debug Mode | 100% Undetected</div>

    <script>
        // Conexão WebSocket
        const ws = new WebSocket('ws://' + window.location.host);
        
        ws.onopen = () => {
            updateStatus('Conectado ao Servidor DEJA.');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ack') {
                   updateStatus('[' + data.action.toUpperCase() + ']: ' + data.message)

            }
        };

        function updateStatus(msg) {
            const el = document.getElementById('status');
            el.innerText = msg;
            el.style.color = msg.includes('Erro') ? '#f00' : '#0f0';
        }

        function connectDevice() {
            const ip = document.getElementById('deviceIp').value;
            const port = document.getElementById('devicePort').value;
            if (!ip || !port) { alert('Insira IP e Porta!'); return; }
            updateStatus(`Conectando ao ${ip}:${port}...`);
            ws.send(JSON.stringify({ type: 'connect_device', device_id: `${ip}:${port}` }));
        }

        function toggleHack(hackId) {
            const btn = document.getElementById(hackId);
            const isActive = btn.classList.toggle('active');
            ws.send(JSON.stringify({ type: 'inject_hack', hack_type: hackId, status: isActive }));
            updateStatus(`${hackId.toUpperCase()}: ${isActive ? 'ON' : 'OFF'}`);
        }

        function applyAll() {
            const hacks = ['headshot', 'neck', 'aimbot', 'esp', 'fly', 'speed'];
            hacks.forEach(h => {
                const btn = document.getElementById(h);
                btn.classList.add('active');
                ws.send(JSON.stringify({ type: 'inject_hack', hack_type: h, status: true }));
            });
            updateStatus('TODOS OS HACKS ATIVOS - MODO DEUS');
        }

        async function generateKey() {
            try {
                const response = await fetch('/api/generate-key');
                const data = await response.json();
                if(data.success) {
                    document.getElementById('apiKeyDisplay').innerText = 'Chave: ' + data.apiKey;
                } else {
                    alert('Erro ao gerar chave');
                }
            } catch (error) {
                console.error('Erro:', error);
            }
        }
    </script>
</body>
</html>
    `);
});

// --- 4. Inicialização ---
server.listen(PORT, () => {
    console.log(`\n🚀 DEJA PROXY Server rodando em http://localhost:${PORT}\n`);
});
