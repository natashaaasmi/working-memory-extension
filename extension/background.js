//service worker
//create side panel
const url = "https://working-memory-extension-ce0c9e3e984d.herokuapp.com"
const GOOGLE_ORIGIN = 'https://www.google.com';
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return;
    const url = new URL(tab.url);
    if (url.origin === GOOGLE_ORIGIN) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidePanel.html',
            enabled:true
        });
    }
    else {
        await chrome.sidePanel.setOptions({
            tabId,
            enabled:true
        })
    }
})

//background gets message from popup, sends response back to popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    var type = '';
    if (request.action === 'define') {
        console.log('Background: define action clicked')
        var bodyText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight); 

        type = 'define';
        function callback(text){
            console.log('Got GPT response popupTime: ', text);
            sendResponse(text);
        }
        getResponse({input:bodyText},callback, type)
            .then(result => {
                console.log('Received result popupTime:', result);
                sendResponse(result);
                console.log('sent gpt responses to content')
            })
            .catch(error => {
                console.error('Error ing etResponse X:', error);
                sendResponse(error.message)
            })
        return true;
    }

    else if (request.action === "simplify"){
        console.log('Background: simplify action clicked')
        console.log('ChunksArray:', request.chunksArray)
        console.log('ScrollPosition:', request.scrollPosition)
        console.log('ScrollHeight:', request.scrollHeight)
        var bodyText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight);
        console.log("Background: simplify BodyText: ", bodyText)
        console.log('Type: ', typeof(bodyText))
        type = 'simplify';
        function callback(text){
            console.log('Background: got simplify response: ', text);
            sendResponse(text);
        }
        getResponse({input:bodyText},callback, type)
            .then(result => {
                console.log('Received simplify result popupTime:', result);
                sendResponse(result);
                console.log('sent simplify gpt responses to content')
            })
            .catch(error => {
                console.error('Background: error in simplify response:', error);
                sendResponse(error.message)
            })
        return true;
    }

    else if (request.action == 'summarize'){
        console.log('Background: summarize action clicked')
        var bodyText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight);
        console.log("bodyText", bodyText)
        type = 'summarize';
        function callback(text){
            console.log('Got GPT response popupTime: ', text);
            sendResponse(text);
        }
        getResponse({input:bodyText},callback, type)
            .then(result => {
                console.log('Received result popupTime:', result);
                sendResponse(result);
                console.log('sent gpt responses to content')
            })
            .catch(error => {
                console.error('Error ing etResponse X:', error);
                console.log('FAILURE FROM BACKGROUND, ', error.message)
                sendResponse(error.message)
            })
        return true;
    }

    else if (request.action === 'getthepoint'){
        console.log('Background: getthepoint action clicked')
        var bodyText = request.bodyText;
        type = 'getthepoint';
        function callback(text){
            console.log('Got GPT response popupTime: ', text);
            sendResponse(text);
        }
        getResponse({input:bodyText},callback, type)
            .then(result => {
                console.log('Received result popupTime:', result);
                sendResponse(result);
                console.log('sent gpt responses to content')
            })
            .catch(error => {
                console.error('Error ing etResponse X:', error);
                sendResponse(error.message)
            })
        return true;
    }

    else if (request.action === 'summarizePrevious'){
        //call computePreviousText
        console.log('Background: got summarizePrevious request from popup')
        console.log(request.chunksArray[0])
        console.log(request.scrollPosition) //works
        type = 'summarize';
        var bodyText = computePreviousText(request.chunksArray,request.scrollPosition, request.scrollHeight);
        function callback(text){
            console.log('Got GPT response popupTime: ', text);
            sendResponse(text);
        };
        getResponse({input:bodyText}, callback, type)
        .then(result => {
            sendResponse(result)
            console.log('sent gpt responses to content')
        
        })
        .catch(error => {
            console.error('Error ing etResponse X:', error);
            sendResponse(error.message)
        })
        return true;
    }
    else if (request.action === 'getQuiz'){
        type='quiz';
        var bodyText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight)
        console.log('Body text:', bodyText)
        function callback(text){
            console.log('Got GPT response quiz: ', text);
            sendResponse(text);
        }
        var previousQuizzes = ''
        if (request.previousQuizzes && request.previousQuizzes.length > 0){
            request.previousQuizzes.forEach(quiz => {
                previousQuizzes += quiz + '; '
            })
        }
        getResponse({input:bodyText, previousQuizzes:previousQuizzes}, callback, type)
        .then(result => {
            sendResponse(result)
            console.log('Background: sent quiz response to content: ', result)
        })
        .catch(error => {
            console.error('Background: error in getQuiz:', error);
            sendResponse("Error: GPT response failed")
        })
        return true;
    }
    else if (request.action === 'getMoreResources'){
        type='more_resources';
        var bodyText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight);
        function callback(text){
            console.log("Got GPT response more resources ", text);
            sendResponse(text);
        }
        getResponse({input:bodyText}, callback, type)
        .then(result => {
            sendResponse(result)
            console.log('sent gpt responses to content')
        })
        .catch(error => {
            console.error('Error ing etResponse X:', error);
            sendResponse(error.message)
        })
        return true;
    }
    else if (request.action === 'ask_gpt'){
        console.log('Background: ask_gpt action began')
        type = 'ask_gpt';
        var message = request.message;
        var contextText = computeCurrentText(request.chunksArray, request.scrollPosition, request.scrollHeight);
        function callback(text){
            console.log("Got GPT response ask_gpt: ", text);
            sendResponse(text);
        }
        getResponse({input:message, context:contextText},callback, type)
            .then(result => {
                console.log('sent gpt responses to content')
                sendResponse(result)
            })
            .catch(error => {
                console.error('Error getting ask_gpt response', error);
                sendResponse(error.message)
            })
        return true;

    }
});

