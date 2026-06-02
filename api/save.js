export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260601122810_802107'; 

  try {
    // 1. Пошук підписника за Telegram ID
    const findRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });
    const findData = await findRes.json();

    // Якщо ManyChat не знайшов такого користувача
    if (!findData.data || findData.data.length === 0) {
      return res.status(404).json({ error: "ManyChat не бачить ваш профіль. Напишіть боту 'Привіт'." });
    }

    const mcId = findData.data[0].id;

    // 2. Оновлення полів (перетворюємо список опцій у текст через кому)
    const updateField = async (name, val) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
        body: JSON.stringify({ user_id: mcId, field_name: name, field_value: val })
      });
    };

    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options.join(', ') || 'немає'),
      updateField('calc_price', price)
    ]);

    // 3. Запуск Flow
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id: mcId, flow_ns: FLOW_ID })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Помилка сервера: " + err.message });
  }
}
