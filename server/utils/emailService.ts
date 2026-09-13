import nodemailer from 'nodemailer';
import { query, queryOne } from '../db/db.ts';

export interface SmtpConfig {
  smtp_enabled: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
  smtp_from_email: string;
  admin_notification_email: string;
}

export function getSmtpConfig(): SmtpConfig {
  const rows = query<{ key: string; value: string }>(
    `SELECT key, value FROM site_settings WHERE key LIKE 'smtp_%' OR key IN ('contact_email', 'site_name', 'admin_notification_email')`
  );
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }

  const enabled = map['smtp_enabled'] === '1';
  const host = map['smtp_host'] || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(map['smtp_port'] || process.env.SMTP_PORT || '465', 10);
  const secure = map['smtp_secure'] === '1' || port === 465;
  const user = map['smtp_user'] || process.env.SMTP_USER || '';
  const pass = map['smtp_pass'] || process.env.SMTP_PASS || '';
  const siteName = map['site_name'] || 'SHOPHATBD';
  const fromName = map['smtp_from_name'] || `${siteName} Support`;
  const fromEmail = map['smtp_from_email'] || user || map['contact_email'] || 'noreply@shophatbd.com';
  const adminEmail = map['admin_notification_email'] || map['contact_email'] || 'liakot911@gmail.com';

  return {
    smtp_enabled: enabled && !!user && !!pass,
    smtp_host: host,
    smtp_port: port,
    smtp_secure: secure,
    smtp_user: user,
    smtp_pass: pass,
    smtp_from_name: fromName,
    smtp_from_email: fromEmail,
    admin_notification_email: adminEmail
  };
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_secure,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Send an email alert to the store administrator when a customer submits "Send Us a Quick Message"
 */
export async function sendAdminNewMessageAlert(params: {
  name: string;
  email?: string;
  phone?: string;
  message: string;
  messageId: string;
  createdAt?: string;
}): Promise<{ sent: boolean; message?: string }> {
  const config = getSmtpConfig();

  if (!config.smtp_enabled) {
    console.log('[EmailService] SMTP is not enabled or not fully configured. Message recorded in database.');
    return {
      sent: false,
      message: 'SMTP is not enabled. Inquiries are securely stored in the Admin Inbox.'
    };
  }

  try {
    const transporter = createTransporter(config);
    const siteName = queryOne<any>('SELECT value FROM site_settings WHERE key = "site_name"')?.value || 'SHOPHATBD';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #F97316; padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">${siteName} - নতুন কাস্টমার মেসেজ</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">কাস্টমার সাপোর্ট পেজ থেকে নতুন একটি মেসেজ জমা হয়েছে।</p>
        </div>
        
        <div style="padding: 24px;">
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; width: 120px; color: #64748B;">কাস্টমারের নাম:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">${params.name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748B;">মোবাইল নম্বর:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">${params.phone ? `<a href="tel:${params.phone}" style="color: #F97316; text-decoration: none;">${params.phone}</a>` : 'উল্লেখ নেই'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748B;">ইমেইল অ্যাড্রেস:</td>
                <td style="padding: 6px 0; font-weight: 600; color: #0F172A;">${params.email ? `<a href="mailto:${params.email}" style="color: #F97316; text-decoration: none;">${params.email}</a>` : 'উল্লেখ নেই'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #64748B;">সময়:</td>
                <td style="padding: 6px 0; color: #64748B;">${new Date().toLocaleString('bn-BD')}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <p style="font-size: 12px; font-weight: bold; color: #64748B; text-transform: uppercase; margin-bottom: 8px;">কাস্টমারের বার্তা:</p>
            <div style="background: #FFF7ED; border-left: 4px solid #F97316; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #1E293B; border-radius: 4px; white-space: pre-wrap;">${params.message}</div>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <p style="font-size: 12px; color: #94A3B8; margin: 0;">এই বার্তাটি ${siteName} স্টোরের ইনবক্সে সংরক্ষিত আছে। আপনি অ্যাডমিন প্যানেল থেকে সরাসরি উত্তর দিতে পারেন।</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: config.admin_notification_email,
      replyTo: params.email || undefined,
      subject: `[${siteName}] নতুন বার্তা: ${params.name}`,
      html
    });

    console.log(`[EmailService] Admin alert email sent successfully to ${config.admin_notification_email}`);
    return { sent: true };
  } catch (err: any) {
    console.error('[EmailService] Failed to send admin email alert:', err);
    return { sent: false, message: err.message };
  }
}

/**
 * Send an auto-acknowledgement email to the customer if an email was provided
 */
