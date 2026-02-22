const fs = require("node:fs");
const fsp = require("node:fs/promises");

function isCrossDeviceError(error) {
  return Boolean(error && error.code === "EXDEV");
}

async function fallbackRename(src, dest) {
  await fsp.copyFile(src, dest);
  await fsp.unlink(src);
}

function fallbackRenameSync(src, dest) {
  fs.copyFileSync(src, dest);
  fs.unlinkSync(src);
}

const originalRename = fs.rename;
fs.rename = function patchedRename(src, dest, callback) {
  return originalRename(src, dest, async (error) => {
    if (!isCrossDeviceError(error)) {
      callback(error);
      return;
    }

    try {
      await fallbackRename(src, dest);
      callback(null);
    } catch (fallbackError) {
      callback(fallbackError);
    }
  });
};

const originalRenameSync = fs.renameSync;
fs.renameSync = function patchedRenameSync(src, dest) {
  try {
    return originalRenameSync(src, dest);
  } catch (error) {
    if (!isCrossDeviceError(error)) {
      throw error;
    }
    return fallbackRenameSync(src, dest);
  }
};

const originalFsPromisesRename = fs.promises.rename.bind(fs.promises);
fs.promises.rename = async function patchedFsPromisesRename(src, dest) {
  try {
    return await originalFsPromisesRename(src, dest);
  } catch (error) {
    if (!isCrossDeviceError(error)) {
      throw error;
    }
    return fallbackRename(src, dest);
  }
};

const originalPromisesRename = fsp.rename.bind(fsp);
fsp.rename = async function patchedPromisesRename(src, dest) {
  try {
    return await originalPromisesRename(src, dest);
  } catch (error) {
    if (!isCrossDeviceError(error)) {
      throw error;
    }
    return fallbackRename(src, dest);
  }
};
