import { WebSocket } from 'ws';

const ws = new WebSocket('ws://localhost:3002/ws?token=mock_token_or_none');

ws.on('open', () => {
  console.log('Connected to WS');
  ws.send(JSON.stringify({
    type: "SAVE_ENTITY",
    requestId: "123",
    payload: {
      path: "authors",
      entityId: "100",
      status: "new",
      values: { name: "Test WS", email: "   ws_test@me.com   " }
    }
  }));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  ws.close();
});

ws.on('error', (err) => {
  console.error("WS Error:", err);
});
