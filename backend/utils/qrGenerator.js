const QRCode = require('qr-image');
const crypto = require('crypto');

class QRGenerator {
    // Generate unique QR code data
    static generateUniqueData() {
        return `EMP-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    }

    // Generate QR code image
    static generateQRImage(data) {
        try {
            const qr_png = QRCode.image(data, { type: 'png' });
            return qr_png;
        } catch (error) {
            throw new Error('QR code generation failed: ' + error.message);
        }
    }

    // Generate QR code as base64
    static generateQRBase64(data) {
        try {
            const qr_png = QRCode.imageSync(data, { type: 'png' });
            return qr_png.toString('base64');
        } catch (error) {
            throw new Error('QR code generation failed: ' + error.message);
        }
    }

    // Validate QR code format
    static isValidQRFormat(qrData) {
        return qrData && qrData.startsWith('EMP-') && qrData.length === 28;
    }
}

module.exports = QRGenerator;