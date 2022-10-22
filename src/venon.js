const venom = require('venom-bot');

venom
  .create({
    session: 'session-name', //name of session
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {
    client.onMessage((message) => {
        console.log(message)
    });

    venom.create({
        session: 'session-name',
        multidevice: true,
        })
    .then((client) => {
        console.log('new client')
    })
}