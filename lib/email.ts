import nodemailer from 'nodemailer';
import { IOrder } from '@/types';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOrderConfirmationEmail(order: IOrder) {
  const itemsList = order.items
    .map(
      (item: any) =>
        `<tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.product?.name || 'Product'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">×${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">₦${item.unitPrice?.toLocaleString() || 0}</td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: #f9f7f4; padding: 20px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; }
          .order-number { color: #c0a080; font-size: 14px; margin-top: 5px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #1a1a1a; margin-bottom: 15px; border-bottom: 2px solid #c0a080; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .summary-item { }
          .summary-label { color: #666; font-size: 14px; margin-bottom: 5px; }
          .summary-value { font-size: 16px; font-weight: bold; color: #1a1a1a; }
          .total-row { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #c0a080; font-size: 18px; font-weight: bold; }
          .cta-button { display: inline-block; background-color: #c0a080; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ruthies Africa</h1>
            <p class="order-number">Order #${order.orderNumber}</p>
          </div>

          <p>Thank you for your purchase! Your order has been confirmed and payment received.</p>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr style="background-color: #f9f7f4;">
                  <th style="padding: 12px; text-align: left; font-weight: bold;">Product</th>
                  <th style="padding: 12px; text-align: center; font-weight: bold;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: bold;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="summary-item">
              <div class="summary-label">Subtotal</div>
              <div class="summary-value">₦${order.subtotal?.toLocaleString() || 0}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Shipping</div>
              <div class="summary-value">₦${order.shippingFee?.toLocaleString() || 0}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Tax</div>
              <div class="summary-value">₦${(order as any).tax?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div class="total-row">
            <span>Total Amount Paid:</span>
            <span>₦${order.total?.toLocaleString() || 0}</span>
          </div>

          <div class="section">
            <div class="section-title">Shipping Address</div>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}<br>
              ${order.shippingAddress.phone}
            </p>
          </div>

          <p>Your order will be processed and shipped shortly. You will receive tracking information via email as soon as it's ready.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" class="cta-button">Track Your Order</a>

          <div class="footer">
            <p>© 2024 Ruthies Africa. We style, you slay.</p>
            <p>If you have any questions, please reply to this email or visit our website.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: order.email,
    subject: `Order Confirmed - #${order.orderNumber} | Ruthies Africa`,
    html,
  });
}

export async function sendOrderShippedEmail(
  orderNumber: string,
  email: string,
  trackingNumber?: string,
  trackingUrl?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: #f9f7f4; padding: 20px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; }
          .tracking-info { background-color: #f9f7f4; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .cta-button { display: inline-block; background-color: #c0a080; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ruthies Africa</h1>
            <p>Your Order Has Shipped! 🎉</p>
          </div>

          <p>Great news! Your order <strong>#${orderNumber}</strong> has been shipped and is on its way to you.</p>

          ${
            trackingNumber
              ? `
            <div class="tracking-info">
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              ${trackingUrl ? `<a href="${trackingUrl}" class="cta-button">Track Package</a>` : ''}
            </div>
          `
              : ''
          }

          <p>You can track your package in real-time on the courier's website using your tracking number above.</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}" class="cta-button">View Order</a>

          <div class="footer">
            <p>© 2024 Ruthies Africa. We style, you slay.</p>
            <p>If you have any questions, please reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Your Order Has Shipped - #${orderNumber} | Ruthies Africa`,
    html,
  });
}

export async function sendOrderStatusUpdateEmail(
  orderNumber: string,
  email: string,
  status: string,
  message: string
) {
  const statusLabels: { [key: string]: string } = {
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a1a1a; color: #f9f7f4; padding: 20px; text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; }
          .status-badge { display: inline-block; background-color: #c0a080; color: white; padding: 8px 16px; border-radius: 4px; margin: 10px 0; font-weight: bold; }
          .cta-button { display: inline-block; background-color: #c0a080; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ruthies Africa</h1>
            <p>Order Status Update</p>
          </div>

          <p>Your order <strong>#${orderNumber}</strong> has been updated.</p>

          <div class="status-badge">${statusLabels[status] || status.toUpperCase()}</div>

          <p>${message}</p>

          <a href="${process.env.NEXT_PUBLIC_APP_URL}/track-order" class="cta-button">Track Your Order</a>

          <div class="footer">
            <p>© 2024 Ruthies Africa. We style, you slay.</p>
            <p>If you have any questions, please reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Order Update - #${orderNumber} | Ruthies Africa`,
    html,
  });
}

export async function sendNewsletterEmail(
  {
    email,
    name,
    subject,
    htmlContent,
  }: {
    email: string;
    name: string;
    subject: string;
    htmlContent: string;
  }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .unsubscribe { text-align: center; color: #999; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
          a { color: #c0a080; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          ${htmlContent}
          
          <div class="unsubscribe">
            <p>© 2024 Ruthies Africa. We style, you slay.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html,
  });
}
