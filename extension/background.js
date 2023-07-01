const defaultConfigValues = {
    "show-nav-bar": false,
    "use-minified-nav-bar": false,
    "show-wikia-bar": false
}

chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') chrome.storage.sync.set(defaultConfigValues);
})