export async function sendCustomerAutoReply(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const config = getSmtpConfig();
  if (!config.smtp_enabled || !params.email) return;

  try {
    const transporter = createTransporter(config);
    const siteName = queryOne<any>('SELECT value FROM site_settings WHERE key = "site_name"')?.value || 'SHOPHATBD';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #F97316; padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">${siteName} কাস্টমার সাপোর্ট</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">আপনার বার্তাটি আমাদের কাছে সফলভাবে পৌঁছেছে!</p>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
          <p>প্রিয় <strong>${params.name}</strong>,</p>
          <p>আমাদের সাথে যোগাযোগ করার জন্য ধন্যবাদ। আমরা আপনার বার্তাটি পেয়েছি এবং আমাদের কাস্টমার কেয়ার টিম দ্রুত আপনার সাথে যোগাযোগ করবে।</p>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 16px; margin: 20px 0;">
            <p style="font-size: 11px; font-weight: bold; color: #64748B; margin: 0 0 6px 0; text-transform: uppercase;">আপনার পাঠানো বার্তা:</p>
            <p style="margin: 0; font-style: italic; color: #475569;">"${params.message}"</p>
          </div>

          <p style="margin-top: 24px; font-size: 13px; color: #64748B;">ধন্যবাদান্তে,<br><strong style="color: #0F172A;">${siteName} টিম</strong></p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: params.email,
      subject: `আপনার বার্তাটি পেয়েছি - ${siteName}`,
      html
    });
  } catch (err) {
    console.error('[EmailService] Auto-reply failed:', err);
  }
}

/**
 * Send an email directly to a customer from Admin panel
 */
export async function sendAdminDirectReply(params: {
  toEmail: string;
  customerName: string;
  replySubject: string;
  replyContent: string;
  originalMessage?: string;
}): Promise<{ success: boolean; message: string }> {
  const config = getSmtpConfig();
  if (!config.smtp_enabled) {
    return {
      success: false,
      message: 'SMTP সার্ভার কনফিগার করা নেই। অনুগ্রহ করে সাইট সেটিংসে SMTP কনফিগারেশন সেট করুন।'
    };
  }

  try {
    const transporter = createTransporter(config);
    const siteName = queryOne<any>('SELECT value FROM site_settings WHERE key = "site_name"')?.value || 'SHOPHATBD';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #F97316; padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">${siteName} কাস্টমার সাপোর্ট</h2>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
          <p>প্রিয় <strong>${params.customerName}</strong>,</p>
          <div style="white-space: pre-wrap; margin: 16px 0; color: #1E293B;">${params.replyContent}</div>
          
          ${
            params.originalMessage
              ? `<div style="background: #F8FAFC; border-left: 3px solid #CBD5E1; padding: 12px 14px; margin: 20px 0; font-size: 12px; color: #64748B;">
                  <strong>আপনার পূর্বের বার্তা:</strong><br>${params.originalMessage}
                </div>`
              : ''
          }

          <p style="margin-top: 24px; font-size: 13px; color: #64748B;">ধন্যবাদান্তে,<br><strong style="color: #0F172A;">${config.smtp_from_name}</strong></p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: params.toEmail,
      subject: params.replySubject || `${siteName} সাপোর্ট থেকে উত্তর`,
      html
    });

    return { success: true, message: 'ইমেইল সফলভাবে কাস্টমারকে পাঠানো হয়েছে!' };
  } catch (err: any) {
    console.error('[EmailService] Failed to send direct reply:', err);
    return { success: false, message: `ইমেইল পাঠানো যায়নি: ${err.message}` };
  }
}

/**
 * Test SMTP credentials
 */
export async function testSmtpSettings(testConfig: Partial<SmtpConfig> & { test_recipient?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const config = {
      ...getSmtpConfig(),
      ...testConfig
    };

    if (!config.smtp_user || !config.smtp_pass || !config.smtp_host) {
      return { success: false, message: 'SMTP Host, User এবং Password পূরণ করা আবশ্যক।' };
    }

    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: Number(config.smtp_port) || 465,
      secure: config.smtp_secure !== undefined ? Boolean(config.smtp_secure) : Number(config.smtp_port) === 465,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();

    const recipient = testConfig.test_recipient || config.admin_notification_email || config.smtp_user;

    await transporter.sendMail({
      from: `"${config.smtp_from_name || 'SHOPHATBD'}" <${config.smtp_from_email || config.smtp_user}>`,
      to: recipient,
      subject: '✅ SHOPHATBD - SMTP টেস্ট সফল হয়েছে',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px; background: #ecfdf5;">
          <h2 style="color: #065f46; margin-top: 0;">🎉 টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!</h2>
          <p style="color: #047857;">আপনার শপের SMTP কনফিগারেশন সম্পূর্ণ সঠিক এবং কার্যক্ষম। এখন থেকে কাস্টমার "Send Us a Quick Message" এ বার্তা পাঠালে তা সরাসরি আপনার এই ইমেইলে নোটিফিকেশন আকারে চলে আসবে।</p>
          <hr style="border: 0; border-top: 1px solid #a7f3d0; margin: 16px 0;">
          <p style="font-size: 12px; color: #065f46; margin: 0;">কনফিগারেশন হোস্ট: <strong>${config.smtp_host}:${config.smtp_port}</strong> | প্রেরক: <strong>${config.smtp_user}</strong></p>
        </div>
      `
    });

    return {
      success: true,
      message: `টেস্ট ইমেইল সফলভাবে ${recipient} এ পাঠানো হয়েছে!`
    };
  } catch (err: any) {
    console.error('[EmailService] SMTP Test failed:', err);
    return {
      success: false,
      message: `SMTP কানেকশন ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`
    };
  }
}
