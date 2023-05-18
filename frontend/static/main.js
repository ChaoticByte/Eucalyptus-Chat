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
    const settingsTopKElement = document.getElementById("settings-top-k");
    const settingsRepeatPenaltyElement = document.getElementById("settings-repeat-penalty");
    const settingsPresencePenaltyElement = document.getElementById("settings-presence-penalty");
    const settingsFrequencyPenaltyElement = document.getElementById("settings-frequency-penalty");
    const resetSettingsButtonElement = document.getElementById("reset-settings-btn");
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
            "top_p": settings.top_p,
            "top_k": settings.top_k,
            "repeat_penalty": settings.repeat_penalty,
            "presence_penalty": settings.presence_penalty,
            "frequency_penalty": settings.frequency_penalty
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

    const defaultSettings = {
        max_tokens: 100,
        temperature: 0.8,
        top_p: 0.95,
        top_k: 40,
        repeat_penalty: 1.1,
        presence_penalty: 0.0,
        frequency_penalty: 0.0
    }

    function getSettings() {
        return {
            max_tokens: settingsMaxTokensElement.value,
            temperature: settingsTemperatureElement.value,
            top_p: settingsTopPElement.value,
            top_k: settingsTopKElement.value,
            repeat_penalty: settingsRepeatPenaltyElement.value,
            presence_penalty: settingsPresencePenaltyElement.value,
            frequency_penalty: settingsFrequencyPenaltyElement.value
        }
    }

    function resetSettings() {
        settingsMaxTokensElement.value = defaultSettings.max_tokens;
        settingsTemperatureElement.value = defaultSettings.temperature;
        settingsTopPElement.value = defaultSettings.top_p;
        settingsTopKElement.value = defaultSettings.top_k;
        settingsRepeatPenaltyElement.value = defaultSettings.repeat_penalty;
        settingsPresencePenaltyElement.value = defaultSettings.presence_penalty;
        settingsFrequencyPenaltyElement.value = defaultSettings.frequency_penalty;
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

    function resizeInputElement() {
        // Calculate Line height
        textInputElement.style.removeProperty("height");
        let newHeight = textInputElement.scrollHeight;
        textInputElement.style.height = newHeight.toString() + "px";
    }

    function disableInput() {
        settingsMaxTokensElement.disabled = true;
        settingsTemperatureElement.disabled = true;
        settingsTopPElement.disabled = true;
        settingsTopKElement.disabled = true;
        settingsRepeatPenaltyElement.disabled = true;
        settingsPresencePenaltyElement.disabled = true;
        settingsFrequencyPenaltyElement.disabled = true;
        resetSettingsButtonElement.disabled = true;
        resetHistoryButtonElement.disabled = true;
        sendButtonElement.disabled = true;
        textInputElement.disabled = true;
    }

    function enableInput() {
        settingsMaxTokensElement.disabled = false;
        settingsTemperatureElement.disabled = false;
        settingsTopPElement.disabled = false;
        settingsTopKElement.disabled = false;
        settingsRepeatPenaltyElement.disabled = false;
        settingsPresencePenaltyElement.disabled = false;
        settingsFrequencyPenaltyElement.disabled = false;
        resetSettingsButtonElement.disabled = false;
        resetHistoryButtonElement.disabled = false;
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
                resizeInputElement();
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

    resetSettingsButtonElement.addEventListener("click", resetSettings);
    resetHistoryButtonElement.addEventListener("click", resetHistory);
    sendButtonElement.addEventListener("click", chat);

    textInputElement.addEventListener("keypress", e => {
        // Send via Ctrl+Enter
        if (e.key == "Enter" && e.ctrlKey) {
            chat();
        }
    });

    textInputElement.addEventListener("input", resizeInputElement);
    resizeInputElement();

})();