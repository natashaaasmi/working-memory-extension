console.log('Popup script loaded');
var bodyText = '';
var chunksArray = [];
var docScrollPosition = 0;
var previousQuizzes = [];
var scrollFunctionType = 'summarize';
//receive body Text - once
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {   
    if (request.action === 'receiveBodyText') {
        bodyText = request.bodyText;
        console.log("Popup: Received bodyText");
        sendResponse('Popup: Received bodyText');
        console.log(bodyText);
    }
});

//SCROLL FUNCTION TYPE LISTENER
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrollFunctionTypeRequest') {
        console.log("Popup: Received scrollFunctionTypeRequest");
        console.log("Popup: Scroll function type: ", scrollFunctionType)
        if (scrollFunctionType === 'quiz') {
            sendResponse({type:'quiz', previousQuizzes:previousQuizzes});
        }
        else {
            sendResponse({action: 'scrollFunctionTypeResponse', type:scrollFunctionType});
        }
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'gpt_resp') {
        sendResponse('Popup: Got GPT response')
        console.log('Popup: Got GPT response')
        // var resp = request.message;
        console.log('Response type:', typeof(request.message));
        const resp = JSON.parse(request.message);
        console.log('JSON parse: ', resp);
        console.log('Type of JSON parse:', typeof(resp));
        console.log('Words:', resp.words);
        // const resp = JSON.parse(request.message);
        // document.getElementById('response').innerHTML = request.message;
        const ulElement = document.getElementById('definitions')
        resp.words.forEach(item => {
            const paragraphElement = document.createElement('p');
            // Create a <b> element for the word and set its text content
            const wordElement = document.createElement('b');
            wordElement.textContent = item.word;
            // Create a <span> element for the definition and set its text content
            const definitionElement = document.createElement('span');
            definitionElement.textContent = item.definition;
            // Append the <b> element and <span> element to the <li> element
            paragraphElement.appendChild(wordElement);
            paragraphElement.appendChild(document.createTextNode(': ')); // Add a separator
            paragraphElement.appendChild(definitionElement);
            // Append the <li> element to the <ul> element
            ulElement.appendChild(paragraphElement);
            ulElement.appendChild(document.createElement('br'));
          });
        
    }
});

//display results from summarize on scroll, get the point on load
chrome.runtime.onMessage.addListener((request, sender, sendResponse)=> {    
    // if (request.action === 'milestone'){
    //     console.log('Popup: Received milestone:', request.content);
    //     sendResponse(`Popup: Received milestone ${request.content}`);
    // }
    if (request.action === 'getthepoint'){
        console.log("Get the point resp from background: ", request.message)
        console.log('Type of getThePointResponse: ', typeof(request.message));
        const resp = JSON.parse(request.message);
        const bodytext = document.getElementById('getthepoint');
        bodytext.innerHTML = '';
        const div = document.createElement('div');
        div.id = 'thepoint';
        div.className = 'dynamicCards';
        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        clearButtonDiv.innerHTML = svgString;
        div.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('thepoint');
        });
        const title = document.createElement('h3');
        title.textContent = "Overview";
        const point = document.createElement('p');
        point.textContent = resp.summary;
        div.appendChild(title);
        div.appendChild(point);
        bodytext.appendChild(div);

        sendResponse('Popup: Received getthepoint');
    }

    else if (request.action === "displayMoreResources"){
        document.getElementById("loader-box").outerHTML = "";
        var parentDiv = document.getElementById("more_resources");
        var childDiv = document.createElement('div');
        childDiv.id = 'moreResourcesDiv';
        childDiv.className = 'dynamicCards';
        var resourcesTag = document.createElement('p');
        resourcesTag.textContent = 'MORE RESOURCES';
        resourcesTag.style.fontWeight = 'lighter';
        resourcesTag.style.fontSize = 'smaller';
        resourcesTag.style.color = 'rgb(52, 140, 255)';
        resourcesTag.style.marginBottom = '10px';
        childDiv.appendChild(resourcesTag);
        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        clearButtonDiv.innerHTML = svgString;
        childDiv.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('moreResourcesDiv');
        });
        const resp = JSON.parse(request.message);
        resp.links.forEach(resource => {
            var link = document.createElement('a');
            link.href = resource.link;
            link.text = resource.text;
            childDiv.appendChild(link);
            var breaks = document.createElement('br');
            childDiv.appendChild(breaks);
            childDiv.appendChild(breaks);
        });
        parentDiv.appendChild(childDiv)
    }

    else if (request.action === "displaySimplify"){
        sendResponse("Popup: received displaySimplify message")
        document.getElementById("loader-box").outerHTML = "";
        var parentDiv = document.getElementById("content");
        var div = document.createElement('div');
        div.id = 'displaySimplify';
        div.className = 'dynamicCards';

        var simplifyTag = document.createElement('p');
        simplifyTag.textContent = 'SIMPLIFY';
        simplifyTag.style.fontWeight = 'lighter';
        simplifyTag.style.fontSize = 'smaller';
        simplifyTag.style.color = 'rgb(52, 140, 255)';
        simplifyTag.style.marginBottom = '10px';
        div.appendChild(simplifyTag);

        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        clearButtonDiv.innerHTML = svgString;
        div.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('displaySimplify');
        });

        const resp = JSON.parse(request.message);
        var text = document.createElement('p');
        text.textContent = resp.answer;
        div.appendChild(text);
        parentDiv.appendChild(div);
    };
});

