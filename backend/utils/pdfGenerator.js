const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Generates an exact match of the Code Club (SMC-PRIVATE) Limited Internship Certificate layout
 * with authentic #FFFDF1 background color, subtle watermark, and enlarged prominent logo.
 * @param {Object} certificate The certificate model data.
 * @param {string} verifyUrl The URL that the QR code points to.
 * @returns {Promise<Buffer>} Resolves to a buffer containing the PDF data.
 */
const generateCertificatePDF = async (certificate, verifyUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create A4 Landscape document (841.89 x 595.28 pt)
      const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      const width = doc.page.width;   // 841.89
      const height = doc.page.height; // 595.28

      // Assets paths
      const logoPath = path.join(__dirname, '..', 'assets', 'codeclub_logo.png');
      const watermarkPath = path.join(__dirname, '..', 'assets', 'codeclub_watermark.png');
      const signaturePath = path.join(__dirname, '..', 'assets', 'codeclub_signature.png');

      // 1. Exact Authentic Background Color (#FFFDF1 - Soft Warm Ivory)
      const bgColor = '#FFFDF1';
      doc.rect(0, 0, width, height).fill(bgColor);

      // 2. Background Watermark (Rendered FIRST behind all text at soft 0.055 opacity)
      if (fs.existsSync(watermarkPath)) {
        doc.save();
        doc.opacity(0.055);
        const wmWidth = 430;
        doc.image(watermarkPath, (width - wmWidth) / 2, 70, { width: wmWidth });
        doc.restore();
      }

      // 3. Top Logo (Enlarged prominent Code Club Badge - 98px width)
      if (fs.existsSync(logoPath)) {
        const logoWidth = 98;
        doc.image(logoPath, (width - logoWidth) / 2, 22, { width: logoWidth });
      }

      // 4. Header Titles (Under Logo)
      doc.fillColor('#000000')
         .font('Helvetica-Bold')
         .fontSize(16.5)
         .text('CODE CLUB', 0, 122, { align: 'center', characterSpacing: 0.6 });

      doc.font('Helvetica-Bold')
         .fontSize(13.5)
         .text('(SMC-PRIVATE) LIMITED', 0, 142, { align: 'center', characterSpacing: 0.2 });

      // 5. Internship Header Title (Authentic Blue)
      doc.fillColor('#4E81A4')
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('CERTIFICATE OF INTERNSHIP', 0, 184, { align: 'center', characterSpacing: 2 });

      // Subtitle
      doc.fillColor('#333333')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('THIS CERTIFICATE GOES TO', 0, 220, { align: 'center', characterSpacing: 1.2 });

      // 6. Recipient Student Name (Giant Clean Crisp Bold Black Text ON TOP of watermark)
      doc.fillColor('#000000')
         .font('Helvetica-Bold')
         .fontSize(43)
         .text(certificate.studentName, 0, 240, { align: 'center' });

      // 7. Internee ID in Exact Search Format: CC-[Year]-[Code] (e.g., CC-2026-KFAHMQ)
      doc.fillColor('#555555')
         .font('Helvetica')
         .fontSize(12)
         .text(`Internee id:${certificate.certificateId}`, 0, 310, { align: 'center' });

      // Role / Course Name formatting
      let cleanCourse = (certificate.courseName || 'Frontend developer')
        .replace(/course|certified|bootcamp/gi, '')
        .trim();
      if (!cleanCourse.toLowerCase().includes('developer') && !cleanCourse.toLowerCase().includes('designer') && !cleanCourse.toLowerCase().includes('engineer')) {
        cleanCourse += ' developer';
      }

      const firstLetter = cleanCourse.charAt(0).toLowerCase();
      const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';

      doc.fillColor('#555555')
         .font('Helvetica')
         .fontSize(12.5)
         .text('In recognition of his successful efforts, dedication, and outstanding performance', 60, 330, { width: width - 120, align: 'center', lineGap: 4 });

      doc.text(`during his internship as ${article} ${cleanCourse} at Code Club (SMC-PRIVATE)`, 60, 349, { width: width - 120, align: 'center' });
      doc.text('LIMITED', 60, 368, { width: width - 120, align: 'center' });

      // 8. Duration Period
      const endDateVal = new Date(certificate.issueDate || Date.now());
      const startDateVal = new Date(endDateVal.getTime() - 28 * 24 * 60 * 60 * 1000);
      
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const formattedStart = startDateVal.toLocaleDateString('en-GB', options);
      const formattedEnd = endDateVal.toLocaleDateString('en-GB', options);

      doc.fillColor('#555555')
         .font('Helvetica')
         .fontSize(11.5)
         .text(`Duration: ${formattedStart} to ${formattedEnd}`, 0, 400, { align: 'center' });

      // 9. QR Code Verification Registry (Bottom Left with matching #FFFDF1 background)
      const qrBuffer = await QRCode.toBuffer(verifyUrl, {
        width: 140,
        margin: 1,
        color: {
          dark: '#000000',
          light: bgColor
        }
      });
      doc.image(qrBuffer, 32, 452, { width: 94 });

      // 10. Signature of Muhammad Affan (Bottom Right)
      const sigBoxX = width - 270;
      const sigLineY = 496;

      // Real signature image
      if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, sigBoxX + 60, sigLineY - 46, { width: 88 });
      }

      // Solid baseline divider
      doc.rect(sigBoxX, sigLineY, 210, 4)
         .fillColor('#444F5A')
         .fill();

      // Signature Labels under line
      doc.fillColor('#4E81A4')
         .font('Helvetica-Bold')
         .fontSize(12)
         .text('Muhammad Affan', sigBoxX, sigLineY + 8, { width: 210, align: 'center' });

      doc.fillColor('#777777')
         .font('Helvetica')
         .fontSize(9.5)
         .text('CTO/SECRETARY', sigBoxX, sigLineY + 24, { width: 210, align: 'center', characterSpacing: 0.5 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF
};
