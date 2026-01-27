import type { Order } from './types';
import { formatCurrency, formatDate } from './order-utils';

const WHATSAPP_BUSINESS_NUMBER = process.env.WHATSAPP_BUSINESS_NUMBER || '971507467480';

// Generate formatted order message for WhatsApp
export function generateOrderMessage(order: Order): string {
  const itemsList = order.items
    .map((item) => {
      let line = `- ${item.productName} (${item.variantName}) x${item.quantity} - ${formatCurrency(item.totalPrice)}`;
      if (item.selectedSauces && item.selectedSauces.length > 0) {
        line += `\n  Sauces: ${item.selectedSauces.join(', ')}`;
      }
      return line;
    })
    .join('\n');

  const message = `*New Order from DouxBatter*

*Order #:* ${order.referenceNumber}

*Customer Details:*
Name: ${order.customerName}
Phone: ${order.customerPhone}
${order.customerEmail ? `Email: ${order.customerEmail}` : ''}

*Delivery Details:*
City: ${order.city}
Address: ${order.deliveryAddress}
Type: ${order.deliveryType === 'express' ? 'Express' : 'Standard'} Delivery
Date: ${formatDate(order.deliveryDate)}
${order.deliveryTimeSlot ? `Time Slot: ${order.deliveryTimeSlot}` : ''}

*Order Items:*
${itemsList}

*Subtotal:* ${formatCurrency(order.subtotal)}
*Delivery:* ${formatCurrency(order.total - order.subtotal)}
*Total:* ${formatCurrency(order.total)}

*Payment Status:* ${order.paymentStatus.toUpperCase()}`;

  return message;
}

// Generate WhatsApp URL for business notification
export function generateWhatsAppUrl(order: Order): string {
  const message = generateOrderMessage(order);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
}

// Generate WhatsApp URL for customer support
export function generateCustomerWhatsAppUrl(referenceNumber: string): string {
  const message = `Hi! I have a question about my order #${referenceNumber}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodedMessage}`;
}

// Generate WhatsApp contact URL (no message)
export function getWhatsAppContactUrl(): string {
  return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`;
}
