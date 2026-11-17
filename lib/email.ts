import nodemailer from 'nodemailer';
import { Order } from './db';
import { STORE_EMAIL, STORE_PHONE, getDeliveryZoneLabel } from './notifications';

function generateHtmlReceipt(order: Order, isForCustomer: boolean): string {
  const zoneLabel = getDeliveryZoneLabel(order.deliveryZone);
  const paymentLabel = order.paymentMethod === 'cod'
    ? 'Cash on Delivery (Pay upon delivery)'
    : `${order.paymentMethod.toUpperCase()} Personal / Send Money`;

  const itemsRows = order.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f0ede8;">
        <td style="padding: 12px 8px; font-size: 13px; color: #1c1917; font-weight: 500;">
          ${item.name}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #57534e; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #57534e; text-align: right;">
          ৳${item.price}
        </td>
        <td style="padding: 12px 8px; font-size: 13px; color: #1c1917; font-weight: 600; text-align: right;">
          ৳${item.price * item.quantity}
        </td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${isForCustomer ? `Order Confirmation #${order.id}` : `New Store Order #${order.id}`}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #faf8f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #faf8f5; padding: 24px 12px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <!-- Header with Brand Name -->
            <tr>
              <td style="background-color: #0c0a09; padding: 28px 24px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                  শাজগুরি (Shajghuri)
                </h1>
                <p style="margin: 6px 0 0; color: #f43f5e; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                  Authentic Handcrafted Jewelry & Ornaments
                </p>
              </td>
            </tr>

            <!-- Banner Message -->
            <tr>
              <td style="padding: 24px 28px; background-color: #fff1f2; border-bottom: 1px solid #ffe4e6;">
                <p style="margin: 0; color: #9f1239; font-size: 15px; font-weight: 600;">
                  ${isForCustomer 
                    ? `Thank You, ${order.customerName}! Your Jewelry Order #${order.id} is Confirmed.` 
                    : `🎉 New Order Received: #${order.id} (৳${order.total})`
                  }
                </p>
                <p style="margin: 4px 0 0; color: #44403c; font-size: 12px;">
                  ${isForCustomer 
                    ? 'Our atelier has received your order and is currently preparing your pieces with protective signature packaging.' 
                    : `Customer ${order.customerName} (${order.phone}) placed a new order via the website.`
                  }
                </p>
              </td>
            </tr>

            <!-- Order Information Details -->
            <tr>
              <td style="padding: 24px 28px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" valign="top" style="padding-right: 12px;">
                      <h4 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #78716c;">
                        Delivery Details
                      </h4>
                      <p style="margin: 0; font-size: 13px; color: #1c1917; font-weight: 600;">
                        ${order.customerName}
                      </p>
                      <p style="margin: 4px 0 0; font-size: 12px; color: #57534e; line-height: 1.4;">
                        ${order.address}<br>
                        ${order.city} (${zoneLabel})
                      </p>
                      <p style="margin: 6px 0 0; font-size: 12px; color: #1c1917;">
                        📞 <strong>Phone:</strong> ${order.phone}
                      </p>
                      ${order.email ? `<p style="margin: 3px 0 0; font-size: 12px; color: #57534e;">✉️ <strong>Email:</strong> ${order.email}</p>` : ''}
                    </td>

                    <td width="50%" valign="top" style="padding-left: 12px;">
                      <h4 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #78716c;">
                        Order Protocol
                      </h4>
                      <p style="margin: 0; font-size: 12px; color: #57534e;">
                        <strong>Order Ref:</strong> #${order.id}
                      </p>
                      <p style="margin: 4px 0 0; font-size: 12px; color: #57534e;">
                        <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p style="margin: 4px 0 0; font-size: 12px; color: #57534e;">
                        <strong>Payment:</strong> ${paymentLabel}
                      </p>
                      ${order.trxId ? `<p style="margin: 4px 0 0; font-size: 12px; color: #be123c; font-family: monospace; font-weight: 600;"><strong>TrxID:</strong> ${order.trxId}</p>` : ''}
                      ${order.notes ? `<p style="margin: 6px 0 0; font-size: 11px; color: #78716c; font-style: italic;"><strong>Note:</strong> "${order.notes}"</p>` : ''}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Items Chosen to Buy -->
            <tr>
              <td style="padding: 0 28px 24px;">
                <h4 style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #1c1917; border-bottom: 2px solid #1c1917; padding-bottom: 6px;">
                  ${isForCustomer ? 'Your Selected Jewelry Items' : 'Ordered Items'}
                </h4>
                
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f5f5f4; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #78716c;">
                      <th align="left" style="padding: 8px;">Ornament</th>
                      <th align="center" style="padding: 8px;">Qty</th>
                      <th align="right" style="padding: 8px;">Price</th>
                      <th align="right" style="padding: 8px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRows}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3" style="padding: 12px 8px 4px; text-align: right; font-size: 12px; color: #78716c;">
                        Subtotal:
                      </td>
                      <td style="padding: 12px 8px 4px; text-align: right; font-size: 13px; color: #1c1917; font-weight: 600;">
                        ৳${order.subtotal}
                      </td>
                    </tr>
                    <tr>
                      <td colspan="3" style="padding: 4px 8px; text-align: right; font-size: 12px; color: #78716c;">
                        Delivery Charge:
                      </td>
                      <td style="padding: 4px 8px; text-align: right; font-size: 13px; color: #1c1917; font-weight: 600;">
                        ৳${order.deliveryFee}
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #1c1917;">
                      <td colspan="3" style="padding: 10px 8px; text-align: right; font-size: 14px; color: #1c1917; font-weight: 700;">
                        Total Payable:
                      </td>
                      <td style="padding: 10px 8px; text-align: right; font-size: 18px; color: #e11d48; font-weight: 800;">
                        ৳${order.total}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </td>
            </tr>

            <!-- Footer / Customer Support -->
            <tr>
              <td style="background-color: #fafaf9; border-top: 1px solid #f5f5f4; padding: 20px 28px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #57534e;">
                  Need assistance with this order? We are here for you!
                </p>
                <p style="margin: 6px 0 0; font-size: 12px; color: #1c1917;">
                  📞 <strong>Hotline & WhatsApp:</strong> <a href="tel:+88${STORE_PHONE}" style="color: #e11d48; text-decoration: none; font-weight: 600;">+880 1567-845417</a> &nbsp;|&nbsp; 
                  ✉️ <strong>Email:</strong> <a href="mailto:${STORE_EMAIL}" style="color: #e11d48; text-decoration: none; font-weight: 600;">${STORE_EMAIL}</a>
                </p>
                <p style="margin: 12px 0 0; font-size: 10px; color: #a8a29e;">
                  &copy; ${new Date().getFullYear()} Shajghuri Atelier. Narayanganj & Dhaka, Bangladesh. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Creates the Nodemailer transport dynamically from environment variables
 */
function createTransporter() {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER || STORE_EMAIL;
  // Google App Password (16 characters) or SMTP password
  const pass = process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.EMAIL_APP_PASSWORD;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user.trim(),
      pass: pass.trim().replace(/\s+/g, ''), // strip spaces if copied with spaces
    },
  });
}

