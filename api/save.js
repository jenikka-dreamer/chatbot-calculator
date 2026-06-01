export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { subscriber_id, project, options, price } = req.body;

  if (!subscriber_id) {
    return res.status(400).json({ error: 'subscriber_id is required' });
  }

  const MANYCHAT_TOKEN = process.env.MANYCHAT_TOKEN;

  try {
    await fetch(`https://api.manychat.com/fb/subscriber/setCustomFieldByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANYCHAT_TOKEN}`
      },
      body: JSON.stringify({ subscriber_id, field_name: 'calc_project', field_value: project })
    });

    await fetch(`https://api.manychat.com/fb/subscriber/setCustomFieldByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANYCHAT_TOKEN}`
      },
      body: JSON.stringify({ subscriber_id, field_name: 'calc_options', field_value: options })
    });

    await fetch(`https://api.manychat.com/fb/subscriber/setCustomFieldByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MANYCHAT_TOKEN}`
      },
      body: JSON.stringify({ subscriber_id, field_name: 'calc_price', field_value: price })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
