export default async function decorate(block) {
    const isUE = isUniversalEditorActive();
    const persistedQuery = (isUE) ? useAuthorQuery(block.textContent) : block.textContent;
    const category = await getCategory(persistedQuery);
    
    const root = document.createElement('div');
    root.setAttribute("class", "category-list");
    
    const elem = document.createElement('div');
    elem.setAttribute("class", "category-item");
    elem.setAttribute("itemscope", "");
    elem.setAttribute("itemid", `urn:aemconnection:${category._path}/jcr:content/data/master`);
    elem.setAttribute("itemtype", "reference");
    elem.innerHTML = `
        <div class="category-item-content">
            <h2 class="category-item-title" itemprop="title" itemtype="text">${category.title}</h2>
            <p class="category-item-desc" itemprop="description" itemtype="richtext">${category.description}</p>
        </div>`;
    root.appendChild(elem);
    block.textContent = "";
    block.append(root);
}

/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Category
 * @property {string} _path - Path to the category content fragment.
 * @property {string} title - Title of the category.
 * @property {string} description - Description of the category.
 * @property {string} ctaText - Call to action text.
 * @property {string} ctaLink - Call to action link.
 * @property {URL} image - Image for the category.
 */

/**
 * @async
 * @param {string} persistedQuery
 * @return {Promise<Category[]>} results 
 */
async function getCategory(persistedQuery) {
    const url = addCacheKiller(persistedQuery);

    const json = await fetch(url, {
        credentials: "include"
    }).then((response) => response.json());
    return json?.data?.categoryByPath?.item;
}
/**
 * Detects whether the site is embedded in the universal editor by counting parent frames
 * @returns {boolean}
 */
function isUniversalEditorActive() {
    return window.location.ancestorOrigins?.length > 0;
}

/**
 * Update the persisted query url to use the authoring endpoint
 * @param {string} persistedQuery 
 * @returns {string}
 */
function useAuthorQuery(persistedQuery) {
    return persistedQuery.replace("//publish-", "//author-");
}

/**
 * Updates url to contain a query parameter to prevent caching
 * @param {string} url 
 * @returns url with cache killer query parameter
 */
function addCacheKiller(url) {
    let newUrl = new URL(url);
    let params = newUrl.searchParams;
    params.append("ck", Date.now());
    return newUrl.toString();
}


function getImageUrl(image, isUE) {
    if (isUE) { 
        return image["_authorUrl"];
    }
    const url = new URL(image["_publishUrl"])
    return `https://${url.hostname}${image["_dynamicUrl"]}`
}