
const { Client } = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const qrcode2 = require('qrcode');
const fs = require('fs')
const express = require('express');
const cors = require('cors')

const app = express();
app.use(cors())
const SESSION_FILE_PATH = './wa-session.json';
const port = process.env.PORT || 8080
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }, session: sessionCfg });

client.initialize();

app.get('/', (req,res)=>{
    res.write("<center><h1> Selamat datang di WA Blast silahkan login dengan klik dibawah ini melalui QR code</h1> <br/> <a href='http://admin-donasi.aqlpeduli.or.id:8001/getqr'>Generate QR code</a></center>")
    res.end()
})

app.get('/getqr', cors(), (req, res) => {
    client.on('qr', async (qr) => {
        var gambar = await qrcode2.toDataURL(qr);
        var body = "<center><img src='" + gambar + "'></img><br/>Silahkan Scan QR code untuk admin (hanya sekali)<br/>Jika sudah login, silahkan kembali ke <a href='https://admin-donasi.aqlpeduli.or.id/dashboard'>Back to admin</a></center>";
        res.write(body);
        res.end();
    });

    client.on('authenticated', async (session) => {
        console.log('AUTHENTICATED', session);
        sessionCfg = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
            if (err) {
                console.error(err);
            }
        });
        res.end("sudah login")
    });

    client.on('ready', async () => {
        console.log("login berhasil")
    });

    client.on('message', async msg => {
        if (msg.body == "tes") {
            msg.reply('123')
        }
        if (msg.body == "halo") {
            msg.reply("apa kabar?")
        }
    });
})

app.get('/send-meesage/:donatur/:nohp/:namakepedulian', cors(), (req, res) => {
    const donatur = req.params.donatur
    var nohp = req.params.nohp
    const namakeped = req.params.namakepedulian;
    if (nohp.startsWith('0')) {
        nohp = '62' + nohp.substr(1) + "@c.us";
    }
    else if(nohp.startsWith('+')){
        nohp = nohp.substring(1) + "@c.us";
    }
    else{
        nohp = nohp + "@c.us";
    }
    // const text = `Assalamu'alaikum, silahkan berdonasi untuk ${linkshare} melalui https://aqlpeduli.or.id versi 2`;
    const text = `Halo ${donatur},\
    Terima kasih sudah mau berdonasi untuk penggalangan ${namakeped}. Anda juga dapat berdonasi untuk program kepedulian lainnya di aqlpeduli.or.id/kepedulian.\
    \
    Untuk konfirmasi donasi dan jika ada pertanyaan lebih lanjut dapat langsung menghubungi kami di wa.me/6282239193515.\
    \
    Salam Hangat,\
    AQL Peduli`;
    client.sendMessage(nohp, text);
    res.end(`sending message to ${nohp} success`)
})

app.listen(port, "0.0.0.0", () => {
    console.log(`server running on ${port}...`)
})