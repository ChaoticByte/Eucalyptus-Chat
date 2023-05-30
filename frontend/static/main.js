// Copyright (c) 2023 Julian Müller (ChaoticByte)

const isMobile = /Android|BlackBerry|iPhone|iPod|Opera Mini/i.test(navigator.userAgent);

// Fetch configuration and initialize Eucalyptus Chat Frontend

fetch("/config")
.then(r => {
    return r.json();
}).then(frontend_config => {

    // Message Context
    let conversation = [frontend_config.profile.conversation_prefix];

    // Elements - Sidebar
    const sidebarOpenButton = document.getElementById("sidebar-toggle-open");
    const sidebarCloseButton = document.getElementById("sidebar-toggle-close");
    const sidebarContainer = document.getElementById("sidebar-container");
    const settingsLabelAssistantNameElement = document.getElementById("settings-label-assistant");
    const settingsMaxTokensElement = document.getElementById("settings-max-tokens");
    const settingsTemperatureElement = document.getElementById("settings-temperature");
    const settingsTopPElement = document.getElementById("settings-top-p");
    const settingsTopKElement = document.getElementById("settings-top-k");
    const settingsRepeatPenaltyElement = document.getElementById("settings-repeat-penalty");
    const settingsPresencePenaltyElement = document.getElementById("settings-presence-penalty");
    const settingsFrequencyPenaltyElement = document.getElementById("settings-frequency-penalty");
    const resetSettingsButton = document.getElementById("reset-settings-btn");
    const resetHistoryButton = document.getElementById("reset-history-btn");

    settingsLabelAssistantNameElement.innerText = frontend_config.profile.name;

    // Elements - Main
    const messageHistoryContainer = document.getElementById("messages");
    const textInputElement = document.getElementById("text-input");
    const sendButton = document.getElementById("send-btn");

    // API requests

    async function apiCompletion(prompt, settings) {
        const bodyData = JSON.stringify({
            "prompt": prompt,
            "stop": frontend_config.profile.stop_sequences,
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

    // Message Roles
    const Roles = {
        USER: {
            name: "User",
            class: "message-bg-user"
        },
        ASSISTANT: {
            name: frontend_config.profile.name,
            class: "message-bg-assistant"
        }
    }

    function addMessage(message, role) {
        if (role == Roles.USER) {
            conversation.push(
                frontend_config.profile.user_keyword + " "
                + message + frontend_config.profile.separator + frontend_config.profile.assistant_keyword);
        }
        else { conversation.push(message + frontend_config.profile.separator); }
        // UI
        let messageRoleElem = document.createElement("div");
        messageRoleElem.classList.add("message-type");
        messageRoleElem.innerText = role.name;
        let messageTextElem = document.createElement("div");
        messageTextElem.classList.add("message-text");
        messageTextElem.innerText = message.trim();
        let messageElem = document.createElement("div");
        messageElem.classList.add("message");
        messageElem.classList.add(role.class);
        messageElem.appendChild(messageRoleElem);
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
        resetSettingsButton.disabled = true;
        resetHistoryButton.disabled = true;
        sendButton.disabled = true;
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
        resetSettingsButton.disabled = false;
        resetHistoryButton.disabled = false;
        sendButton.disabled = false;
        textInputElement.disabled = false;
        // focus text input
        if (!isMobile) textInputElement.focus();
    }

    async function chat() {
        disableInput();
        let input = textInputElement.value.trim();
        if (input == "") {
            enableInput();
        }
        else {
            textInputElement.value = "";
            resizeInputElement();
            addMessage(input, Roles.USER);
            let prompt = conversation.join("");
            let settings = getSettings();
            apiCompletion(prompt, settings).then(r => {
                addMessage(r.trim(), Roles.ASSISTANT);
                enableInput();
            });
        }
    }

    function resetHistory() {
        conversation = [frontend_config.profile.conversation_prefix];
        messageHistoryContainer.innerText = "";
    }

    // Sidebar

    function toggleSidebar() {
        if (sidebarContainer.classList.contains("sidebar-hidden")) {
            sidebarCloseButton.classList.remove("hidden");
            sidebarOpenButton.classList.add("hidden");
            sidebarContainer.classList.remove("sidebar-hidden");
        }
        else {
            sidebarOpenButton.classList.remove("hidden");
            sidebarCloseButton.classList.add("hidden");
            sidebarContainer.classList.add("sidebar-hidden");
        }
    }

    // Event Listeners

    sidebarOpenButton.addEventListener("click", toggleSidebar);
    sidebarCloseButton.addEventListener("click", toggleSidebar);

    resetSettingsButton.addEventListener("click", resetSettings);
    resetHistoryButton.addEventListener("click", resetHistory);
    sendButton.addEventListener("click", chat);

    textInputElement.addEventListener("keypress", e => {
        // Send via Ctrl+Enter
        if (e.key == "Enter" && e.ctrlKey) {
            chat();
        }
    });

    textInputElement.addEventListener("input", resizeInputElement);
    resizeInputElement();

});
