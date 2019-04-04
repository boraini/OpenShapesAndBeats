/*
 * https://github.com/endlesshack/youtube-video youtube-video.js
 * Eliminated JQuery
 */
(function() {
  window.YoutubeVideo = function(id, callback) {
    var xhttp;
    xhttp=new XMLHttpRequest();
    xhttp.onreadystatechange = (function(id, callback) {
      if (this.readyState == 4 && this.status == 200) {
        var video;
        video = YoutubeVideo.decodeQueryString(this.responseText);
        if (video.status === "fail") {
          return callback(video);
        }
        video.sources = YoutubeVideo.decodeStreamMap(video.url_encoded_fmt_stream_map);
        video.getSource = function(type, quality) {
          var exact, key, lowest, source, _ref;
          lowest = null;
          exact = null;
          _ref = this.sources;
          for (key in _ref) {
            source = _ref[key];
            if (source.type.match(type)) {
              if (source.quality.match(quality)) {
                exact = source;
              } else {
                lowest = source;
              }
            }
          }
          return exact || lowest;
        };
        return callback(video);
      }
    }).bind(xhttp, id, callback);
    //xhttp.open("GET", "http://www.youtube.com/get_video_info?video_id=" + id, true);
    xhttp.open("GET", "https://jsonp.afeld.me/?callback=?&url=http://www.youtube.com/get_video_info?video_id=" + id, true);
    //xhttp.open("GET", "https://crossorigin.me/http://www.youtube.com/get_video_info?video_id=" + id, true);
    xhttp.send();
  };
  window.YoutubeVideo.decodeQueryString = function(queryString) {
    var key, keyValPair, keyValPairs, r, val, _i, _len;
    r = {};
    keyValPairs = queryString.split("&");
    for (_i = 0, _len = keyValPairs.length; _i < _len; _i++) {
      keyValPair = keyValPairs[_i];
      key = decodeURIComponent(keyValPair.split("=")[0]);
      val = decodeURIComponent(keyValPair.split("=")[1] || "");
      r[key] = val;
    }
    return r;
  };
  window.YoutubeVideo.decodeStreamMap = function(url_encoded_fmt_stream_map) {
    var quality, sources, stream, type, urlEncodedStream, _i, _len, _ref;
    sources = {};
    _ref = url_encoded_fmt_stream_map.split(",");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      urlEncodedStream = _ref[_i];
      stream = YoutubeVideo.decodeQueryString(urlEncodedStream);
      type = stream.type.split(";")[0];
      quality = stream.quality.split(",")[0];
      stream.original_url = stream.url;
      stream.url = "" + stream.url + "&signature=" + stream.sig;
      sources["" + type + " " + quality] = stream;
    }
    return sources;
  };
}).call(this);
//End of https://github.com/endlesshack/youtube-video
window.onload = function() {
  canvas = document.getElementById("game");
  context = canvas.getContext("2d");
  scaling = canvas.width / 1280;
  if ((() => {try {
    document.createEvent("TouchEvent");
    return true;
  } catch (e) {
    return false;
  }})()) {
    window.addEventListener("touchmove", handleTouch);
  }
  if ((() => {try {
    document.createEvent("MouseEvent");
    return true;
  } catch (e) {
    return false;
  }})()) {
    window.addEventListener("mousemove", handleMouse);
  }
  window.addEventListener("keydown", handleKeyDown);
  if (window.location.href.split("#")[1]) {
    YoutubeVideo(window.location.href.split("#")[1], loadGame);
    //loadGame({getSource: function() {return {url: "testvideo.mp4"};}});
  }
  else {
    loadMenu();
  }
};
var canvas;
var context;
var video;
var videoSource;
function loadGame(vid) {
  console.log(vid.title);
  if (!video) video = document.createElement("video");
  if (!videoSource) videoSource = document.createElement("source");
  //Disposal of old video not confirmed.
  videoSource.src = vid.getSource("video/mp4", "small").url;
  videoSource.type = "video/mp4";
  video.setAttribute("autoplay", "");
  video.appendChild(videoSource);
  pos = {x: 0, y: 0};
  health = 5;
  lastPlayTime = 0;
  drawHackScreen();
}
var animLast;
var animDur = 3000;
var frequency = 2 * Math.PI / 2000;
var amplitude = 40 * (Math.PI / 180);
var playerColor = "rgb(40, 140, 189)";
var playerColor2 = "rgb(16, 53, 71)";
var evilColor = "rgb(179, 46, 120)";
var scaling;
var loadingCharacterSize = 100;
var frozenImage;
function drawHackScreen(t) {
  if (t) {
    let animTime = Math.sin(frequency * t);
    context.setTransform(scaling, 0, 0, scaling, 0, 0); //normalize to 720p
    //context.clearRect(0, 0, 1280, 720);
    context.drawImage(frozenImage, 0, 0, 1280, 720);
    if (animTime > 0) {
      context.translate(canvas.width / scaling / 2 + loadingCharacterSize / 2, canvas.height / scaling / 2 + loadingCharacterSize / 2);
      context.rotate(amplitude * animTime);
      context.translate(-loadingCharacterSize, 0);
    }
    else {
      context.translate(canvas.width / scaling / 2 - loadingCharacterSize / 2, canvas.height / scaling / 2 + loadingCharacterSize / 2);
      context.rotate(amplitude * animTime);
    }
    context.strokeStyle = playerColor;
    context.lineWidth = 0.10 * loadingCharacterSize;
    context.beginPath();
    //body
    context.rect(0, -loadingCharacterSize, loadingCharacterSize, loadingCharacterSize);
    //eyebrows
    context.moveTo(0.1 * loadingCharacterSize, -0.6 * loadingCharacterSize);
    context.lineTo(0.4 * loadingCharacterSize, -0.6 * loadingCharacterSize);
    context.moveTo(0.6 * loadingCharacterSize, -0.6 * loadingCharacterSize);
    context.lineTo(0.9 * loadingCharacterSize, -0.6 * loadingCharacterSize);
    //mouth
    context.moveTo(0.4 * loadingCharacterSize, -0.2 * loadingCharacterSize);
    context.lineTo(0.6 * loadingCharacterSize, -0.2 * loadingCharacterSize);
    //draw
    context.stroke();
    context.closePath();
  }
  else {
    video.pause();
    frozenImage = document.createElement("canvas");
    frozenImage.width = 1920;
    frozenImage.height = 1080;
    let ctx = frozenImage.getContext("2d");
    ctx.fillStyle = "rgb(55, 14, 25)";
    ctx.fillRect(0, 0, frozenImage.width, frozenImage.height);
    ctx.drawImage(canvas, 0, 0, frozenImage.width, frozenImage.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
  if (video.readyState < 4) {
    requestAnimationFrame(drawHackScreen);
  }
  else {
    context.setTransform(1, 0, 0, 1, 0, 0);
    promisingPlay();
    lastPlayTime = video.currentTime;
    drawGame();
  }
}
async function promisingPlay() {
  try {
    await video.play();
  }
  catch {
    alert("playback error");
  }
}
var pos = {x: 0, y: 0};
var health = 5;
var lastPlayTime = 0;
var characterSpeed = 0.5; //px per ms
var dash = false;
var dashSpeed = 150;
var dashParticleSpeed = 0.1;
var playerRadius = 8;
var waitSafe = false;
var averager = document.createElement("canvas");
averager.width = 1;
averager.height = 1;
var avgContext = averager.getContext("2d");
var particles = {
  spawnTime: [],
  life: [],
  velX: [],
  velY: [],
  posX: [],
  posY: [],
};
function drawGame() {
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  let dT = (video.currentTime - lastPlayTime) * 1000;
  lastPlayTime = video.currentTime;
  let dist = Math.sqrt((joyPos.x - pos.x) * (joyPos.x - pos.x) + (joyPos.y - pos.y) * (joyPos.y - pos.y));
  if (dist > characterSpeed * dT) {
    pos.x += (joyPos.x - pos.x) / dist * (dash ? dashSpeed : (characterSpeed * dT)) || 0;
    pos.y += (joyPos.y - pos.y) / dist * (dash ? dashSpeed : (characterSpeed * dT)) || 0;
  }
  if (!waitSafe) {
    let rm = 230|0, gm = 60|0, bm = 110|0;
    /*let data = context.getImageData(Math.round(pos.x - playerRadius), Math.round(pos.y - playerRadius), 2 * playerRadius, 2 * playerRadius).data;
    let matchScore;
    for (var p = 0; p < data.length; p++) {
      let r = data[p++];
      let g = data[p++];
      let b = data[p++];
      matchScore += 1 / ((Math.abs(1/(r - rm)) || 0) + (Math.abs(1/(g - gm)) || 0) + (Math.abs(1/(g - gm)) || 0)) || 0
    }*/
    avgContext.drawImage(canvas, Math.round(pos.x - playerRadius), Math.round(pos.y - playerRadius), 2 * playerRadius, 2 * playerRadius, 0, 0, 1, 1);
    let data = avgContext.getImageData(0, 0, 1, 1).data;
    let matchScore = (Math.abs(1/(data[0] - rm)) || 0) + (Math.abs(1/(data[1] - gm)) || 0) + (Math.abs(1/(data[2] - bm)) || 0);
    if (matchScore > 2.5) {health--; waitSafe = true; if (health <= 0) {window.requestAnimationFrame(drawHackScreen); return;}}
    else {waitSafe = false;}
  }
  if (dash) {
    for (var a = 0; a < 6; a++) {
      particles.spawnTime.push(video.currentTime);
      particles.life.push(0.5);
      particles.posX.push(pos.x);
      particles.posY.push(pos.y);
    }
    particles.velX.push(dashParticleSpeed * 1); particles.velY.push(dashParticleSpeed * 0);
    particles.velX.push(dashParticleSpeed * -1); particles.velY.push(dashParticleSpeed * 0);
    particles.velX.push(dashParticleSpeed * 0); particles.velY.push(dashParticleSpeed * 1);
    particles.velX.push(dashParticleSpeed * 0); particles.velY.push(dashParticleSpeed * -1);
    particles.velX.push(dashParticleSpeed * 0.7); particles.velY.push(dashParticleSpeed * 0.7);
    particles.velX.push(dashParticleSpeed * -0.7); particles.velY.push(dashParticleSpeed * 0.7);
    particles.velX.push(dashParticleSpeed * 0.7); particles.velY.push(dashParticleSpeed * -0.7);
    particles.velX.push(dashParticleSpeed * -0.7); particles.velY.push(dashParticleSpeed * -0.7);
  }
  dash = false;
  context.fillStyle = playerColor2;
  context.fillRect(pos.x - playerRadius, pos.y - playerRadius, 2 * playerRadius, 2 * playerRadius);
  context.fillStyle = playerColor;
  context.fillRect(pos.x - playerRadius, pos.y, Math.min(2 * playerRadius, health * playerRadius * 0.667), playerRadius);
  context.fillRect(pos.x - playerRadius, pos.y - playerRadius, Math.min(2 * playerRadius, (health - 3) * playerRadius), playerRadius);
  for (var i = 0; i < particles.spawnTime.length; i++) {
    particles.posX[i] += particles.velX[i] * dT;
    particles.posY[i] += particles.velY[i] * dT;
    let r = (1 - ((video.currentTime - particles.spawnTime[i]) / particles.life[i])) * 10;
    context.fillRect(particles.posX[i] - r, particles.posY[i] - r, 2 * r, 2 * r);
    if (video.currentTime - particles.spawnTime[i] > particles.life[i]) {
      particles.spawnTime.splice(i, 1);
      particles.life.splice(i, 1);
      particles.velX.splice(i, 1);
      particles.velY.splice(i, 1);
      particles.posX.splice(i, 1);
      particles.posY.splice(i, 1);
      i--;
    }
  }
  if (video.readyState < 4) {
    drawHackScreen();
  }
  else {
    requestAnimationFrame(drawGame);
  }
}
var joyPos = {x: 0, y: 0};
function handleTouch(e) {
  let bRect = canvas.getBoundingClientRect();
  joyPos.x = (e.touches[0].clientX - bRect.left) * canvas.width / bRect.width;
  joyPos.y = (e.touches[0].clientY - bRect.top) * canvas.height / bRect.height;
  if (e.touches[1]) {
    dash = true;
  }
}
function handleMouse(e) {
  let bRect = canvas.getBoundingClientRect();
  joyPos.x = (e.clientX - bRect.left) * canvas.width / bRect.width;
  joyPos.y = (e.clientY - bRect.top) * canvas.height / bRect.height;
}
function handleKeyDown(e) {
  if (e.keyCode == 32) dash = true;
}
