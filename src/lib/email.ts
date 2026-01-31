import { Resend } from 'resend';
import type { Order } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'orders@douxbatter.ae';

export async function sendAdminNewOrderNotification(order: Order): Promise<boolean> {
  if (!ADMIN_EMAIL || !process.env.RESEND_API_KEY) {
    console.log('Email not configured, skipping notification');
    return false;
  }

  const itemsList = order.items
    .map(
      (item) =>
        `• ${item.productName} - ${item.variantName} x${item.quantity} (AED ${item.totalPrice.toFixed(2)})`
    )
    .join('\n');

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333; border-bottom: 2px solid #f0c14b; padding-bottom: 10px;">
        🎂 New Order Received!
      </h1>

      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #333; margin-top: 0;">Order #${order.referenceNumber}</h2>
        <p style="color: #666; margin: 5px 0;">
          <strong>Status:</strong> ${order.status} | <strong>Payment:</strong> ${order.paymentStatus}
        </p>
      </div>

      <h3 style="color: #333;">Customer Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Name:</td>
          <td style="padding: 8px 0;"><strong>${order.customerName}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Phone:</td>
          <td style="padding: 8px 0;"><strong>${order.customerPhone}</strong></td>
        </tr>
        ${order.customerEmail ? `
        <tr>
          <td style="padding: 8px 0; color: #666;">Email:</td>
          <td style="padding: 8px 0;"><strong>${order.customerEmail}</strong></td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #666;">City:</td>
          <td style="padding: 8px 0;"><strong>${order.city}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Address:</td>
          <td style="padding: 8px 0;"><strong>${order.deliveryAddress}</strong></td>
        </tr>
      </table>

      <h3 style="color: #333;">Delivery</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Type:</td>
          <td style="padding: 8px 0;"><strong>${order.deliveryType === 'express' ? 'Express' : 'Standard'}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Date:</td>
          <td style="padding: 8px 0;"><strong>${order.deliveryDate}</strong></td>
        </tr>
        ${order.deliveryTimeSlot ? `
        <tr>
          <td style="padding: 8px 0; color: #666;">Time Slot:</td>
          <td style="padding: 8px 0;"><strong>${order.deliveryTimeSlot}</strong></td>
        </tr>
        ` : ''}
      </table>

      <h3 style="color: #333;">Order Items</h3>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
        <pre style="margin: 0; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
      </div>

      <div style="background-color: #333; color: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: right;">
        <p style="margin: 5px 0;">Subtotal: AED ${order.subtotal.toFixed(2)}</p>
        <p style="margin: 5px 0; font-size: 1.2em;"><strong>Total: AED ${order.total.toFixed(2)}</strong></p>
      </div>

      <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
        View and manage this order in the <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/dashboard/orders/${order.id}" style="color: #f0c14b;">Admin Dashboard</a>
      </p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from: `DouxBatter Orders <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `🎂 New Order #${order.referenceNumber} - AED ${order.total.toFixed(2)}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Failed to send admin notification email:', error);
      return false;
    }

    console.log('Admin notification email sent for order:', order.referenceNumber);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
}
