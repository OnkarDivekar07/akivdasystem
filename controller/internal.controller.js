const RAW_DICT = require("../util/marathiDictionary");
const Product = require("../models/product");

/**
 * Normalize product names so DB names and dictionary keys match
 */
const normalizeName = (str = "") =>
  str.trim().replace(/\s+/g, " ").toUpperCase();

/**
 * Build normalized EN → MR dictionary once
 */
const EN_TO_MR = Object.fromEntries(
  Object.entries(RAW_DICT).map(([key, value]) => [
    normalizeName(key),
    value
  ])
);

exports.backfillMarathiNames = async (req, res) => {
  try {
    // 🔐 Safety guard
    if (req.body?.secret !== "BACKFILL_OK") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // ⛔ Optional: prevent accidental prod usage
    // if (process.env.NODE_ENV === "production") {
    //   return res.status(403).json({ error: "Disabled in production" });
    // }

    const products = await Product.findAll({
      where: { marathiName: null }
    });

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      const normalizedName = normalizeName(product.name);

      // 🧪 Debug (remove after verification)
      console.log("RAW DB NAME:", product.name);
      console.log("NORMALIZED:", normalizedName);
      console.log("DICT VALUE:", EN_TO_MR[normalizedName]);

      const marathiName = EN_TO_MR[normalizedName];

      if (!marathiName) {
        skipped++;
        continue;
      }

      await product.update({ marathiName });
      updated++;
    }

    return res.json({
      message: "Marathi name backfill complete",
      updated,
      skipped,
      total: products.length
    });
  } catch (error) {
    console.error("Backfill error:", error);
    return res.status(500).json({ error: error.message });
  }
};