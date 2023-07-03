const useMinifiedNavBar = 'use-minified-nav-bar'
const showNavBar = 'show-nav-bar';
const showWikiaBar = 'show-wikiabar';
const configValues = [useMinifiedNavBar, showNavBar, showWikiaBar];
const configOptionDisabledClass = "config-option--disabled"

const setStorageValueForConfig = (configKey) => {
    return (e) => {
        const configOptionDiv = document.getElementById(configKey);
        const disabled = configOptionDiv.classList.contains(configOptionDisabledClass)
        if (disabled) return e.preventDefault();

        const input = document.getElementById(configKey).querySelector("input");
        chrome.storage.sync.set({ [configKey]: input.checked })
        if (configKey === showNavBar) styleChildNavBarOptions(input.checked)
    }
}

const setInputToConfigValue = (configKey, value) => {
    if (value === undefined || value === null) return;
    const slider = document.getElementById(configKey).querySelector(".slider");
    slider.classList.add('notransition');

    document.getElementById(configKey).querySelector("input").checked = value;

    slider.offsetHeight; // force css flush before re-enabling transitions
    slider.classList.remove('notransition');
}

const restoreConfigValuesFromSync = () => {
    chrome.storage.sync.get(configValues)
        .then(loadedValues => {
            configValues.forEach(config => setInputToConfigValue(config, loadedValues[config]));
            styleChildNavBarOptions(loadedValues[showNavBar])
        })
}

const initializeConfig = () => {
    restoreConfigValuesFromSync();

    configValues.forEach(configKey => {
        document.getElementById(configKey).querySelector("input")
            .addEventListener('click', setStorageValueForConfig(configKey))
    })
}

const styleChildNavBarOptions = (showNavBar) => {
    const childConfigOptions = document.getElementById("show-nav-bar-section")
        .querySelectorAll("ul > li > .config-option");
    if (!showNavBar) {
        childConfigOptions.forEach(el => el.classList.add(configOptionDisabledClass))
    } else {
        childConfigOptions.forEach(el => el.classList.remove(configOptionDisabledClass))
    }
}

document.addEventListener('DOMContentLoaded', initializeConfig);