//CONTINOUS SCROLL TEST - receiving messages from content
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'displaySummary'){
        document.getElementById('loader-box').outerHTML = "";
        const resp = JSON.parse(request.message);
        const body = document.getElementById("content");
        const ulElement = document.createElement('ul');
        const parent = document.createElement('div');
        parent.id = 'text-summary';
        parent.className = 'dynamicCards';
        //tag element
        var simplifyTag = document.createElement('p');
        simplifyTag.textContent = 'SUMMMARIZE';
        simplifyTag.style.fontWeight = 'lighter';
        simplifyTag.style.fontSize = 'smaller';
        simplifyTag.style.color = 'rgb(52, 140, 255)';
        simplifyTag.style.marginBottom = '10px';
        parent.appendChild(simplifyTag);

        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        clearButtonDiv.innerHTML = svgString;
        parent.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('text-summary');
        });

        const title = document.createElement('h3');
        title.textContent = resp.title;
        parent.appendChild(title)

        resp.summary.forEach(item => {
            const newElement = document.createElement('li');
            newElement.textContent = item.point;
            // newElement.textContent = 'test';
            // newElement.id = 'text-summary'
            ulElement.appendChild(newElement);
        })
        parent.appendChild(ulElement);
        body.appendChild(parent);
        sendResponse('Popup: Received scroll test');
    }
    else if (request.action === 'milestone_load'){
        generateLoadingView("bodyStuff");
        // const ulElement = document.getElementById('summary-loading');
        // ulElement.textContent = request.message;
        sendResponse('Popup: Received milestone load');
    }
    else if (request.action === 'displayQuiz'){
        sendResponse("Popup: Received displayQuiz message")
        document.getElementById("loader-box").outerHTML = "";
        const div = document.getElementById("content");
        //HORIZONTAL STACK DIV - generated
        const parentDiv = document.createElement('div');
        parentDiv.id = "quizParentDiv";
        parentDiv.className = "horizontal-stack";

        //tag element
        var simplifyTag = document.createElement('p');
        simplifyTag.textContent = 'QUIZ';
        simplifyTag.style.fontWeight = 'lighter';
        simplifyTag.style.fontSize = 'smaller';
        simplifyTag.style.color = 'rgb(52, 140, 255)';
        simplifyTag.style.marginBottom = '10px';

        //QUIZ ELEMENT
        const quiz = document.createElement('div');
        quiz.id = 'quiz'
        quiz.className = 'dynamicCards'
        // displayQuiz('quiz', request)
        quiz.appendChild(simplifyTag);
    
        const resp = JSON.parse(request.message);

        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        // const parser = new DOMParser();
        // const svgElement = parser.parseFromString(svgString, "image/svg+xml").documentElement;
        clearButtonDiv.innerHTML = svgString;
        quiz.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('quiz');
        });
        const questionDiv = document.createElement('div');  
        questionDiv.id = 'questionDivId';
        const questionElement = document.createElement('h3');
        questionElement.textContent = resp.question;
        previousQuizzes.push(resp.question);
        questionDiv.appendChild(questionElement);
        

        const answerDiv = document.createElement('div')
        answerDiv.id = 'answerDivId'
    
        const answerElement = document.createElement('h3');
        answerElement.textContent = resp.answer;
        answerElement.style.display = 'none';
        answerDiv.appendChild(answerElement);
        answerDiv.addEventListener("click", function(){
            answerElement.style.display = "";
        })
        const dividingElement = document.createElement('hr')
        dividingElement.class = 'solid';

        // const newQuizButton = document.createElement("button");
        // newQuizButton.id = "newQuiz";
        // newQuizButton.textContent = "New quiz";

        // newQuizButton.addEventListener('click', function(){
        //     console.log("New quiz button clicked")
        //     //generate fake quiz
        //     const fakeQuiz = document.createElement('div')
        //     fakeQuiz.backgroundColor = 'black';

        // })
        // questionDiv.appendChild(dividingElement)
        quiz.appendChild(questionDiv);
        quiz.appendChild(dividingElement);
        quiz.appendChild(answerDiv);
        // quiz.appendChild(newQuizButton)
        // resp.answers.forEach(answer => {
        //     const radio = document.createElement('input');
        //     radio.type = 'radio';
        //     radio.name = 'quiz';
        //     radio.value = answer.correct;
        //     const label = document.createElement('label');
        //     label.textContent = answer.answer;
        //     quiz.appendChild(radio);
        //     quiz.appendChild(label);
        //     quiz.appendChild(document.createElement('br'));
        // })
        // parentDiv.appendChild(quiz);
        div.appendChild(quiz);
    }
    else if (request.action === "displayAskGPT"){
        sendResponse("Popup: Received displayAskGPT message")
        document.getElementById("loader-box").outerHTML = "";
        const parentDiv = document.getElementById("content");
        const div = document.createElement('div');
        div.id = 'askGPTDiv';
        div.className = 'dynamicCards';

        var simplifyTag = document.createElement('p');
        simplifyTag.textContent = 'MORE INFORMATION';
        simplifyTag.style.fontWeight = 'lighter'; 
        simplifyTag.style.fontSize = 'smaller';
        simplifyTag.style.color = 'rgb(52, 140, 255)';
        simplifyTag.style.marginBottom = '10px';
        div.appendChild(simplifyTag);

        //CLEAR TEXT BUTTON
        const clearButtonDiv = document.createElement('div');
        clearButtonDiv.className = 'clearText';
        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        clearButtonDiv.innerHTML = svgString;
        div.appendChild(clearButtonDiv);
        clearButtonDiv.addEventListener('click', function(){
            console.log("Clear text clicked")
            clearSelfDynamicCard('askGPTDiv');
        });

        const resp = JSON.parse(request.message);
        var text = document.createElement('p');
        text.textContent = resp.answer;
        div.appendChild(text);
        parentDiv.appendChild(div);
    }
});

