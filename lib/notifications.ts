import { Order } from './db';

export const STORE_PHONE = '01567845417';
export const STORE_WHATSAPP = '8801567845417';
export const STORE_EMAIL = 'shajghuri@gmail.com';
export const STORE_BKASH_NAGAD = '01617398085';

export function getDeliveryZoneLabel(zone: string): string {
  switch (zone) {
    case 'college_road_pickup':
      return 'College Road Pickup Hub (৳20)';
    case 'inside_narayanganj':
      return 'Inside Narayanganj Home Delivery (৳60)';
    case 'outside_narayanganj':
      return 'Outside Narayanganj Nationwide (৳120)';
    default:
      return zone || 'Standard Delivery';
  }
}

export function formatWhatsAppOrderMessage(order: Order): string {
  const zoneLabel = getDeliveryZoneLabel(order.deliveryZone);
  const paymentLabel = order.paymentMethod === 'cod'
    ? 'Cash on Delivery'
    : `${order.paymentMethod.toUpperCase()} (Personal / Send Money)`;

  const itemsList = order.items
    .map((item, idx) => `  ${idx + 1}. ${item.name} (x${item.quantity}) - ৳${item.price * item.quantity}`)
    .join('\n');

  return `*NEW SHAJGHURI ORDER #${order.id}*
---------------------------------------
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.phone}
${order.email ? `📧 *Email:* ${order.email}\n` : ''}📍 *Delivery Address:* ${order.address}
🏙️ *City/Area:* ${order.city}
🚚 *Delivery Zone:* ${zoneLabel}
💳 *Payment:* ${paymentLabel}${order.trxId ? `\n🧾 *Transaction ID:* ${order.trxId}` : ''}${order.notes ? `\n📝 *Notes:* ${order.notes}` : ''}

🛒 *Ordered Ornaments:*
${itemsList}

---------------------------------------
💰 *Subtotal:* ৳${order.subtotal}
🚚 *Delivery Fee:* ৳${order.deliveryFee}
✨ *Total Payable:* ৳${order.total}
---------------------------------------
Shajghuri Online Store • Order Date: ${new Date(order.createdAt).toLocaleDateString()}`;
}

export function getWhatsAppStoreUrl(order: Order): string {
  const message = formatWhatsAppOrderMessage(order);
  return `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function getEmailStoreUrl(order: Order): string {
  const subject = encodeURIComponent(`[New Order #${order.id}] ৳${order.total} from ${order.customerName}`);
  const body = encodeURIComponent(formatWhatsAppOrderMessage(order));
  return `mailto:${STORE_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Dispatches an automated email notification to the store email (shajghuri@gmail.com)
 */
