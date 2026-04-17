import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/models/Order';
import connectToDatabase from '@/lib/mongoose';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectToDatabase();

    const order = await Order.findById(params.orderId).populate('items.product');

    if (!order) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Basic HTML template for PDF
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
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #1a1a1a;
              margin: 20px 0 10px 0;
              padding-bottom: 8px;
              border-bottom: 1px solid #e0e0e0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th {
              background-color: #f9f7f4;
              padding: 10px;
              text-align: left;
              font-weight: bold;
              border-bottom: 2px solid #c0a080;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e0e0e0;
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
              font-size: 16px;
              font-weight: bold;
              color: #c0a080;
              border-top: 2px solid #c0a080;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>RUTHIES AFRICA</h1>
              <p style="color: #c0a080; margin: 5px 0;">Order Receipt</p>
            </div>

            <div>
              <strong>Order Number:</strong> ${order.orderNumber}<br>
              <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}<br>
              <strong>Status:</strong> ${order.status.toUpperCase()}<br>
              <strong>Email:</strong> ${order.email}
            </div>

            <h3 class="section-title">Shipping Address</h3>
            <div>
              ${order.shippingAddress?.name}<br>
              ${order.shippingAddress?.street}<br>
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}<br>
              ${order.shippingAddress?.country}
            </div>

            <h3 class="section-title">Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${item.product?.name || 'Product'}</td>
                    <td>${item.quantity}</td>
                    <td>₦${item.unitPrice?.toLocaleString() || '0'}</td>
                    <td>₦${(item.unitPrice * item.quantity).toLocaleString()}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div style="margin: 20px 0;">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₦${order.subtotal?.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>₦${order.shippingFee?.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>₦${((order as any).tax?.toLocaleString() || 0)}</span>
              </div>
              <div class="total-row">
                <span>TOTAL:</span>
                <span>₦${order.total?.toLocaleString()}</span>
              </div>
            </div>

            <p style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
              &copy; 2024 Ruthies Africa. Thank you for your purchase!
            </p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="order-${order.orderNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Download receipt error:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to download receipt' },
      { status: 500 }
    );
  }
}
