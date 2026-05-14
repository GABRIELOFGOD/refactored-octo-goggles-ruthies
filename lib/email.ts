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

// Booking-related email functions
export async function sendBookingConfirmationEmail(data: {
  email: string;
  userName: string;
  serviceName: string;
  bookingNumber: string;
  scheduledDate: string;
  scheduledTime?: string;
  total: number;
  currency: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .details { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Booking Confirmed</h1>
            <p>Thank you for booking with us!</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Your service booking has been successfully confirmed. Here are your booking details:</p>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">Booking Number:</span>
                <span>${data.bookingNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span>${data.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${data.scheduledDate}</span>
              </div>
              ${
                data.scheduledTime
                  ? `<div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${data.scheduledTime}</span>
              </div>`
                  : ''
              }
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span>${data.currency} ${data.total}</span>
              </div>
            </div>
            
            <p>If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Ruthies Africa. We style, you slay.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: `Booking Confirmation - ${data.bookingNumber} | Ruthies Africa`,
    html,
  });
}

export async function sendBookingCompletionEmail(data: {
  email: string;
  userName: string;
  serviceName: string;
  bookingNumber: string;
  message?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .success-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Service Completed</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Great news! Your service has been completed.</p>
            
            <div class="success-box">
              <p><strong>Booking Number:</strong> ${data.bookingNumber}</p>
              <p><strong>Service:</strong> ${data.serviceName}</p>
              <p style="color: #10b981; font-weight: bold;">Status: ✓ Completed</p>
            </div>
            
            ${data.message ? `<p>${data.message}</p>` : ''}
            
            <p>Thank you for choosing Ruthies Africa!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Ruthies Africa. We style, you slay.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: `Service Completed - ${data.bookingNumber} | Ruthies Africa`,
    html,
  });
}

export async function sendCustomNotificationEmail(data: {
  email: string;
  userName: string;
  subject: string;
  title: string;
  message: string;
  details?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title}</h1>
          </div>
          
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <div class="message-box">
              <p>${data.message}</p>
              ${data.details ? `<p style="color: #666; font-size: 14px; margin-top: 10px;">${data.details}</p>` : ''}
            </div>
            
            <p>Best regards,<br/>Ruthies Africa Team</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 Ruthies Africa. We style, you slay.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: data.subject,
    html,
  });
}
