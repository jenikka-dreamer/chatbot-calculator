export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260601122810_802107'; 

  if (!user_id || user_id === "null") {
    return res.status(400).json({ error: "User ID is missing" });
  }

  try {
    // 1. Шукаємо підписника ManyChat за Telegram ID
    const findRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });
    const findData = await findRes.json();

    if (!findData.data || findData.data.length === 0) {
      return res.status(404).json({ error: "ManyChat не знайшов підписника з ID " + user_id });
    }

    const mcId = findData.data[0].id;

    // 2. Оновлюємо поля
    const update = (name, val) => fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id: mcId, field_name: name, field_value: val })
    });

    await Promise.all([
      update('calc_project', project),
      update('calc_options', options),
      update('calc_price', price)
    ]);

    // 3. Запускаємо повідомлення
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id: mcId, flow_ns: FLOW_ID })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
