const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePdf(bookingDetails, invoicePath) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const writeStream = fs.createWriteStream(invoicePath);
        doc.pipe(writeStream);

        const primaryColor = '#0d9488'; // Teal
        const fontColor = '#333333';
        const lightGray = '#f3f4f6';

        const generateHr = (y) => doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(lightGray).stroke();

        // --- Header ---
        doc.rect(0, 0, doc.page.width, 90).fill(primaryColor);
        doc.fontSize(22).fillColor('#FFFFFF').font('Helvetica-Bold').text('Voyage Travel Agency', { align: 'center' }, 40);
        doc.fontSize(16).fillColor('#FFFFFF').font('Helvetica-Bold').text('INVOICE', 0, 48, { align: 'right', marginRight: 40 });
        doc.y = 110;

        // --- Billing & Invoice Details ---
        doc.fillColor(fontColor).fontSize(10);
        const infoTop = doc.y;
        const leftX = 40;
        const rightX = 350;

        doc.font('Helvetica-Bold').text('Bill To:', leftX, infoTop);
        doc.font('Helvetica').text(bookingDetails.clientName, leftX, infoTop + 15);
        doc.text(bookingDetails.clientEmail, leftX, infoTop + 30);
        doc.text(bookingDetails.clientPhone, leftX, infoTop + 45);
        
        doc.font('Helvetica-Bold').text('Invoice #:', rightX, infoTop);
        doc.font('Helvetica').text(bookingDetails.transactionId, rightX + 80, infoTop);
        doc.font('Helvetica-Bold').text('Booking Date:', rightX, infoTop + 15);
        doc.font('Helvetica').text(new Date(bookingDetails.createdAt).toLocaleDateString('en-IN'), rightX + 80, infoTop + 15);
        
        doc.y = infoTop + 65;
        generateHr(doc.y);
        doc.moveDown(2);

        // --- Trip Details Section ---
        doc.fontSize(12).font('Helvetica-Bold').text('Your Trip Details', leftX, doc.y);
        doc.moveDown();
        const tripDetailsTop = doc.y;
        doc.fontSize(10);
        doc.font('Helvetica-Bold').text('Package:', leftX + 10, tripDetailsTop).font('Helvetica').text(bookingDetails.packageName, leftX + 110, tripDetailsTop);
        doc.font('Helvetica-Bold').text('Location:', leftX + 10, tripDetailsTop + 15).font('Helvetica').text(bookingDetails.location, leftX + 110, tripDetailsTop + 15);
        doc.font('Helvetica-Bold').text('Duration:', leftX + 10, tripDetailsTop + 30).font('Helvetica').text(bookingDetails.duration, leftX + 110, tripDetailsTop + 30);
        doc.font('Helvetica-Bold').text('Travel Date:', rightX, tripDetailsTop).font('Helvetica').text(new Date(bookingDetails.date).toLocaleDateString('en-IN'), rightX + 80, tripDetailsTop);
        doc.font('Helvetica-Bold').text('Guests:', rightX, tripDetailsTop + 15).font('Helvetica').text(bookingDetails.guests, rightX + 80, tripDetailsTop + 15);
        if (bookingDetails.requests) {
             doc.font('Helvetica-Bold').text('Special Requests:', leftX + 10, tripDetailsTop + 50).font('Helvetica').text(bookingDetails.requests, leftX + 110, tripDetailsTop + 50, { width: 400 });
        }
        doc.y = tripDetailsTop + 80;
        generateHr(doc.y);
        doc.moveDown(2);

        // --- Payment Summary Table ---
        doc.fontSize(12).font('Helvetica-Bold').text('Payment Summary', leftX, doc.y);
        doc.moveDown();
        const tableTop = doc.y;
        
        doc.rect(40, tableTop, doc.page.width - 80, 25).fill(lightGray);
        doc.fillColor(fontColor).fontSize(10).font('Helvetica-Bold');
        doc.text('Description', 50, tableTop + 8);
        doc.text('Unit Price', 300, tableTop + 8, { width: 90, align: 'right' });
        doc.text('Quantity', 390, tableTop + 8, { width: 90, align: 'right' });
        doc.text('Total', 0, tableTop + 8, { align: 'right', marginRight: 40 });

        const itemTop = tableTop + 35;
        const totalAmount = bookingDetails.totalAmount;
        const unitPrice = totalAmount / bookingDetails.guests;
        doc.fillColor(fontColor).fontSize(10).font('Helvetica');
        doc.text(bookingDetails.packageName, 50, itemTop);
        // FIX: Added '₹' symbol to all amounts
        doc.text(`₹${unitPrice.toLocaleString('en-IN')}`, 300, itemTop, { width: 90, align: 'right' });
        doc.text(bookingDetails.guests.toString(), 390, itemTop, { width: 90, align: 'right' });
        doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 0, itemTop, { align: 'right', marginRight: 40 });
        
        const totalY = itemTop + 40;
        doc.moveTo(350, totalY).lineTo(doc.page.width - 40, totalY).strokeColor('#aaaaaa').stroke();
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Total Paid', 350, totalY + 10, { align: 'left' });
        // FIX: Added '₹' symbol to all amounts
        doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, 0, totalY + 10, { align: 'right', marginRight: 40 });
        doc.moveTo(350, totalY + 25).lineTo(doc.page.width - 40, totalY + 25).strokeColor('#aaaaaa').stroke();

        // --- Footer ---
        doc.fontSize(8).font('Helvetica').text(
            'Thank you for your business! If you have any questions, please contact us at hello@voyage.com.', 
            40, doc.page.height - 50, 
            { align: 'center', width: doc.page.width - 80 }
        );

        doc.end();
        writeStream.on('finish', () => resolve());
        writeStream.on('error', (err) => reject(err));
    });
}

module.exports = { generateInvoicePdf };