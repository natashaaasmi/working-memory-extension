const bodyText = document.body.innerText;
var scrollPosition = 0; //current scroll position
var scrollHeight = 0; //total height of the page
var arrayLength = 0;
var chunksArray = [];
// var scrollFunctionType = {action:'summarize', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight};
var backgroundMsgContext = '';

function chunkText(text, chunkSize){
    var chunks = [];
    // var arrayLength = 0;
    const newText = text.split(" ");
    console.log('New text', newText)
    console.log('Type of new text:', typeof(newText));
    console.log('Length of new text:', newText.length);
    var sentence = '';
    for (let i = 0; i < newText.length; i += 1){
        // chunks.push(newText.slice(i, i + chunkSize));
        sentence += newText[i];
        console.log('Sentence:', sentence);
        if (sentence.length > chunkSize) {
            chunks.push(sentence);
            console.log(`Exceeded sentence length of ${chunkSize}:`, sentence);
            sentence = '';
        }
    }
    arrayLength = chunks.length;
    console.log('Array length:', arrayLength);
    return chunks;
}

function getPreviousText(text, scrollPosition){
    //body text length / array length
    //current scroll position -> current position in array
    //text = all previous text in array, if > 2000 words, make two calls
    const pageLength = document.body.scrollHeight;
    const x = Math.floor(pageLength / arrayLength); //chunks in length
    var multiplier = Math.floor(scrollPosition / x); //current 
    const previousChunks = chunksArray.slice(0, multiplier-1)
    console.log('Previous chunks:', previousChunks);
    var text = '';
    for (let i = 0; i < previousChunks.length; i += 1){
        for (let j = 0; j < previousChunks[i].length; j += 1){
            text += previousChunks[i][j];
        }
    }
    const numCalls = Math.floor(text.length / 6000);
    numCalls.forEach (textChunk => {
        //make call to summarize
        chrome.runtime.sendMessage({action:'summarize',bodyText:textChunk}, function(response){
            console.log('Received response from background:', response);
        });
        console.log('made summarize call to background');
    });
}

window.addEventListener('pageshow', function(){
    // console.log('window loaded');
    console.log('Page shown, content script loaded')
    console.log('First sentence', bodyText.slice(0, 100));
    console.log(document.body.scrollHeight);
    chunksArray = chunkText(bodyText, 3000);
    console.log('Array length:', arrayLength);
    chrome.runtime.sendMessage({action:'getthepoint', bodyText:bodyText.slice(0, 1000)}, function(response){
        console.log('Content Received getthepoint response from background:', response);
        console.log('Type of response:', typeof(response));
        chrome.runtime.sendMessage({action:'getthepoint', message:response},function(response){
            console.log('Received getthepoint response from popup:', response);
        });
    });
    console.log('Sent getthepoint message', bodyText.slice(0, 2000));
    scrollFunctionType = {action:'simplify', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight};
});

