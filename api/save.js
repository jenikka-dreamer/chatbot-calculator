export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { subscriber_id, project, options, price } = req.body;
    const MC_TOKEN = process.env.MC_TOKEN; // Переконайтеся, що додали це в Environment Variables на Vercel

    try {
        // 1. Функція для оновлення полів
        const updateField = async (fieldName, fieldValue) => {
            return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MC_TOKEN}`
                },
                body: JSON.stringify({
                    user_id: subscriber_id,
                    field_name: fieldName,
                    field_value: fieldValue
                })
            });
        };

        // 2. Оновлюємо всі поля
        await Promise.all([
            updateField('calc_project', project),
            updateField('calc_options', options),
            updateField('calc_price', price)
        ]);

        // 3. ТЕПЕР ГОЛОВНЕ: Просимо ManyChat запустити Flow для клієнта
        // Замініть 'CONTENT20240101...' на ID вашого Flow (ланцюжка) в ManyChat
        await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MC_TOKEN}`
            },
            body: JSON.stringify({
                user_id: subscriber_id,
                flow_ns: 'content20260602135607_750950' // ТУТ МАЄ БУТИ ВАШ ID FLOW
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
