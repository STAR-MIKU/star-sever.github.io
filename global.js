var downloadSuffix = new Map();

function getDownloadFilesName(nameNoSuffix) {
    let index = downloadSuffix.get(nameNoSuffix);
    let fileName = !index ? nameNoSuffix + ".zip" : nameNoSuffix + "(" + index + ").zip"
    downloadSuffix.set(nameNoSuffix, !index ? 1 : index + 1);
    return fileName;
}
