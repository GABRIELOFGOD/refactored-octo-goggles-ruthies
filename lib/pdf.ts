import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IOrder } from '@/types';

export async function generateOrderPDF(
  orderId: string,
  order: IOrder
): Promise<Blob> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #1a1a1a;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #c0a080;
            padding-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            color: #1a1a1a;
          }
          .header .subtitle {
            color: #c0a080;
            font-size: 14px;
            margin-top: 5px;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
          }
          .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f9f7f4;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #c0a080;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          .summary {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #c0a080;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            font-size: 18px;
            font-weight: bold;
            color: #c0a080;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RUTHIES AFRICA</h1>
            <p class="subtitle">We style, you slay.</p>
          </div>

          <div class="section">
            <div class="two-column">
              <div>
                <div class="section-title">Order Information</div>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</p>
                <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
              </div>
              <div>
                <div class="section-title">Billing Information</div>
                <p><strong>Email:</strong> ${order.email}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>${order.shippingAddress?.name}</p>
            <p>${order.shippingAddress?.street}</p>
            <p>${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}</p>
            <p>${order.shippingAddress?.country}</p>
            <p>${order.shippingAddress?.phone}</p>
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>
                      ${item.product?.name || 'Product'}
                      ${
                        item.variant
                          ? `<br><small>${item.variant.size || ''} ${item.variant.color || ''}</small>`
                          : ''
                      }
                    </td>
                    <td>${item.quantity}</td>
                    <td>₦${item.unitPrice?.toLocaleString() || '0'}</td>
                    <td>₦${(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₦${order.subtotal?.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Shipping Fee:</span>
                <span>₦${order.shippingFee?.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Tax (7.5%):</span>
                <span>₦${((order as any).tax?.toLocaleString() || 0)}</span>
              </div>
              <div class="total-row">
                <span>TOTAL AMOUNT PAID:</span>
                <span>₦${order.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          ${
            order.trackingNumber
              ? `
            <div class="section">
              <div class="section-title">Tracking Information</div>
              <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
              ${order.trackingUrl ? `<p><strong>Tracking URL:</strong> <a href="${order.trackingUrl}">${order.trackingUrl}</a></p>` : ''}
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>&copy; 2024 Ruthies Africa. All rights reserved.</p>
            <p>Thank you for your purchase!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Convert HTML to Canvas then to PDF
  const canvas = await html2canvas(
    new DOMParser().parseFromString(html, 'text/html').documentElement,
    {
      backgroundColor: '#ffffff',
      scale: 2,
    }
  );

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 10;

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight + 10;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output('blob');
}
