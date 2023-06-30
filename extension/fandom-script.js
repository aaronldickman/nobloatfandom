const BLOAT_ELEMENTS = [
    ".global-footer",
    "#highlight__main-container",
    ".page__right-rail",            // "others like you also viewed..." content sidebar
    ".render-wiki-recommendations", // "others like you also viewed..." content footer
    "#mixed-content-footer",        // recs for other unrelated wikis
    "#WikiaBar",                    // links to fandom socials in bottom right
    ".marketing-notifications"      // bottom-left popup shows up on some fandoms
].join(", ");

const AD_ELEMENTS = [
    "#featured-video__player",
    ".top-ads-container",
    ".bottom-ads-container"
].join(", ");

const ELEMENTS_TO_REMOVE = BLOAT_ELEMENTS.concat(", ", AD_ELEMENTS)

const observer = new MutationObserver(onMutation);
onMutation([{ addedNodes: [document.documentElement] }]);
observe();

function onMutation(mutations) {
    let stopped;
    const mutatedNodes = mutations.flatMap(m => Array.from(m.addedNodes))

    mutatedNodes.forEach(node => {
        if (!node.tagName) return;

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