//BUTTONS:
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded")

   
    // if (document.getElementById("newQuiz")){
    //     console.log("New quiz button exists")
    //     const newQuizButton = document.getElementById("newQuiz");
    //     newQuizButton.addEventListener("click", function(){
    //         console.log("New quiz button clicked");
    //     })
    // }
    //OPEN DROPDOWN
    const dropdownBtn = document.getElementsByClassName('dropbtn')[0];
    dropdownBtn.addEventListener('click', function(){
        const dropdownContent = document.getElementsByClassName('dropdown-content')[0]; 
        if (dropdownContent.style.display === 'none' || dropdownContent.style.display === ''){ // Check if display is none or empty
            dropdownContent.style.display = 'block';
            console.log('Dropdown content displayed');
        }
        else {
            dropdownContent.style.display = 'none';
        }
    });
    
    const dropdownContent = document.getElementsByClassName('dropdown-content')[0];
    dropdownContent.addEventListener('click', function(){

    });

    const moreResourcesButton = document.getElementById('moreResources');
    moreResourcesButton.addEventListener('click', function(){
        console.log("More resources clicked");
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
            generateLoadingView("content");
            chrome.tabs.sendMessage(tabs[0].id, {action:"getMoreResourcesPopup"}, function(response){
                sendResponse("Popup moreResources: Got response from content")
            })
        })
    })
    const clearAllButton = document.getElementById('clear');
    clearAllButton.addEventListener('click', function(){
        console.log('Clear button clicked');
        const cards = document.getElementsByClassName('dynamicCards');
        const cardArray = Array.from(cards);
        cardArray.forEach(card => {
            card.outerHTML = '';
        });
        const loaders = document.getElementsByClassName('boxLoader');
        const loaderArray = Array.from(loaders);
        loaderArray.forEach(loader => {
            loader.outerHTML = '';
        });
        document.getElementById("loader-box").innerHTML = "";
        document.getElementById("more_resources").innerHTML = "";
        // document.getElementsByClassName("dynamicCards").outerHTML = '';
    });

    const quizButton = document.getElementById('quizTest');
    quizButton.addEventListener('click', function(){
        console.log('Quiz button clicked');
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
            generateLoadingView("content");
            console.log('Previous quizzes popup button: ', previousQuizzes)
            chrome.tabs.sendMessage(tabs[0].id, {action:"getQuizPopup", previousQuizzes:previousQuizzes}, function(response){
                sendResponse("Popup getquiz: Got response from content")
                console.log("Got response from content ,", response)
            })
        })
    })

    //receive response
    const summarizePreviousButton = document.getElementById('summarize');
    summarizePreviousButton.addEventListener('click', function(){
        console.log('Summarize previous button clicked');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            generateLoadingView("content");
            chrome.tabs.sendMessage(tabs[0].id, {action: "getSummaryPopup"}, function(response) {
                if (response.chunksArray){
                    chrome.runtime.sendMessage({action:"summarizePrevious", chunksArray:response.chunksArray, scrollPosition: response.scrollPosition, scrollHeight:response.scrollHeight}, function(response){
                        console.log("Popup: Got summarizePreviousresponse from background");
                        document.getElementById("loader-box").outerHTML = "";
                        console.log("Popup: response (summarize) from background, ", response);
                        // const resp = JSON.parse(response)
                        const resp = JSON.parse(response);
                        const parentDiv = document.getElementById("content")
                        // generateLoadingView('summarizePrevious');
                        const divElement= document.createElement('div');
                        divElement.id = 'text-summary';
                        divElement.className = 'dynamicCards';

                        const ulElement = document.createElement('ul');
                        ulElement.style.listStyleType = 'disc';
                        // ulElement.id = 'text-summary';
                        // ulElement.className = 'dynamicCards';
                        var simplifyTag = document.createElement('p');
                        simplifyTag.textContent = 'SUMMARIZE';
                        simplifyTag.style.fontWeight = 'lighter';
                        simplifyTag.style.fontSize = 'smaller';
                        simplifyTag.style.color = 'rgb(52, 140, 255)';
                        simplifyTag.style.marginBottom = '10px';
                        divElement.appendChild(simplifyTag);

                        //CLEAR TEXT BUTTON
                        const clearButtonDiv = document.createElement('div');
                        clearButtonDiv.className = 'clearText';
                        const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                        clearButtonDiv.innerHTML = svgString;
                        divElement.appendChild(clearButtonDiv);
                        clearButtonDiv.addEventListener('click', function(){
                            console.log("Clear text clicked")
                            clearSelfDynamicCard('text-summary');
                        });

                        const titleElement = document.createElement('h3');
                        titleElement.textContent = resp.title;
                        // const newElement = document.createElement('p');
                        divElement.appendChild(titleElement);
                        resp.summary.forEach(item => {
                            const paragraphElement = document.createElement('li');
                            paragraphElement.textContent = item.point;
                            ulElement.appendChild(paragraphElement);
                        })
                        // newElement.textContent = resp.summary
                        // newElement.id = 'text-summary'
                        // div.appendChild(newElement);
                        divElement.appendChild(ulElement);
                        parentDiv.appendChild(divElement);
                        const data = ["Item 1", "Item 2", "Item 3", "Item 4"];

                        // Get the UL element
                        const ul = document.createElement("ul");
                        ul.style.listStyleType = 'disc';


                        // Iterate over the data and create list items dynamically
                        data.forEach(item => {
                            // Create a new list item
                            const li = document.createElement("li");
                            li.style.marginBottom = '10px';
                            // Set the text content of the list item
                            li.textContent = item;

                            // Append the list item to the unordered list
                            ul.appendChild(li);
                            if (index !== data.length - 1) {
                                // Add a line break after the list item
                                ul.appendChild(document.createElement('br'));
                            }
                        });
                        parentDiv.appendChild(ul);
                    })
                }
            });  
        });
    });

    const simplifyButton = document.getElementById("simplify");
    simplifyButton.addEventListener('click', function(){
        console.log('Simplify button clicked')
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
            generateLoadingView("content");
            chrome.tabs.sendMessage(tabs[0].id, {action:"getSimplifyPopup"}, function(response){ //request 
                sendResponse("Popup simplify: Got response from content")
            })
        })
    });

    // const defineButton = document.getElementById('define');
    // defineButton.addEventListener('click', function(){
    //     console.log('Define button clicked');
    //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    //         chrome.tabs.sendMessage(tabs[0].id, {action: "getscrollchunks"}, function(response) {
    //             if (response.chunksArray){
    //                 chrome.runtime.sendMessage({action:"define", chunksArray:response.chunksArray, scrollPosition:response.scrollPosition, scrollHeight:response.scrollHeight}, function(response){
    //                     console.log("Popup: Got define response from background");
    //                     const resp = JSON.parse(response);
    //                     const ulElement = document.getElementById('definitions')
    //                     const hElement = document.createElement('h3');
    //                     hElement.textContent = 'Key terms';
    //                     ulElement.appendChild(hElement);
    //                     resp.words.forEach(item => {
    //                         const paragraphElement = document.createElement('p');
    //                         // Create a <b> element for the word and set its text content
    //                         const wordElement = document.createElement('b');
    //                         wordElement.textContent = item.word;
    //                         // Create a <span> element for the definition and set its text content
    //                         const definitionElement = document.createElement('span');
    //                         definitionElement.textContent = item.definition;
    //                         // Append the <b> element and <span> element to the <li> element
    //                         paragraphElement.appendChild(wordElement);
    //                         paragraphElement.appendChild(document.createTextNode(': ')); // Add a separator
    //                         paragraphElement.appendChild(definitionElement);
    //                         // Append the <li> element to the <ul> element
    //                         ulElement.appendChild(paragraphElement);
    //                         // ulElement.appendChild(document.createElement('br'));
    //                     });
    //                 });
    //             };
    //         });
    //     });
    // });

    const summarizeButton = document.getElementById('summarizepage');
    summarizeButton.addEventListener('click', function(){
        console.log('Summarize button clicked');
        const messagecontent = {action: "summarize", message: "Summarize button clicked", bodyText:bodyText, sender:'popup'}
        chrome.runtime.sendMessage(messagecontent, function(response){
            console.log("Sent summarize message")
            if (response){
                console.log("Got response: ", response);
                const resp = JSON.parse(response);
                console.log('JSON parse: ', resp);
                console.log('Type of JSON parse:', typeof(resp));
                console.log('Words:', resp.words);
                const ulElement = document.getElementById('summary');
                // const paragraphElement = document.createElement('p');
                ulElement.textContent = resp.summary;
                // ulElement.appendChild(paragraphElement);
            }
        });
    });

    const textbar = document.getElementById("inputForm");
    textbar.addEventListener("submit", function(event) {
        event.preventDefault();
        console.log("Submitted form");
    });
});


