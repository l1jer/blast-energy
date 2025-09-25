const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS headers
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://blast-energy.vercel.app',
    'https://blastenergy.com.au',
    'https://www.blastenergy.com.au',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:8001',
    'http://localhost:8002'
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug: method and headers (safe)
  console.log('[send-email] Method:', req.method);
  console.log('[send-email] Origin:', origin);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      company, // honeypot field
      name, 
      email, 
      phone, 
      propertyType, 
      serviceType, 
      propertyAddress, 
      message 
    } = req.body || {};

    // Debug: payload fields
    console.log('[send-email] Payload', { name, email, phone, propertyType, serviceType, propertyAddress, hasMessage: !!message });

    // Honeypot check - silently ignore spam
    if (company) {
      return res.status(200).json({ success: true, message: 'Thank you for your enquiry' });
    }

    // Basic validation
    if (!name || !email || !serviceType) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, and service type are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Create transporter using Hostinger SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'info@blastenergy.com.au',
        pass: process.env.SMTP_PASS
      }
    });

    console.log('[send-email] Using SMTP host:', process.env.SMTP_HOST || 'smtp.hostinger.com');

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({ error: 'Email service configuration error' });
    }

    // 1. Send notification email to info@blastenergy.com.au
    const ownerEmailHtml = `
      <h2>New Enquiry from Blast Energy Website</h2>
      <hr>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Property Type:</strong> ${propertyType || 'Not specified'}</p>
      <p><strong>Service Required:</strong> ${serviceType}</p>
      <p><strong>Property Address:</strong> ${propertyAddress || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <p>${(message || 'No additional message').replace(/\n/g, '<br>')}</p>
      <hr>
      <p><em>Received: ${new Date().toLocaleString('en-AU', { 
        timeZone: 'Australia/Adelaide',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</em></p>
    `;

    const ownerEmailText = `
New Enquiry from Blast Energy Website

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Property Type: ${propertyType || 'Not specified'}
Service Required: ${serviceType}
Property Address: ${propertyAddress || 'Not provided'}

Message:
${message || 'No additional message'}

Received: ${new Date().toLocaleString('en-AU', { 
  timeZone: 'Australia/Adelaide',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
    `;

    const ownerSend = await transporter.sendMail({
      from: `"Blast Energy Website" <${process.env.SMTP_USER || 'info@blastenergy.com.au'}>`,
      to: process.env.OWNER_EMAIL || 'info@blastenergy.com.au',
      subject: `New Enquiry: ${name} - ${serviceType}`,
      replyTo: email,
      text: ownerEmailText,
      html: ownerEmailHtml
    });
    console.log('[send-email] Owner email sent:', ownerSend && ownerSend.messageId);

    // 2. Send confirmation email to the customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5530;">Thank You for Contacting Blast Energy</h2>
        
        <p>Dear ${name},</p>
        
        <p>Thank you for your enquiry regarding <strong>${serviceType}</strong>. We have received your message and will respond to you at our earliest convenience.</p>
        
        <p>Here's a summary of your enquiry:</p>
        <ul>
          <li><strong>Service:</strong> ${serviceType}</li>
          <li><strong>Property Type:</strong> ${propertyType || 'Not specified'}</li>
          ${propertyAddress ? `<li><strong>Address:</strong> ${propertyAddress}</li>` : ''}
        </ul>
        
        <p>Our team typically responds within 24 hours during business days. If you have any urgent questions, please don't hesitate to contact us directly at <a href="mailto:info@blastenergy.com.au">info@blastenergy.com.au</a>.</p>
        
        <p>Best regards,<br>
        <strong>The Blast Energy Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          Blast Energy - Professional Energy Assessment Services<br>
          Email: <a href="mailto:info@blastenergy.com.au">info@blastenergy.com.au</a><br>
          Website: <a href="https://blastenergy.com.au">blastenergy.com.au</a>
        </p>
      </div>
    `;

    const customerEmailText = `
Thank You for Contacting Blast Energy

Dear ${name},

Thank you for your enquiry regarding ${serviceType}. We have received your message and will respond to you at our earliest convenience.

Here's a summary of your enquiry:
- Service: ${serviceType}
- Property Type: ${propertyType || 'Not specified'}
${propertyAddress ? `- Address: ${propertyAddress}` : ''}

Our team typically responds within 24 hours during business days. If you have any urgent questions, please don't hesitate to contact us directly at info@blastenergy.com.au.

Best regards,
The Blast Energy Team

---
Blast Energy - Professional Energy Assessment Services
Email: info@blastenergy.com.au
Website: blastenergy.com.au
    `;

    const customerSend = await transporter.sendMail({
      from: `"Blast Energy" <${process.env.SMTP_USER || 'info@blastenergy.com.au'}>`,
      to: email,
      subject: 'Thank you for your enquiry - Blast Energy',
      replyTo: process.env.SMTP_USER || 'info@blastenergy.com.au',
      text: customerEmailText,
      html: customerEmailHtml
    });
    console.log('[send-email] Customer email sent:', customerSend && customerSend.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Thank you for your enquiry. We will respond to you shortly.' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email. Please try again later or contact us directly.' 
    });
  }
};