export interface EmailDispatchResult {
  businessEmailSent: boolean;
  customerEmailSent: boolean;
  businessError?: string;
  customerError?: string;
}

/**
 * Dispatches confirmation emails to BOTH the business and the customer
 */
export async function dispatchOrderEmails(order: Order): Promise<EmailDispatchResult> {
  const result: EmailDispatchResult = {
    businessEmailSent: false,
    customerEmailSent: false,
  };

  const transporter = createTransporter();

  if (!transporter) {
    const notice = '[Email] EMAIL_APP_PASSWORD is not set in .env.local yet. Set EMAIL_APP_PASSWORD to enable automatic Gmail SMTP delivery.';
    console.warn(notice);
    result.businessError = notice;
    result.customerError = notice;
    return result;
  }

  const senderAddress = `"Shajghuri Atelier" <${process.env.EMAIL_USER || STORE_EMAIL}>`;

  // 1. Send to Business (shajghuri@gmail.com)
  try {
    const businessHtml = generateHtmlReceipt(order, false);
    await transporter.sendMail({
      from: senderAddress,
      to: STORE_EMAIL,
      subject: `🛒 New Order #${order.id} (৳${order.total}) - ${order.customerName}`,
      html: businessHtml,
      text: `New Order #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nTotal: ৳${order.total}\nAddress: ${order.address}`,
    });
    result.businessEmailSent = true;
    console.log(`[Email] Successfully delivered order notification to business (${STORE_EMAIL})`);
  } catch (err: any) {
    console.error('[Email] Failed to send business notification:', err?.message);
    result.businessError = err?.message;
  }

  // 2. Send to Customer if email provided
  if (order.email && order.email.trim()) {
    try {
      const customerHtml = generateHtmlReceipt(order, true);
      await transporter.sendMail({
        from: senderAddress,
        to: order.email.trim(),
        subject: `✨ Order Confirmation #${order.id} - Thank You for Shopping with Shajghuri!`,
        html: customerHtml,
        text: `Thank you for your order #${order.id}!\nTotal: ৳${order.total}\nWe will deliver to: ${order.address}\nHotline: ${STORE_PHONE}`,
      });
      result.customerEmailSent = true;
      console.log(`[Email] Successfully delivered confirmation receipt to customer (${order.email})`);
    } catch (err: any) {
      console.error('[Email] Failed to send customer confirmation:', err?.message);
      result.customerError = err?.message;
    }
  }

  return result;
}
