export default async function handler(req, res) {
  // Дозволяємо тільки POST запити
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, project, options, price } = req.body;
  const MC_TOKEN = process.env.MC_TOKEN;
  const FLOW_ID = 'content20260601122810_802107';

  // Лог для перевірки у Vercel Dashboard
  console.log("Отримано запит для ID:", user_id);

  try {
    // 1. Пошук користувача в ManyChat
    const findRes = await fetch(`https://api.manychat.com/fb/user/findBySystemField?system_field=telegram_id&value=${user_id}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${MC_TOKEN}` }
    });
    const userData = await findRes.json();

    if (!userData.data || userData.data.length === 0) {
      console.error("Користувача не знайдено в базі ManyChat");
      return res.status(404).json({ error: "User not found" });
    }

    const mcId = userData.data[0].id;

    // 2. Оновлення полів (calc_project, calc_options, calc_price)
    const updateField = async (name, val) => {
      return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MC_TOKEN}` },
        body: JSON.stringify({ user_id: mcId, field_name: name, field_value: val })
      });
    };

    await Promise.all([
      updateField('calc_project', project),
      updateField('calc_options', options),
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
    console.error("Помилка API:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
