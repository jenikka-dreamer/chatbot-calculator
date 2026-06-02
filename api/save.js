export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = JSON.parse(req.body);
  const { user_id, project, options, price } = body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260602135607_750950'; // ПЕРЕВІРТЕ ЦЕЙ ID

  try {
    const updateField = async (fieldName, fieldValue) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MC_TOKEN}`
        },
        body: JSON.stringify({
          user_id: user_id, // ManyChat спробує знайти вас за Telegram ID
          field_name: fieldName,
          field_value: fieldValue
        })
      });
    };

    // Виконуємо запити
    await updateField('calc_project', project);
    await updateField('calc_options', options.join(', '));
    await updateField('calc_price', price);

    // Запускаємо ланцюжок
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MC_TOKEN}`
      },
      body: JSON.stringify({ user_id: user_id, flow_ns: FLOW_ID })
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
