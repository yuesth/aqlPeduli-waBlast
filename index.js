
const { Client } = require('whatsapp-web.js');
const qrCode = require('qrcode-terminal');
const qrcode2 = require('qrcode');
const fs = require('fs')
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const SESSION_FILE_PATH = __dirname + '/wa-session.json';
const port = process.env.PORT || 8080
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: true, executablePath: '/home/aql/aqlPeduli-waBlast/node_modules/puppeteer/.local-chromium/linux-818858/chrome-linux/chrome', args: ['--no-sandbox', '--disable-setuid-sandbox'] }, session: sessionCfg });

client.initialize();

app.get('/wa-blast', (req,res)=>{
    res.write("<center><h1> Selamat datang di WA Blast silahkan login dengan klik dibawah ini melalui QR code</h1> <br/> <a href='https://admin-donasi.aqlpeduli.or.id/wa-blast/getqr'>Generate QR code</a></center>")
    res.end()
})

app.get('/wa-blast/getqr', cors(), (req, res) => {
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
            msg.reply("Assalamu'alaikum Warrohmatullohi wabarokatuh")
        }
	if(msg.body == "ready"){
	    msg.reply("AQL - Kemanusiaan, Relawan, dan Kepedulian")
	}
    });
})

app.get('/wa-blast/send-meesage/:donatur/:nohp/:namakepedulian', cors(), (req, res) => {
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
    const text = `Halo ${donatur},\n\n\
Terima kasih sudah mau berdonasi untuk penggalangan ${namakeped}. Anda juga dapat berdonasi untuk program kepedulian lainnya di aqlpeduli.or.id/kepedulian.\n\n\
Untuk konfirmasi donasi dan jika ada pertanyaan lebih lanjut dapat langsung menghubungi kami di wa.me/6282239193515.\n\n\
Salam Hangat,\n\
AQL Peduli`;
    client.sendMessage(nohp, text);
    res.end(`sending message to ${nohp} success`)
})

app.post('/wa-blast/send-message', cors(), (req, res) => {
    const donatur = req.body.donatur;
    var nohp = req.body.nohp;
    const namakeped = req.body.namakepedulian;
    const jumlah = req.body.jumlah;
    const norek = req.body.norek;
    var arrMsg = []
    var strtMsg = ""
    console.log(norek)
    for(var i=0; i<norek.length; i++){
    	arrMsg[i] = "Bank " + norek[i].bank + "\n" + norek[i].norek + "\n"
    }
    var allRekMsg = ""
     norek.length > 1 ? allRekMsg = `${arrMsg[0]} \n atau \n\n ${arrMsg[1]} \n` : allRekMsg = `${arrMsg[0]} \n`
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
    const text = `Assalamu'alaikum ${donatur},\n\n\
Maa syaa Allah, terima kasih sudah mau berdonasi untuk penggalangan ${namakeped}.\n\nYuk lanjutkan kebaikan ini, dengan selanjutnya melakukan transfer sebesar Rp.${jumlah} ke: \n\n ${allRekMsg}Atas nama: Yayasan Pusat Peradaban Islam\n\n Untuk konfirmasi donasi dan pertanyaan lebih lanjut dapat langsung menghubungi kami di wa.me/6285693602334.\n\n\
Wassalamu'alaikum,\n\
AQL Peduli`;
    client.sendMessage(nohp, text);
    res.end(`sending message to ${nohp} success`)
})

app.post('/wa-blast/send-message-from-admin', cors(), (req, res) => {
    const donatur = req.body.donatur;
    const namakeped = req.body.namakepedulian;
    const jumlah = req.body.jumlah;
    var nohp = req.body.nohp;
    var arrMsg = []
    var strtMsg = ""
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
    const text = `Jazaakallahu khair ${donatur},\n\n\
Alhamdulillah Tabaarakallah, donasi kamu untuk kepedulian ${namakeped} telah kami terima sebesar ${jumlah}.\n\n \
Terima kasih atas donasi Kepeduliannya. Semoga menjadi amal jariyah dan mendapat keberkahan atas apa yang Anda berikan.\n\n \
Baarakallahu laka fii ahlika wa maalika\n\n\
'Semoga Allah memberkahimu dalam keluarga dan hartamu." (HR. Bukhari)\n\n\
Yuk teruskan rantai kebaikan ini dengan mengajak teman Anda ikut berdonasi melalui aqlpeduli.or.id/kepedulian.\n\n\
Wassalamu'alaikum,\n\
AQL Peduli`;
    client.sendMessage(nohp, text);
    res.end(`sending message from admin to ${nohp} success`)
})


app.post('/wa-blast/send-message-for-relawan', cors(), (req, res) => {
    const text = req.body.message;
    var nohp = req.body.allNohp
    for(var n=0; n<nohp.length; n++){
    if (nohp[n].startsWith('0')) {
        nohp[n] = '62' + nohp[n].substr(1) + "@c.us";
    }
    else if(nohp[n].startsWith('+')){
        nohp[n] = nohp[n].substring(1) + "@c.us";
    }
    else{
        nohp[n] = nohp[n] + "@c.us";
    }
    }
    // const text = `Assalamu'alaikum, silahkan berdonasi untuk ${linkshare} melalui https://aqlpeduli.or.id versi 2`;
    for(var i=0; i<nohp.length; i++){
        client.sendMessage(nohp[i], text);
    }
    res.end(`sending message for relawan to ${nohp} success`)
})

app.listen(port, "0.0.0.0", () => {
    console.log(`server running on ${port}...`)
})
