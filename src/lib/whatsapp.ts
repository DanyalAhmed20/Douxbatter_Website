import type { Order, OrderItem } from './types';

const WHATSAPP_NUMBER = '971507467480';

/**
 * Generate WhatsApp message for order notification
 */
export function generateOrderMessage(order: Order): string {
  const itemsList = order.items
    .map((item: OrderItem) => {
      let line = `- ${item.productName} (${item.variantName}) x${item.quantity} = ${Number(item.totalPrice).toFixed(2)} AED`;
      if (item.selectedSauces && item.selectedSauces.length > 0) {
        line += `\n  Sauces: ${item.selectedSauces.join(', ')}`;
      }
      return line;
    })
    .join('\n');

  const message = `
*New Order #${order.referenceNumber}*

*Customer Details:*
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}

*Delivery Details:*
City: ${order.city}
Address: ${order.deliveryAddress}
Type: ${order.deliveryType === 'express' ? 'Express Delivery' : 'Standard Delivery'}
Date: ${order.deliveryDate}
Time: ${order.deliveryTimeSlot}

*Order Items:*
${itemsList}

*Total: ${Number(order.total).toFixed(2)} AED*

Payment Status: ${order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
`.trim();

  return message;
}

/**
 * Generate WhatsApp URL for order notification
 */
export function generateWhatsAppUrl(order: Order): string {
  const message = generateOrderMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

/**
 * Generate WhatsApp URL for customer to contact about their order
 */
export function generateCustomerWhatsAppUrl(referenceNumber: string): string {
  const message = `Hi! I have a question about my order #${referenceNumber}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}