///HIGHLIGHT
// document.addEventListener('selectionchange', function(){
//     var selectedText = window.getSelection().toString();
//     var range = window.getSelection().getRangeAt(0);
//     var highlight = document.createElement(span)
//     highlight.style.backgroundColor = 'yellow'
//     range.surroundContents(highlight)
//     document.addEventListener('mouseup', function(){
//         chrome.runtime.sendMessage({action:''})
//     })
// })

//OPEN DROPDOWN
const dropdown = document.querySelector('.dropdown');
const dropdownContent = dropdown.querySelector('.dropdown-content');
const dropdownButton = dropdown.querySelector('.dropbtn');
const links = document.querySelectorAll('.dropdownlink');

links.forEach(link => {
    link.addEventListener('click', function(){
        console.log("Link clicked ", link.textContent);
        dropdownContent.style.display = 'none';
        var chosenType = link.textContent;
        const svgObject = document.createElement('object');
        svgObject.setAttribute('type', 'image/svg+xml');
        svgObject.setAttribute('data', 'chevron-up.svg');
        svgObject.setAttribute('width', '16');
        svgObject.setAttribute('height', '16');
        dropdownButton.textContent = link.textContent;
        dropdownButton.appendChild(svgObject);
        changeScrollEvent(chosenType); //changes scrollfunctiontype
    });
})

