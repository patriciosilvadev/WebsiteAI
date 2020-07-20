function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
    return true;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
    return true;
  } else {
    return false;
  }
}

function gotoListeningState() {
  const micListening = document.querySelector(".mic .listening");
  const micReady = document.querySelector(".mic .ready");

  micListening.style.display = "block";
  micReady.style.display = "none";
}

function gotoReadyState() {
  const micListening = document.querySelector(".mic .listening");
  const micReady = document.querySelector(".mic .ready");

  micListening.style.display = "none";
  micReady.style.display = "block";
}

function addBotItem(text) {
  const appContent = document.querySelector(".app-content");
  appContent.innerHTML += "<div class='calloutbig'><img src='iconchatrobot-removebg-preview.png' width='45px' height='45px' class='circular--square' style='float: left;' /><div class='calloutright'>" + text + "</div><div class='message-from message-from-bot'>Siridatos đã trả lời vào: "+ new Date().toLocaleString() +"</div></div>";
}

function addUserItem(text) {
  const appContent = document.querySelector(".app-content");
  appContent.innerHTML += "<div class='calloutbig'><img src='user.png' width='45px' height='45px' class='circular--square'  style='float: right; 'margin-top: 5cm;' /><div  class='calloutleft'>" + text + "</div><div class='message-from message-from-me'></div></div>";
}

function displayCurrentTime() {
  const timeContent = document.querySelector(".time-indicator-content");
  const d = new Date();
  const s = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  timeContent.innerHTML = s;
}

function addError(text) {
  addBotItem(text);
  const footer = document.querySelector(".app-footer");
  footer.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function(event) {
  displayCurrentTime();

  // check for Chrome
  if (!isChrome()) {
    addError("<font class='Hastro' style='display: inline; color:white;font-size: 30px; -webkit-text-stroke: 2px black;'> ''Siridatos TALKING BOT'' Works Only On <a href='https://www.google.com/chrome/browser/desktop/' target='_blank' style='color: green' >CHROMIUM BASED BROWSERS</a></font>.");
    return;
  }

  if (!('speechSynthesis' in window)) {
    addError("Your browser doesnt support speech synthesis. ''Siridatos TALKING BOT'' wont work.");
    return;
  }

  if (!('webkitSpeechRecognition' in window)) {
    addError("Your browser cannot record voice due to a problem in your mic or browser, Talking bot wont work.");
    return;
  }
  const apiClient = new ApiAi.ApiAiClient({accessToken: 'https://bot.dialogflow.com/c6425da2-fa52-4090-a148-9fca59eed02e'});
  // Initial feedback message.
  addBotItem("Hi, my name is Siridatos");

  var recognition = new webkitSpeechRecognition();
  var recognizedText = null;
  recognition.continuous = false;
  recognition.onstart = function() {
    recognizedText = null;
  };
  recognition.onresult = function(ev) {
    recognizedText = ev["results"][0][0]["transcript"];

    addUserItem(recognizedText);

    let promise = apiClient.textRequest(recognizedText);

    promise
        .then(handleResponse)
        .catch(handleError);

    function handleResponse(serverResponse) {
      var timer = window.setTimeout(function() { startListening(); }, 5000);

      const speech = serverResponse["result"]["fulfillment"]["speech"];
      var msg = new SpeechSynthesisUtterance(speech);
      addBotItem(speech);
      msg.addEventListener("end", function(ev) {
        window.clearTimeout(timer);
        startListening();
      });
      msg.addEventListener("error", function(ev) {
        window.clearTimeout(timer);
        startListening();
      });

      window.speechSynthesis.speak(msg);
    }
    function handleError(serverError) {
      console.log("Error from api.ai server: ", serverError);
    }
  };

  recognition.onerror = function(ev) {
    console.log("Speech recognition error", ev);
  };
  recognition.onend = function() {
    gotoReadyState();
  };

  function startListening() {
    gotoListeningState();
    recognition.start();
  }

  const startButton = document.querySelector("#start");
  startButton.addEventListener("click", function(ev) {
    startListening();
    ev.preventDefault();
  });

  document.addEventListener("keydown", function(evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    if (isEscape) {
        recognition.abort();
    }
  });
});