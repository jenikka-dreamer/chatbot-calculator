export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { user_id, project, options, price } = JSON.parse(req.body);
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260602135607_750950'; // ВАШ FLOW ID

  // Перевіряємо, чи ID не є текстом "{{id}}"
  if (!user_id || user_id.includes('{')) {
    return res.status(400).json({ error: "Invalid User ID" });
  }

  const updateField = async (fieldName, fieldValue) => {
    return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({
        user_id: user_id,
        field_name: fieldName,
        field_value: fieldValue
      })
    });
  };

  try {
    // 1. Оновлюємо поля
    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options.join(', ')),
      updateField('calc_price', price)
    ]);

    // 2. Запускаємо Flow
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id: user_id, flow_ns: FLOW_ID })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