document.addEventListener('click', function(event) {
    if (!dropdown.contains(event.target)) {
        console.log('Clicked outside the dropdown');
        dropdownContent.style.display = 'none';
    }
});

dropdownButton.addEventListener('click', function(event) {
    dropdownContent.classList.toggle('show');
    event.stopPropagation(); 
});

function changeScrollEvent(type){
    type = type.toLowerCase();
    scrollFunctionType = type;
    console.log('Scroll function type: ', scrollFunctionType)
    // if (type === 'quiz'){
    //     chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
    //         chrome.tabs.sendMessage(tabs[0].id, {action:"changeScrollEventPopup", type:type, previousQuizzes:previousQuizzes}, function(response){
    //             console.log("Popup: Sent changeScrollEventPopup message", type);
    //         });
    //     });
    // }
    // else {
    //     chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
    //         chrome.tabs.sendMessage(tabs[0].id, {action:"changeScrollEventPopup", type:type}, function(response){
    //             console.log("Popup: Sent changeScrollEventPopup message", type);
    //         });
    //     });
    // }
}

///FUNCTIONS
function generateLoadingView(id){
    var loadingElement = document.getElementById(id);
    //generate three loading bars
    var childDiv = document.createElement('div');
    childDiv.id = "loader-box";
    childDiv.className = "boxLoader";
    var mediumRect = document.createElement('div');
    mediumRect.id = "rectangle";
    mediumRect.className = "rectangles";
    var longRect = document.createElement('div');
    longRect.id = "longer-rectangle";
    longRect.className = "rectangles";
    var shortRect = document.createElement("div");
    shortRect.id = "short-rectangle";
    shortRect.className = "rectangles";
    childDiv.appendChild(mediumRect);
    childDiv.appendChild(longRect);
    childDiv.appendChild(shortRect);
    loadingElement.appendChild(childDiv);
}

