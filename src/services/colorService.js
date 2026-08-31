// JavaScript port of ApiSamples/ColorSamples.cs

const rmClient = require("../helpers/rentManagerClient");

async function getAll() {
  return rmClient.getCollection("/colors");
}

async function getById(colorId) {
  return rmClient.getSingle(`/colors/${colorId}`);
}

/**
 * Mirrors ColorSamples.Update(): fetch a color with embedded EntityTypes,
 * change its name, then POST the updated model back.
 */
async function update(colorId, newName) {
  const colorForUpdate = await rmClient.getSingle(`/colors/${colorId}?embeds=EntityTypes`);
  if (!colorForUpdate) return null;

  colorForUpdate.Name = newName;
  return rmClient.postSingle("/colors?embeds=EntityTypes", colorForUpdate);
}

/**
 * Mirrors ColorSamples.UpdateCollection(): batch-update multiple colors in
 * a single POST.
 */
async function updateMany(updates) {
  // updates: [{ colorId, newName }, ...]
  const colors = await Promise.all(
    updates.map((u) => rmClient.getSingle(`/colors/${u.colorId}?embeds=EntityTypes`))
  );

  colors.forEach((color, i) => {
    if (color) color.Name = updates[i].newName;
  });

  const validColors = colors.filter(Boolean);
  return rmClient.postCollection("/colors?embeds=EntityTypes", validColors);
}

module.exports = { getAll, getById, update, updateMany };
