const useMinifiedNavBar = 'use-minified-nav-bar'
const showNavBar = 'show-nav-bar';
const showWikiaBar = 'show-wikiabar';
const configValues = [useMinifiedNavBar, showNavBar, showWikiaBar]

const ELEMENTS_TO_REMOVE = [
    ".global-footer",
    "#highlight__main-container",
    ".page__right-rail",            // "others like you also viewed..." content sidebar
    ".render-wiki-recommendations", // "others like you also viewed..." content footer
    "#mixed-content-footer",        // recs for other unrelated wikis
    ".marketing-notifications",      // bottom-left popup shows up on some fandoms
    "#featured-video__player",
    ".top-ads-container",
    ".bottom-ads-container"
].join(", ");

const GLOBAL_NAVIGATION_BAR = ".global-navigation";
const GLOBAL_NAVIGATION_BAR_TOP_CONTENT = ".global-navigation__top";
const WIKIA_BAR = "#WikiaBar";

chrome.storage.sync.get(configValues).then(loadedValues => {
    initializeConfigListeners();
    const observer = new MutationObserver(onMutation);
    onMutation([{ addedNodes: [document.documentElement] }]);
    observe();

    function onMutation(mutations) {
        let stopped;
        const mutatedNodes = mutations.flatMap(m => Array.from(m.addedNodes))

        mutatedNodes.forEach(node => {
            if (!node.tagName) return;

            handleConfigCases(node);
            if (node.matches(ELEMENTS_TO_REMOVE)) {
                stopped = true;
                observer.disconnect();
                node.remove();
            }
            else if (node.firstElementChild && node.querySelector(ELEMENTS_TO_REMOVE)) {
                stopped = true;
                observer.disconnect();
                for (const el of node.querySelectorAll(ELEMENTS_TO_REMOVE)) el.remove();
            }
        });
        if (stopped) observe();
    }

    function observe() {
        observer.observe(document, {
            subtree: true,
            childList: true,
        });
    }

    function handleConfigCases(node) {
        if (node.matches(GLOBAL_NAVIGATION_BAR)) {
            hideNavBar(!loadedValues[showNavBar])
            minifyNavBar(loadedValues[useMinifiedNavBar]);
        } else if (node.matches(WIKIA_BAR)) {
            hideWikiaBar(!loadedValues[showWikiaBar])
        }
    }

    function initializeConfigListeners() {
        chrome.storage.sync.onChanged.addListener(changes => {
            if (changes[useMinifiedNavBar] !== undefined) minifyNavBar(changes[useMinifiedNavBar].newValue)
            if (changes[showNavBar] !== undefined) hideNavBar(!changes[showNavBar].newValue)
            if (changes[showWikiaBar] !== undefined) hideWikiaBar(!changes[showWikiaBar].newValue)
        })
    }

    function minifyNavBar(minify) {
        const navbar = document.querySelector(GLOBAL_NAVIGATION_BAR);
        const navbarTopContent = document.querySelector(GLOBAL_NAVIGATION_BAR_TOP_CONTENT);
        if (minify) {
            navbar.classList.add("global-navigation--minified");
            navbarTopContent.classList.add("global-navigation__top--hidden");
        } else {
            navbar.classList.remove("global-navigation--minified");
            navbarTopContent.classList.remove("global-navigation__top--hidden");
        }
        updateStickyHeader(minify);
    }

    function hideNavBar(hide) {
        const navbar = document.querySelector(GLOBAL_NAVIGATION_BAR);
        hide ? navbar.classList.add("global-navigation--hidden")
            : navbar.classList.remove("global-navigation--hidden");
        updateStickyHeader(hide);
    }

    function updateStickyHeader(navbarIsModified) {
        const stickyHeader = document.querySelector(".fandom-sticky-header")
        navbarIsModified ? stickyHeader.classList.add("fandom-sticky-header--navbar-modified")
            : stickyHeader.classList.remove("fandom-sticky-header--navbar-modified")
    }

    function hideWikiaBar(hide) {
        const wikiaBar = document.querySelector("#WikiaBar");
        hide ? wikiaBar.classList.add("wikia-bar--hidden")
            : wikiaBar.classList.remove("wikia-bar--hidden");
    }
});

