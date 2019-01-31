let puppeteer = require("puppeteer");
let app = require("express")();
let fetch = require("node-fetch");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let urlLib = require("url");
let https = require("https");

let browser = null;
let page = null;
const ytdl = require('ytdl-core');

// (async () => {
//   browser = await puppeteer.launch({ slowMo: 1000, headless: true/*, executablePath: "C:/Users/Pedro P Rodriguez/AppData/Local/Google/Chrome/Application/chrome.exe"*/ });
//   page = await browser.newPage();
//   console.log("Browser ready");
// })();

function writeHtmlToFile(html) {
  fs.writeFile(path.resolve(__dirname, "./indexTest.html"), html, (err) => {
    if (err) console.log(err.message);
    else console.log("HTML saved");
  });
}

function readHtmlFromFile() {
  return fs.readFileSync(path.resolve(__dirname, "./indexTest.html"));
}

app.get("/audio2", async (req, res) => {
  console.log("objec");
  res.header("Content-Ranges", "bytes");
  res.header("Content-Type", "audio/mpeg");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.status(206);

  let stream = fs.createReadStream(__dirname + "/bl.mp3");
  stream.on("data", (chunk) => {
    res.write(chunk);
  });
});

app.get("/audio", async (req, res) => {
  res.header("Content-Ranges", "bytes");
  res.header("Content-Type", "audio/mpeg");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.status(206);

  const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
  const ffmpeg = require('fluent-ffmpeg');
  ffmpeg.setFfmpegPath(ffmpegPath);

  let link = "https://www.youtube.com/watch?v=" + req.query.id;
  // let link = "https://www.youtube.com/watch?v=By_Cn5ixYLg"

  let stream = ytdl(link, {
    quality: '171'
  });

  stream.on('info', (info, format) => {
    var parsed = urlLib.parse(format.url);
    parsed.method = 'HEAD';
    https.request(parsed, (r) => {
      res.header("Content-Length", r.headers['content-length']);
    }).end();
  });

  stream.on("progress", (chunkSize, totalDownloaded, totalAudioSize) => {
    console.log(`Chunk size: ${chunkSize / 1000000}MB - Total downloaded: ${totalDownloaded / 1000000}MB - Total size: ${totalAudioSize / 1000000}MB`)
    // console.log(req.headers);
  });
  // stream.pipe(res);
  ffmpeg(stream).audioBitrate(128).save(__dirname + "/bl.mp3");
});

app.get("/", async (req, res) => {
  console.log("Song request");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  await page.goto("https://www.youtube.com/results?sp=EgIQAQ%253D%253D&search_query=" + req.query.search);

  let html = await page.content();

  // writeHtmlToFile(html);

  let $ = cheerio.load(html);

  class video {
    constructor(title, id, thumbnail, duration) {
      this.title = title;
      this.id = id;
      this.thumbnail = thumbnail;
      this.duration = duration;
    }
  }

  let results = [];

  $("#dismissable.ytd-video-renderer.style-scope").toArray().forEach((v) => {
    if ($(".style-scope.ytd-thumbnail-overlay-time-status-renderer", v).length > 0 && $("#img.style-scope.yt-img-shadow", v).attr("src") !== undefined) {
      let title = $("a#video-title", v).text().trim();
      let id = $("a#thumbnail", v).attr("href").substring($("a#thumbnail", v).attr("href").indexOf("=") + 1);
      let duration = $(".style-scope.ytd-thumbnail-overlay-time-status-renderer", v).first().text().trim();
      let thumbnail = $("#img.style-scope.yt-img-shadow", v).attr("src");

      results.push(new video(title, id, thumbnail, duration));
    }
  });

  res.send(results);
  res.end();
});

app.listen(8080);