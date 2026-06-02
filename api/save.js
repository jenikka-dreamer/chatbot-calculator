export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN;
  // Сюди вставте ID вашого Flow з ManyChat (content...)
  const FLOW_ID = 'content20260601122810_802107'; 

  try {
    // 1. Шукаємо підписника за Telegram ID
    const findRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });
    const findData = await findRes.json();

    if (!findData.data || findData.data.length === 0) {
      return res.status(404).json({ error: "ManyChat не знайшов користувача. Напишіть боту 'Привіт'." });
    }

    const mcSubscriberId = findData.data[0].id;

    // 2. Функція для оновлення полів
    const updateField = async (fieldName, fieldValue) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
        body: JSON.stringify({
          user_id: mcSubscriberId,
          field_name: fieldName,
          field_value: fieldValue
        })
      });
    };

    // 3. Оновлюємо поля паралельно
    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options.join(', ')),
      updateField('calc_price', price)
    ]);

    // 4. Запускаємо повідомлення-відповідь у боті
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({
        user_id: mcSubscriberId,
        flow_ns: FLOW_ID
      })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
