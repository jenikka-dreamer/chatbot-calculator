export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // Отримуємо дані від калькулятора
  const { user_id, project, options, price } = JSON.parse(req.body);
  
  // Беремо токен, який ви додали в налаштування Vercel
  const MC_TOKEN = process.env.MC_TOKEN;

  // ТУТ ВСТАВТЕ ВАШ FLOW ID (content...) з ManyChat
  const FLOW_ID = 'content20260602135607_750950'; 

  const updateField = async (fieldName, fieldValue) => {
    return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MC_TOKEN}`
      },
      body: JSON.stringify({
        user_id: user_id,
        field_name: fieldName,
        field_value: fieldValue
      })
    });
  };

  try {
    // 1. Оновлюємо поля в ManyChat
    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options),
      updateField('calc_price', price)
    ]);

    // 2. Запускаємо ланцюжок повідомлень клієнту
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MC_TOKEN}`
      },
      body: JSON.stringify({
        user_id: user_id,
        flow_ns: FLOW_ID
      })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
