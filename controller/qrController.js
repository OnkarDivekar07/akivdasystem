const QRCode = require("qrcode");

exports.generateQR = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const qr = await QRCode.toDataURL(productId, {
      width: 300,
      margin: 1,
    });

    res.status(200).json({ qr });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ message: "Failed to generate QR" });
  }
};