function requestScrollFunction(){
    var type = 'summarize'
    var displayType = 'displaySummary';
    chrome.runtime.sendMessage({action:'scrollFunctionTypeRequest'}, function(response){
        console.log("Content: request.type ", response.type)
        if (response.type === 'summarize'){
            type = {action:'summarize', chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
            displayType = 'displaySummary';
        }
        else if (response.type === 'simplify') {
            type = {action:'simplify', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight};
            displayType = 'displaySimplify'
        }
        else if (response.type === 'quiz') {
            type = {action: 'getQuiz', previousQuizzes: response.previousQuizzes, chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
            console.log('CONTENT Previous quizzes: ', response.previousQuizzes);
            displayType = 'displayQuiz'
        }
        else if (response.type === 'more') {
            type = {action:'getMoreResources', chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
            displayType = 'displayMoreResources'
        }
        chrome.runtime.sendMessage(type, function(response){
            console.log('Scroll function type: ', type)
            console.log(`Received ${type.action} response from background: `, response);
            var displayType = decideScrollFunctionDisplayType(type.action);
            console.log("Display type:", displayType);
            chrome.runtime.sendMessage({action:displayType, message:response},function(response){
                console.log('Received response from popup:', response);
            })
        });
    });
    
}


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     scrollFunctionType = {action:'simplify', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight};
//     if (request.action === 'changeScrollEventPopup') {
//         if (request.type === 'summarize') {
//             scrollFunctionType = {action:'summarize', chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
//         }
//         else if (request.type === 'simplify') {
//             scrollFunctionType = {action:'simplify', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight};
//         }
//         else if (request.type === 'quiz') {
//             scrollFunctionType = {action: 'getQuiz', previousQuizzes: request.previousQuizzes, chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
//             console.log('CONTENT Previous quizzes: ', request.previousQuizzes);
//         }
//         else if (request.type === 'more') {
//             scrollFunctionType = {action:'getMoreResources', chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight};
//         }
//     }
//     console.log("Changed scroll function type to:", scrollFunctionType);
// });

function decideScrollFunctionDisplayType(type) {
    var displayType = 'displaySummary'
    if (type === 'summarize'){
        displayType = 'displaySummary';
    }
    else if (type === 'simplify'){
        displayType = 'displaySimplify';
    }
    else if (type === 'getQuiz'){
        displayType = 'displayQuiz';
    }
    else if (type === 'getMoreResources'){
        displayType = 'displayMoreResources';
    }
    else if (type === 'askGPT'){
        displayType = 'displayAskGPT';
    }
    return displayType
}

//CONTINUOUS SCROLL TEST
window.addEventListener('scroll', function(){
    const newScrollPosition = window.scrollY;   
    const pageLength = document.body.scrollHeight;
    scrollHeight = document.body.scrollHeight;
    const x = Math.floor(pageLength / arrayLength); 
    // if (newScrollPosition < 50){
    //     console.log(bodyText.slice(0,1500))
    // };
    if (newScrollPosition > 0) {
        scrollPosition = newScrollPosition;
        //TODO: change to make more sensitive, should trigger every milestone
        if (Math.floor(scrollPosition) % x < 5){
            var multiplier = Math.floor(scrollPosition / x);
            console.log('Milestone reached: ', multiplier);
            console.log('CHUNKS BELOW')
            console.log(chunksArray[0]);
            console.log(chunksArray.length);
            //request scroll function type from popup
            requestScrollFunction();
            //CONTINUOUS SCROLL TEST
            // chrome.runtime.sendMessage(type, function(response){
            //     console.log('Scroll function type: ', type)
            //     console.log(`Received ${type.action} response from background: `, response);
            //     var displayType = decideScrollFunctionDisplayType(type.action);
            //     console.log("Display type:", displayType);
            //     chrome.runtime.sendMessage({action:displayType, message:response},function(response){
            //         console.log('Received response from popup:', response);
            //     })
            // });
            //MILESTONE LOAD - LOADING ANIMATION
            chrome.runtime.sendMessage({action:'milestone_load'},function(response){
                console.log('Received response from popup:', response);
            })
            console.log(`Passed milestone: ${multiplier}`)
            console.log('Content:', chunksArray[multiplier - 1]);
        }
    }
});

//receives summarizePrevious, responds with chunksArray and scrollPosition
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getscrollchunks'){
        console.log('Got request for scroll Position and chunks action');
        sendResponse({scrollPosition:scrollPosition, chunksArray:chunksArray, scrollHeight:scrollHeight});
    }
})

var isPopupShown = false;
document.addEventListener("selectionchange", function(event){
    // console.log('Selection changed');
    var selection = window.getSelection().toString();
    if (selection){
        console.log('Selection:', selection);
        var range = window.getSelection().getRangeAt(0);
        var rect = range.getBoundingClientRect();
        console.log('Rect:', rect);
        console.log('Top:', rect.top);
        

        var popupWidth = 200;
        var popupHeight = 100;
        var popupLeft = rect.right;
        var popupTop = rect.bottom;

        var body = document.body;
        var popup = document.createElement('div');
        popup.id = 'popupDiv';
        popup.style.position = 'absolute';
        popup.style.left = popupLeft + 'px';
        popup.style.top = popupTop + 'px';
        popup.style.width = popupWidth + 'px';
        popup.style.height = popupHeight + 'px';
        popup.style.backgroundColor = 'green';
        popup.style.cursor = 'pointer';
        var text = document.createElement('p');
        text.textContent = 'Create quiz';
        popup.appendChild(text);

        document.addEventListener("mouseup", function(event){
            if (!isPopupShown){
                body.appendChild(popup);
                isPopupShown = true
            }
        })

        document.addEventListener("click", function(event) {
            if (popup && !popup.contains(event.target)) {
                document.addEventListener("mousedown", function(event){
                    console.log('Clicked outside')
                    closePopup();
                    isPopupShown = false;
                });
            }
            else if (popup && popup.contains(event.target)) {
                document.addEventListener("mouseup", function(event){
                    console.log("Clicked inside")
                });
            }
          });
    }
})

