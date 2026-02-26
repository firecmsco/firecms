function buildUrlCollectionPath(path) {
    return `/c/${path}`;
}

const entityId = "B00BZQPQLQ";
const props = { entityId: entityId };
const collectionPath = "products";
const locationSearch = "?category_op=%3D%3D&category_value=babys";

const urlPath = buildUrlCollectionPath(`${collectionPath}/${props.entityId}${props.selectedTab ? "/" + props.selectedTab : ""}${locationSearch}#side`);
console.log(urlPath);