function clearSelfDynamicCard(id){
    document.getElementById(id).outerHTML = '';
    console.log("ClearSelfDynamicCard: ", id);
}

function displayQuiz(id, request){
    var quiz = document.getElementById(id);

    const resp = JSON.parse(request.message);
    const questionElement = document.createElement('h3');
    questionElement.textContent = resp.question;

    const answerDiv = document.createElement('div');
    answerDiv.id = 'answerDivId'

    const answerElement = document.createElement('h3');
    answerElement.textContent = resp.answer;
    answerElement.style.display = 'none';
    answerDiv.appendChild(answerElement);
    answerDiv.addEventListener("click", function(){
        answerElement.style.display = "";
    })
    const dividingElement = document.createElement("hr")
    dividingElement.class = "solid";
    quiz.appendChild(questionElement);
    quiz.appendChild(dividingElement);
    quiz.appendChild(answerDiv);
    // quiz.appendChid
}

function generateClearTextBtn(id){
    //CLEAR TEXT BUTTON
    const parentDiv = document.getElementById(id);
    const clearButtonDiv = document.createElement('div');
    clearButtonDiv.className = 'clearText';
    const svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 -1.5 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    // const parser = new DOMParser();
    // const svgElement = parser.parseFromString(svgString, "image/svg+xml").documentElement;
    clearButtonDiv.innerHTML = svgString;
    parentDiv.appendChild(clearButtonDiv);
    clearButtonDiv.addEventListener('click', function(){
        console.log("Clear text clicked")
        clearSelfDynamicCard(id);
    });
}


//chatbar ///
var chatbar = document.getElementById('ask_gpt')
chatbar.addEventListener('keypress', function(event){
    if (event.key === "Enter") {
        console.log("Enter pressed")
        event.preventDefault();
        console.log("Ready to capture text")
        var message = chatbar.value;
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
            generateLoadingView("content");
            chrome.tabs.sendMessage(tabs[0].id, {action: "getAskGPTPopup", message:message}, function(response){
                console.log("Popup: Sent ask_gpt message to content")
            });
            chatbar.value = '';
        });
    }
})

// function sendChatMessage(ele){
//     if (event.key === 'Enter') {
//         console.log("Enter pressed")
//         alert(ele.value)
//     }
// }