// Listen for user's commands
chrome.commands.onCommand.addListener(command => {

    //Toggle Edit Mode Keyboard Shortcut
    if (command == 'toggle-edit-mode'){

        // Message the active tab
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, 'toggle');
        });
    }
 });