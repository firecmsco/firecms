import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:5173');

ws.on('open', () => {
    console.log('connected');
    
    // Send arbitrary message to cause an error that might trigger things, or actually send SAVE_ENTITY
    ws.send(JSON.stringify({
        type: 'SAVE_ENTITY',
        requestId: '123',
        payload: {
            path: 'posts',
            entityId: '1',
            status: 'existing',
            values: {
                content: 'Test content ' + Date.now(),
                // Try changing an author relation for instance.
                author: [{ id: '1' }] 
            }
        }
    }));
});

ws.on('message', (data) => {
    console.log('received:', data.toString());
    ws.close();
});
