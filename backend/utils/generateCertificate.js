import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

 export const generateCertificate = (name, eventTitle, position) => {
  return new Promise((resolve, reject) => {
    try {
      // 📁 Ensure certificates folder exists
      const certDir = path.join(process.cwd(), "certificates");
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      const fileName = `${name.replace(/\s+/g, "_")}-${Date.now()}.pdf`;
      const filePath = path.join(certDir, fileName);

      const doc = new PDFDocument({ size: "A4", layout: "landscape" });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // 🎨 Certificate Design
      doc.fontSize(30).text("Certificate of Achievement", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(22).text(`This is proudly presented to`, { align: "center" });
      doc.moveDown(1);

      doc.fontSize(32).fillColor("blue").text(name, { align: "center" });
      doc.moveDown(1);

      let title = "Participation";
      if (position === "winner") title = "Winner 🥇";
      else if (position === "runner") title = "Runner-up 🥈";

      doc.fontSize(20).fillColor("black")
        .text(`for securing "${title}" in`, { align: "center" });
      doc.moveDown(1);

      doc.fontSize(24).fillColor("green").text(eventTitle, { align: "center" });
      doc.moveDown(2);

      doc.fontSize(16).text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};

