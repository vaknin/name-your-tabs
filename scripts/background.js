// Listen for user's commands
chrome.commands.onCommand.addListener(command => {

    let msg = {};

    //Toggle Edit Mode Keyboard Shortcut
    if (command == 'toggle-edit-mode'){

        msg.action = 'toggle';

        // Message the active tab
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, msg);
        });
    }

    // Dynamically set favicons
    else if (command.includes('favicon')){

        // Communicate with content.js
        msg.action = 'favicon';

        // Fetch the chosen color
        msg.data = command.substring(8);

        // Send the message
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, msg);
        });
    }
 });