function closePopup(){
    var popup = document.getElementById('popupDiv');
    if (popup) {
        popup.outerHTML = '';
        // popup.parentNode.removeChild(popup);
    }
}

function sendToPopup(message) {
    // console.log('Raw message type: ', typeof(message));
    chrome.runtime.sendMessage({action:"gpt_resp",message:message}, function(response) {
        console.log('Received response from popup:', response);   
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
    if (request.action === 'getQuizPopup') {
        console.log('CONTENT GetQuiz Previous quizzes: ', request.previousQuizzes)
        chrome.runtime.sendMessage({action:'getQuiz', chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight, previousQuizzes:request.previousQuizzes}, function(response){
            console.log('Received response from background: ', response)
            chrome.runtime.sendMessage({action:'displayQuiz', message:response}, function(response){
                console.log('Received quiz response from popup:', response);
            });
        });
        sendResponse("Content: got getQuiz from popup")
    }
    else if (request.action === 'getMoreResourcesPopup'){
        chrome.runtime.sendMessage({action:"getMoreResources", chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight}, function(response){
            console.log("Received response from background: ", response);
            chrome.runtime.sendMessage({action:"displayMoreResources", message: response}, function(response){
                console.log("Received resources response from popup: ", response)
            });
        });
        sendResponse("Content: got GetResources from popup button")
    }
    else if (request.action === "getSimplifyPopup"){
        console.log("Got simplify request from popup");
        chrome.runtime.sendMessage({action:'simplify', chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight}, function(response){
            console.log('Received response from background:', response);
            chrome.runtime.sendMessage({action:'displaySimplify', message:response}, function(response){
                console.log('Received simplify response from popup:', response);
            });
        });
        sendResponse("Content: got simplify from popup")
    }
    else if (request.action === "getSummaryPopup"){
        console.log("Got summary request from popup");
        sendResponse({chunksArray:chunksArray, scrollPosition:scrollPosition, scrollHeight:scrollHeight})
        // chrome.runtime.sendMessage({action:"summarizePrevious", chunksArray: chunksArray, scrollPosition: scrollPosition, scrollHeight: scrollHeight}, function(response){
        //     console.log("Got response from popup")
            // console.log('Received response from background:', response);
            // chrome.runtime.sendMessage({action:'displaySummary', message:response}, function(response){
            //     console.log('Received summary response from popup:', response);
            // });
        // });
    }
    else if (request.action === 'getAskGPTPopup'){
        console.log("Got ask GPT request from popup");
        chrome.runtime.sendMessage({action:
        "ask_gpt", message:request.message, chunksArray:chunksArray, scrollPosition: scrollPosition, scrollHeight:scrollHeight}, function(response){
            console.log('Received response from background:', response);
            chrome.runtime.sendMessage({action:'displayAskGPT', message:response}, function(response){
                console.log('Received ask GPT response from popup:', response);
            });
            
        })
    }
});

function sendGPTMessage(message){
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, function(response){
            if (response != undefined) {
                resolve(response);
            }
            else {
                chrome.runtime.sendMessage(message,function (response) {
                    if (response != undefined) {
                        resolve(response);
                    }
                    else {
                        reject(new Error('No response received from GPT background'));
                    }
                
                })
            }
            
        })
    });
}

// chrome.runtime.onMessage.addListener((request, sender, sendResponse)=>{
//     if (request.action === 'sendbackgroundnew') {
//         console.log('sendbackgroundnew:', 'tried');
//         sendResponse("got it")
//     }
//     // sendResponse("got it outside")
//     return true;
// });
