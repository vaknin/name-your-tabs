// Global Variables
let indexR;
let indexY;
let indexG;

// Clear storage
chrome.storage.local.clear();

// Listen for user's commands
chrome.commands.onCommand.addListener(async command => {

    let msg = {};
    let tabID;
    
    // Get the current active tab, and save its ID
    await new Promise(resolve => {
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            tabID = tabs[0].id.toString();
            resolve();
        });
    });

    //Toggle Edit Mode Keyboard Shortcut
    if (command == 'toggle-edit-mode'){

        msg.action = 'toggle';
    }

    // Dynamically set favicons
    else if (command == 'toggle-color'){

        let color;

        // Get tab's current favicon color
        await new Promise(resolve => {

            // Async fetch current tab's favicon color
            chrome.storage.local.get([tabID], result => {

                // Check if a color exists
                if (Object.keys(result).length != 0){

                    // Switch to the next color
                    result = result[tabID];
                    switch (result){
                        case 'red':
                            color = 'yellow';
                            break;
                        case 'yellow':
                            color = 'green';
                            break;
                        case 'green':
                            color = 'red';
                            break;
                    }
                }
    
                // If the favicon has no color, default to red
                else color = 'red';
                resolve();
            });
        });

        // Set color in storage
        chrome.storage.local.set({[tabID]: color});

        // Communicate with content.js
        msg.action = 'favicon';

        // The chosen color
        msg.data = color;
    }

    // Sort by favicon color
    else if (command == 'sort-by-color'){

        let activeWindow,index;
        indexR = 0;
        indexY = 1;
        indexG = 2;

        // Moves the tab
        async function move(item){

            // Get the ID of the current item
            let id = parseInt(Object.keys(item)[0]);

            // Get the color of the current item
            let color = item[id];

            // Change tab's location based on color
            switch(color){

                // Red
                case 'red':
                    index = indexR;
                break;
                // Yellow
                case 'yellow':
                    index = indexY;
                break;
                // Green
                case 'green':
                    index = indexG;
                break;
            }

            // Syncronously move the tab
            await new Promise(resolve => {
                
                // Get the item's tab object
                chrome.tabs.get(id, tab => {

                    // Check whether the tab is in the current chrome window
                    if (tab.windowId == activeWindow){
                        let moveProperties = {
                            windowId: undefined,
                            index
                        };
                        chrome.tabs.move(id, moveProperties, () => {
                            resolve();
                        });
                    }

                    else resolve();
                });
            });

            // Increment indices
            
            indexR++;
            indexY++;
            indexG++;
        }

        // Retrieve all of the favicon colors from storage
        return chrome.storage.local.get(null, async items => {

            // If there are no favicons set, return
            if (Object.keys(items).length == 0) return;

            // Get the current active window's ID
            await new Promise(resolve => {
                chrome.windows.getCurrent(null, window => {
                    resolve(activeWindow = window.id);
                });
            });

            // Loop through all marked tabs
            for (let i = 0; i < Object.keys(items).length; i++){
                let key = Object.keys(items)[i];
                let item = {[key]: items[key]};
                move(item);
                console.log(indexR,indexY,indexG);
            }
        });
    }

    // Send the message to content.js
    chrome.tabs.sendMessage(parseInt(tabID), msg);
 });