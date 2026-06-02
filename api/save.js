export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  // В Vercel req.body вже є об'єктом, якщо Content-Type: application/json
  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260601122810_802107'; 

  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    // 1. Знаходимо ManyChat Subscriber ID за Telegram ID
    const findUserRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });
    const findUserData = await findUserRes.json();

    let mcSubscriberId = user_id; 
    if (findUserData.status === 'success' && findUserData.data && findUserData.data.length > 0) {
      mcSubscriberId = findUserData.data[0].id;
    }

    // 2. Функція оновлення полів
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

    // 3. Записуємо дані в Custom Fields
    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options),
      updateField('calc_price', price)
    ]);

    // 4. Запускаємо Flow
    const triggerRes = await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
      body: JSON.stringify({ user_id: mcSubscriberId, flow_ns: FLOW_ID })
    });

    const triggerData = await triggerRes.json();

    return res.status(200).json({ success: true, mc_id: mcSubscriberId, trigger: triggerData });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
