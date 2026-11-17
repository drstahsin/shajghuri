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
export async function sendEmailNotification(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    const formatted = formatWhatsAppOrderMessage(order);

    // Send automated notification via Web3Forms public API directly to shajghuri@gmail.com
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        // Public access key or fallback to direct email receiver
        access_key: process.env.WEB3FORMS_ACCESS_KEY || 'e9e8f6e2-2a2b-426b-944a-14d232e67540',
        to: STORE_EMAIL,
        from_name: `Shajghuri Store (${order.customerName})`,
        subject: `💎 New Order #${order.id} - ৳${order.total} (${order.customerName})`,
        message: formatted,
        order_id: order.id,
        customer_name: order.customerName,
        customer_phone: order.phone,
        total_amount: `BDT ${order.total}`,
      }),
    });

    const result = await response.json();
    return { success: result.success || response.ok };
  } catch (err: any) {
    console.warn('[Notification] Email dispatch warning (client mailto link remains active):', err?.message);
    return { success: false, error: err?.message };
  }
}
