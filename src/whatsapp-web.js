const qrcode = require('qrcode-terminal');

const { Client, LocalAuth,  } = require('whatsapp-web.js');

async function initializeClient1(){
    const client = new Client({ authStrategy: new LocalAuth({ clientId: 'jamal' }) });
    
    client.on('qr', qr => {
        qrcode.generate(qr, {small: true});
    });
    
    client.on('ready', () => {
        console.log('client is ready')
    });

    client.on('authenticated', (session) => {
        console.log(session)
    })
    
    client.on('message', message => {
        if(!message.isStatus){
            console.log(message);
        }
    });
     
    await client.initialize();
}

async function initializeClient2(){
    const client2 = new Client({ authStrategy: new LocalAuth({ clientId: 'jamal' }) });

    client2.on('authenticated', (session) => {
        console.log('client 2 is authenticated')
    })

    client2.on('ready', () => {
        console.log('client 2 is ready')
    });
    
    await client2.initialize();
}

initializeClient1()
//initializeClient2()