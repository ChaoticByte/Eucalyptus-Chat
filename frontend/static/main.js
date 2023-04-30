// Copyright (c) 2023 Julian Müller (ChaoticByte)

(() => {

    // Koala specific keywords
    const conversationBeginning = "BEGINNING OF CONVERSATION:";
    const userKeyword = " USER: ";
    const assistantKeyword = " GPT:";
    const koalaStopSequence = "</s>";

    // Get frontend config
    let frontend_config = null;
    fetch("/config")
        .then(r => {
            return r.json();
        })
        .then(j => {
            frontend_config = j;
        });

    // Message Context
    let conversation = [conversationBeginning];

    // Elements - Sidebar
    const settingsMaxTokensElement = document.getElementById("settings-max-tokens");
    const settingsTemperatureElement = document.getElementById("settings-temperature");
    const settingsTopPElement = document.getElementById("settings-top-p");
    const resetHistoryButtonElement = document.getElementById("reset-history-btn");

    // Elements - Main
    const messageHistoryContainer = document.getElementById("messages");
    const textInputElement = document.getElementById("text-input");
    const sendButtonElement = document.getElementById("send-btn");

    // API requests

    async function apiCompletion(prompt, settings) {
        const bodyData = JSON.stringify({
            "prompt": prompt,
            "stop": [koalaStopSequence],
            "max_tokens": settings.max_tokens,
            "temperature": settings.temperature,
            "top_p": settings.top_p
        });
        const response = await fetch(frontend_config.api_url + "/v1/completions", {
            method: "post",
            cache: "no-cache",
            body: bodyData,
            headers: {
                "content-type": "application/json"
            }
        });
        const responseData = await response.json();
        return responseData["choices"][0]["text"];
    }

    // User-defined settings

    function getSettings() {
        return {
            max_tokens: settingsMaxTokensElement.value,
            temperature: settingsTemperatureElement.value,
            top_p: settingsTopPElement.value
        }
    }

    // Chat

    const MessageType = {
        USER: {
            name: "User",
            class: "message-bg-user"
        },
        ASSISTANT: {
            name: "Koala",
            class: "message-bg-assistant"
        }
    }

    function addMessage(message, type) {
        if (type == MessageType.USER) {
            conversation.push(userKeyword + message + assistantKeyword);
        }
        else { conversation.push(message); }
        // UI
        let messageTypeElem = document.createElement("div");
        messageTypeElem.classList.add("message-type");
        messageTypeElem.innerText = type.name;
        let messageTextElem = document.createElement("div");
        messageTextElem.classList.add("message-text");
        messageTextElem.innerText = message;
        let messageElem = document.createElement("div");
        messageElem.classList.add("message");
        messageElem.classList.add(type.class);
        messageElem.appendChild(messageTypeElem);
        messageElem.appendChild(messageTextElem);
        messageHistoryContainer.appendChild(messageElem);
        messageHistoryContainer.scrollTo(0, messageHistoryContainer.scrollHeight);
    }

    function disableInput() {
        sendButtonElement.disabled = true;
        textInputElement.disabled = true;
    }

    function enableInput() {
        sendButtonElement.disabled = false;    
        textInputElement.disabled = false;
        // focus text input
        textInputElement.focus();
    }

    async function chat() {
        if (frontend_config == null) {
            console.log("Couldn't fetch frontend configuration.");
        }
        else {
            disableInput();
            let input = textInputElement.value.trim();
            if (input == "") {
                enableInput();
            }
            else {
                textInputElement.value = "";
                addMessage(input, MessageType.USER);
                let prompt = conversation.join("");
                let settings = getSettings();
                apiCompletion(prompt, settings).then(r => {
                    addMessage(r, MessageType.ASSISTANT);
                    enableInput();
                });
            }
        }
    }

    function resetHistory() {
        conversation = [conversationBeginning];
        messageHistoryContainer.innerText = "";
    }

    // Event Listeners
    
    resetHistoryButtonElement.addEventListener("click", resetHistory);
    sendButtonElement.addEventListener("click", chat);
    
    textInputElement.addEventListener("keypress", e => {
        // Send via Ctrl+Enter
        if (e.key == "Enter" && e.ctrlKey) {
            chat();
        }
    });

    textInputElement.addEventListener("input", e => {
        // Calculate Line height
        textInputElement.style.removeProperty("height");
        let newHeight = textInputElement.scrollHeight;
        textInputElement.style.height = newHeight.toString() + "px";
    });

})();