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

        msg.action = 'name-mode';
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
    
                // If the favicon is not set, save the favicon and default to red //todo
                else{
                    color = 'red';
                } 
                    
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

        let activeWindow;

        // Moves the tab
        async function move(item, index){

            return new Promise(async resolve => {

                // Get the ID of the current item
                let id = parseInt(Object.keys(item)[0]);

                // Syncronously move the tab
                let moved = await new Promise(resolve => {
                    
                    // Get the item's tab object
                    chrome.tabs.get(id, tab => {

                        // Check whether the tab is in the current chrome window
                        if (tab.windowId == activeWindow){
                            let moveProperties = {
                                windowId: undefined,
                                index
                            };
                            
                            // Tab moved, return true
                            chrome.tabs.move(id, moveProperties, () => {
                                resolve(true);
                            });
                        }

                        // Tab didn't move, return false
                        else resolve(false);
                    });
                });

                // Return whether the tab has been moved
                resolve(moved);
            });
            
        }

        // Retrieve all of the favicon colors from storage
        return chrome.storage.local.get(null, async items => {

            // If there are no favicons set, return
            if (Object.keys(items).length == 0) return;

            let redTabs = [];
            let yellowTabs = [];
            let greenTabs = [];
            let index = 0;

            // Get the current active window's ID
            await new Promise(resolve => {
                chrome.windows.getCurrent(null, window => {
                    resolve(activeWindow = window.id);
                });
            });

            // Get the number of pinned tabs
            await new Promise(resolve => {
                chrome.tabs.query({ currentWindow: true }, tabs => {
                    for (let tab of tabs){
                        if (tab.pinned) index++;
                    }
                    resolve();
                });
            });

            // Iterate through all items, and sort by color
            for (let i = 0; i < Object.keys(items).length; i++){
                let key = Object.keys(items)[i];
                let color = items[key];
                let item = {[key]: items[key]};
                switch(color){

                    // Red
                    case 'red':
                        redTabs.push(item);
                    break;
                    // Yellow
                    case 'yellow':
                        yellowTabs.push(item);
                    break;
                    // Green
                    case 'green':
                        greenTabs.push(item);
                    break;
                }
            }

            let tabColors = [redTabs, yellowTabs, greenTabs];

            // Iterate through all the red, yellow and green tabs, by order
            for (let tc of tabColors){
                for (let tab of tc){
                    console.log(index);
                    
                    let moved = await move(tab, index);
                    if (moved) index++;
                }
            }
        });
    }

    // Send the message to content.js
    chrome.tabs.sendMessage(parseInt(tabID), msg);
 });