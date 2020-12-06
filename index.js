const { Client, Location } = require('whatsapp-web.js');
const fs = require('fs');
var connect = require('./database/config');
var text = require('./text');
const { c } = require('./text');

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) console.error(err);
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    function setTable(v1, v2, v3, ing, art){
        var line = '', cv1 = '', cv2 = '', cv3 = '',  cing = '', cart = '';
    }
    if (msg.body == 'assalamualaikum' || msg.body == 'Assalamualaikum') {
        client.sendMessage(msg.from, 'Waalaikumsalam');
    }else if(msg.body.startsWith('/search ')){
        let word = msg.body.split(' ')[1];
        var sql = `SELECT * FROM word WHERE verb1='${word}' OR verb2='${word}' OR verb3='${word}' OR ing='${word}' OR arti='${word}'`;
        connect.query(sql, function(err, kata){
            if(err) throw err;
            if(kata.length > 0){
                client.sendMessage(msg.from, 
`Verb 1    : ${kata[0].verb1}
Verb 2    : ${kata[0].verb2}
Verb 3    : ${kata[0].verb3}
Verb+ing: ${kata[0].ing}
Artinya   : ${kata[0].arti}`
                );
            }else{
                client.sendMessage(msg.from, `Maaf kata kerja *${word}* tidak ada`);
                var sql1 = `SELECT * FROM word WHERE verb1 LIKE '%${word}%'`;
                connect.query(sql1, function(err, suggest){
                    if(err) throw err;
                    if(suggest.length > 0){
                        var wSuggest = '';
                        for(i=0; i < suggest.length; i++){
                            var text = suggest[i].verb1;
                            if(i == suggest.length-1)  wSuggest += text+"." 
                                wSuggest += text+', ';
                        }
                        client.sendMessage(msg.from,
`Kata yang tersedia untuk *${word}*:
 ${wSuggest}`);
                    }
                });
            }
        });
    }else if(msg.body.startsWith('/make ')){
        let nama = msg.body.split(' ')[1];
        let phuruf = nama.split('');
        var bar1 = '', bar2 = '', bar3 = '', bar4 = '', bar5 = '', bar6 = '', garis = '';
        console.log(phuruf);
        phuruf.forEach((huruf) => {
            garis += '▄▀▄▀';
            bar1 += text[huruf][0]; 
            bar2 += text[huruf][1]; 
            bar3 += text[huruf][2]; 
            bar4 += text[huruf][3]; 
            bar5 += text[huruf][4]; 
            bar6 += text[huruf][5]; 
        });
        // while (bar1.length <= garis.length) {
        //     garis = garis.substr(0,bar1.length);
        // }
        client.sendMessage(msg.from, 
`${garis}
${bar1}
${bar2}
${bar3}
${bar4}
${bar5}
${bar6}
${garis}`);
    }else if (msg.body == '/info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            App name: ${info.pushname}
            Author: Jang Ebe 15
            My number: ${info.me.user}
            Platform: ${info.platform}
            WhatsApp version: ${info.phone.wa_version}
        `);
    }else if(msg.body == '/clear'){

    }else if(msg.body == '/help'){
        client.sendMessage(msg.from, 
`
▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄
──╔═╗──────╔══╗────╔══╗─────
──╚╗║──────║╔═╬╗───║─╬║─╔╗──
─╔╗║╠═╦═╦═╗║╔╝║╚╦═╗║─═╬═╣╚╗─
─║╚╝║╬║║║╬║║╚═╣╬║╦╣║─╬║╬║╔╝─
─╚══╩╩╩╩╬╦║╚══╩═╩═╝╚══╩═╩╝──
────────╚═╝─────────────────
▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄▀▄

╔☞ *Deskripsi Bot*
║ ~ Untuk menemukan verb 1, 2, 3 dan artinya
║ ~ Kata kerja tersedia 999 kata kerja
║ ~ Memberi saran menambahkan kata kerja
║ ~ Membuat tulisan keren
║
╚╦═☞ *Untuk perintah-perintahnya*:
─╠═☞ *assalamualaikum*
─║
─╠╦═☞ */info*
─║╚☞ _Informasi mengenai bot ini_
─║
─╠╦═☞ */search* <kata kerja>
─║╚☞ _Contoh: /search eat_
─║
─╠╦═☞ */suggest* verb1,verb2,verb3,arti
─║╚☞ _Contoh: /suggest eat,ate,eaten,makan_
─║
─╠╦═☞ */make* <nama>
─║╚☞ _Membuat style nama keren_
─║
─╚══☞ */help*`);
    }else{
        client.sendMessage(msg.from, `Maaf! perintah yang anda ketik tidak tersedia..
Silahkan ketik perintah */help* untuk melihat perintah-perintah yang tersedia.`);
    }
});

client.initialize();