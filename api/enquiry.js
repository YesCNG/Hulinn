export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { name, email, message, _gotcha } = body;

    // Bot honeypot check (hidden field filled out by bots)
    if (_gotcha) {
      return res.status(200).json({
        success: true,
        message: 'Your introduction request has been discreetly received.'
      });
    }

    // Input validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = (message || '').trim();
    const timestamp = new Date().toISOString();

    console.log(`[Hulinn Submission] Received enquiry from ${trimmedName} (${trimmedEmail}) at ${timestamp}`);

    const deliveries = [];

    // 1. Resend Email Delivery
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      const emailPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'Hulinn Concierge <onboarding@resend.dev>',
          to: process.env.NOTIFICATION_EMAIL,
          reply_to: trimmedEmail,
          subject: `New Hulinn Private Access Request: ${trimmedName}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #172629; background: #e9e4db; border: 1px solid #c6a77b;">
              <p style="font-size: 11px; letter-spacing: 0.3em; color: #8d6b42; text-transform: uppercase; margin: 0 0 10px;">Hulinn Private Access</p>
              <h2 style="font-size: 28px; margin: 0 0 24px; font-weight: normal; color: #172629;">New Membership Enquiry</h2>
              <div style="background: #ffffff; padding: 20px; border-left: 2px solid #c6a77b; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; font-size: 14px;"><strong>Applicant:</strong> ${trimmedName}</p>
                <p style="margin: 0 0 12px; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${trimmedEmail}" style="color: #8d6b42;">${trimmedEmail}</a></p>
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Brief Introduction:</strong></p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #424948; white-space: pre-wrap;">${trimmedMessage || '<em>No notes provided.</em>'}</p>
              </div>
              <p style="font-size: 11px; color: #858c89; margin: 0;">Discreetly recorded on ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC</p>
            </div>
          `
        })
      }).then(r => r.json()).catch(err => console.error('Resend delivery error:', err));
      deliveries.push(emailPromise);
    }

    // 2. Discord Webhook Notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      const discordPromise = fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: '✨ Hulinn — Private Access Enquiry',
            color: 0xc6a77b,
            fields: [
              { name: 'Name', value: trimmedName, inline: true },
              { name: 'Email', value: trimmedEmail, inline: true },
              { name: 'Introduction', value: trimmedMessage || '*(None)*' }
            ],
            footer: { text: 'Hulinn Concierge' },
            timestamp
          }]
        })
      }).catch(err => console.error('Discord webhook error:', err));
      deliveries.push(discordPromise);
    }

    // 3. Slack Webhook Notification
    if (process.env.SLACK_WEBHOOK_URL) {
      const slackPromise = fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `*New Hulinn Enquiry*\n*Name:* ${trimmedName}\n*Email:* ${trimmedEmail}\n*Message:* ${trimmedMessage || 'N/A'}`
        })
      }).catch(err => console.error('Slack webhook error:', err));
      deliveries.push(slackPromise);
    }

    await Promise.all(deliveries);

    return res.status(200).json({
      success: true,
      message: 'Your introduction request has been discreetly received. Our liaison will be in touch.'
    });
  } catch (error) {
    console.error('Server error handling enquiry:', error);
    return res.status(500).json({
      error: 'An unexpected transmission error occurred. Please try again shortly.'
    });
  }
}
