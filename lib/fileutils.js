var fs  = require('fs');

function isDirectory(path, allowSymLink) {
    var stats = (allowSymLink ? statSync : lstatSync)(path);
    return stats ? stats.isDirectory() : false;
}
exports.isDirectory = isDirectory;

function isFile(path) {
    var stats = lstatSync(path);
    return stats ? stats.isFile() : false;
}
exports.isFile = isFile;

function lstatSync(path) {
    try {
        return fs.lstatSync(path);
    } catch (ex) {
        if (ex.code === 'ENOENT') {
            return null;
        }

        throw ex;
    }
}
exports.lstatSync = lstatSync;

function statSync(path) {
    try {
        return fs.statSync(path);
    } catch (ex) {
        if (ex.code === 'ENOENT') {
            return null;
        }

        throw ex;
    }
}
exports.statSync = statSync;