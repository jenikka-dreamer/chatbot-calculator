export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Метод не дозволений' });

  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN; // Vercel візьме його з Settings

  try {
    const updateField = async (fn, fv) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
        body: JSON.stringify({ user_id, field_name: fn, field_value: fv })
      });
    };

    // 1. Записуємо дані в поля клієнта
    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options),
      updateField('calc_price', price)
    ]);

    // 2. Запускаємо боту ланцюжок (ВСТАВТЕ ВАШ ID ТУТ)
    const flowId = 'content20260602135607_750950'; 
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id, flow_ns: flowId })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
