const useMinifiedNavBar = 'use-minified-nav-bar'
const showNavBar = 'show-nav-bar';
const showWikiaBar = 'show-wikiabar';
const configKeys = [useMinifiedNavBar, showNavBar, showWikiaBar]

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
const STICKY_HEADER = ".fandom-sticky-header"
const DOM_CHANGE_REQUIRED_ELS = [ELEMENTS_TO_REMOVE, GLOBAL_NAVIGATION_BAR, WIKIA_BAR, STICKY_HEADER].join(", ");

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
}

function hideNavBar(hide) {
    const navbar = document.querySelector(GLOBAL_NAVIGATION_BAR);
    hide ? navbar.classList.add("global-navigation--hidden")
        : navbar.classList.remove("global-navigation--hidden");
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

class FandomObserverOrchestrator {
    observationHalted = false;
    config;
    observer;

    getConfig() {
        return chrome.storage.sync.get(configKeys)
    }

    haltObservation = () => {
        this.observationHalted = true;
        this.observer.disconnect();
    }

    observe = () => {
        this.observer.observe(document, {
            subtree: true,
            childList: true,
        });
    }

    initializeConfigListeners = () => {
        chrome.storage.sync.onChanged.addListener(changes => {
            configKeys.forEach(key => {
                if (key in changes) this.config[key] = changes[key].newValue;
            });
            if (useMinifiedNavBar in changes) {
                console.log('useminifiednavbar')
                minifyNavBar(this.config[useMinifiedNavBar])
                updateStickyHeader(!this.config[showNavBar] || this.config[useMinifiedNavBar])
            }
            if (showNavBar in changes) {
                hideNavBar(!this.config[showNavBar])
                updateStickyHeader(!this.config[showNavBar] || this.config[useMinifiedNavBar])
            }
            if (showWikiaBar in changes) {
                hideWikiaBar(!this.config[showWikiaBar])
            }
        })
    }

    onMutation = (mutations) => {
        const mutatedNodes = mutations.flatMap(m => Array.from(m.addedNodes))

        mutatedNodes.forEach(node => {
            if (!node.tagName) return;
            if (!node.matches(DOM_CHANGE_REQUIRED_ELS)) return;

            this.haltObservation();
            if (node.matches(GLOBAL_NAVIGATION_BAR)) {
                hideNavBar(!this.config[showNavBar])
                minifyNavBar(this.config[useMinifiedNavBar]);
            } else if (node.matches(WIKIA_BAR)) {
                hideWikiaBar(!this.config[showWikiaBar])
            } else if (node.matches(STICKY_HEADER)) {
                updateStickyHeader( !this.config[showNavBar] || this.config[useMinifiedNavBar]);
            } else if (node.matches(ELEMENTS_TO_REMOVE)) {
                node.remove();
            } else if (node.firstElementChild && node.querySelector(ELEMENTS_TO_REMOVE)) {
                node.querySelectorAll(ELEMENTS_TO_REMOVE).forEach(el => el.remove())
            }
        });
        if (this.observationHalted) this.observe();
    }

    start() {
        this.getConfig().then(config => {
            this.config = config;
            this.initializeConfigListeners();
            this.observer = new MutationObserver(this.onMutation);
            this.onMutation([{ addedNodes: [document.documentElement] }]);
            this.observe();
        })
    }
}

const orchestrator = new FandomObserverOrchestrator();
orchestrator.start();
