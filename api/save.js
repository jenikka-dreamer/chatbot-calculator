export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = JSON.parse(req.body);
  const { user_id, project, options, price } = body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260601122810_802107'; // Переконайтеся, що цей ID вірний

  try {
    // КРОК 1: Знаходимо справжній ManyChat Subscriber ID за допомогою Telegram ID
    const findUserRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });

    const findUserData = await findUserRes.json();

    if (findUserData.status !== 'success' || !findUserData.data || findUserData.data.length === 0) {
      console.error("ManyChat не знайшов користувача з таким Telegram ID:", user_id);
      return res.status(404).json({ error: "User not found in ManyChat" });
    }

    // Справжній внутрішній ID ManyChat
    const mcSubscriberId = findUserData.data[0].id;
    console.log("Знайдено ManyChat ID:", mcSubscriberId);

    // КРОК 2: Оновлюємо поля за цим справжнім ID
    const updateField = async (fieldName, fieldValue) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MC_TOKEN}`
        },
        body: JSON.stringify({
          user_id: mcSubscriberId,
          field_name: fieldName,
          field_value: fieldValue
        })
      });
    };

    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options.join(', ')),
      updateField('calc_price', price)
    ]);

    // КРОК 3: Запускаємо Flow
    await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MC_TOKEN}`
      },
      body: JSON.stringify({
        user_id: mcSubscriberId,
        flow_ns: FLOW_ID
      })
    });

    return res.status(200).json({ success: true, mc_id: mcSubscriberId });

  } catch (error) {
    console.error("Помилка сервера:", error);
    return res.status(500).json({ error: error.message });
  }
}
