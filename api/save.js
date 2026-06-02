export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { user_id, project, options, price } = JSON.parse(req.body);
    const MC_TOKEN = process.env.MC_TOKEN;

    try {
        const updateField = async (fieldName, fieldValue) => {
            return fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MC_TOKEN}`
                },
                body: JSON.stringify({
                    user_id: user_id, // Тепер тут буде правильний ManyChat ID
                    field_name: fieldName,
                    field_value: fieldValue
                })
            });
        };

        // Оновлюємо поля
        await Promise.all([
            updateField('calc_project', project),
            updateField('calc_options', options.join(', ')),
            updateField('calc_price', price)
        ]);

        // ТУТ ВАШ FLOW ID (той, що content...)
        const flowId = 'content20260601122810_802107'; // ЗАМІНІТЬ НА ВЛАСТИВИЙ!

        await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MC_TOKEN}`
            },
            body: JSON.stringify({ user_id: user_id, flow_ns: flowId })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
