const defaultConfigValues = {
    "show-nav-bar": false,
    "use-minified-nav-bar": false,
    "show-wikia-bar": false
}

chrome.runtime.onInstalled.addListener(details => {
    console.log(details)
    const configMightNotBeInitialized = details.reason === 'install'
        || (details.reason === 'update' && details.previousVersion === "1.3.0");
    if (!configMightNotBeInitialized) return;

    chrome.storage.sync.get(['show-nav-bar']).then(loadedValues => {
        if (loadedValues['show-nav-bar'] === "undefined") {
            chrome.storage.sync.set(defaultConfigValues);
        }
    })
})