async function getResponse(text, callback, type, contextText="") {
    const url = url + type;
    console.log('Chosen URL:', url)
    console.log("Text to be JSON: ", text)
    console.log("Type: ", type)
    var body = '';
    try {
        body = JSON.stringify(text);
        console.log('GetResponse: Body: ', body);
        console.log('Type of body:', typeof(body));
    } 
    catch (error){
        console.error('Error in stringify:', error)
    }
    const response = await fetch(url,{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:body
    });
    const data = await response.json();
    console.log('type of data: ', typeof(data))
    console.log('GPT response: ', data.message)
    if (data.message){
        // const stringMsg = JSON.stringify(data.message);
        const stringMsg = data.message;
        console.log(stringMsg);
        callback(stringMsg);
    }
    return data.message;
}

async function getChunkedResponse(textArray, callback, type){
    const url = url + type;
    console.log('Chosen URL:', url)
    var responseArray = [];
    textArray.forEach(async text => {
        const response = await fetch(url,{
            method:'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: text
            })
        });
        const data = await response.json();
        console.log('type of data: ', typeof(data))
        console.log(data.message)
        if (data.message){
            // const stringMsg = JSON.stringify(data.message);
            const stringMsg = data.message; 
            responseArray.push(stringMsg);
            // callback(stringMsg);
        }
    })
    if (responseArray.length === textArray.length){
        callback(responseArray);
    }
    return data.message;
}

//compute previous text from current scroll position
function computePreviousText(text, scrollPosition, scrollHeight){
    chunksArray = text;
    const x = Math.floor(scrollHeight / chunksArray.length); //chunks in length
    var multiplier = Math.floor(scrollPosition / x); //current
    const previousChunks = chunksArray.slice(0, multiplier-1) 
    //each array item is a chunk of 1000 characters, context window is 4092 tokens
    //turn previousChunks into one long string
    var text = ''; 
    for (let i = 0; i < previousChunks.length; i += 1){
        text += previousChunks[i];
    }
    return text;
}

function computeCurrentText(text, scrollPosition, scrollHeight){
    chunksArray = text;
    console.log('Debugging computeCurrentText: ', chunksArray);
    if (scrollHeight === 0 || scrollPosition === 0){
        console.log('Returning first chunk: ', chunksArray[0])
        return chunksArray[0];
    }
    console.log('ScrollHeight:', scrollHeight)
    console.log('ScrollPosition:', scrollPosition)
    const x = Math.floor(scrollHeight / chunksArray.length);
    console.log('x:', x) //chunk interval
    var multiplier = Math.floor(scrollPosition / x); //current position in array
    console.log('multiplier:', multiplier)
    if (multiplier === 0){
        console.log('Returning first chunk: ', chunksArray[0])
        return chunksArray[0];
    }
    console.log('Returning current chunk: ', chunksArray[multiplier - 1])
    const currentChunks = chunksArray[multiplier - 1];
    return currentChunks;
    
}