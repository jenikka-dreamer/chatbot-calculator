export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { user_id, project, options, price } = JSON.parse(req.body);
    const MC_TOKEN = process.env.MC_TOKEN;

    if (!MC_TOKEN) {
        console.error("ПОМИЛКА: Токен MC_TOKEN не знайдено в Environment Variables!");
        return res.status(500).json({ error: "No API Token" });
    }

    try {
        const updateField = async (fieldName, fieldValue) => {
            const response = await fetch('https://api.manychat.com/fb/user/setCustomFieldByName', {
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
            return response.json();
        };

        // Виконуємо оновлення
        const results = await Promise.all([
            updateField('calc_project', project),
            updateField('calc_options', options.join(', ')),
            updateField('calc_price', price)
        ]);

        console.log("Результати оновлення полів:", results);

        // Тригер Flow
        const triggerResponse = await fetch('https://api.manychat.com/fb/sending/triggerFlow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MC_TOKEN}`
            },
            body: JSON.stringify({
                user_id: user_id,
                flow_ns: 'content20260601122810_802107' // ПЕРЕВІРТЕ ЦЕЙ ID ЩЕ РАЗ
            })
        });

        const triggerData = await triggerResponse.json();
        console.log("Результат тригера Flow:", triggerData);

        return res.status(200).json({ success: true, triggerData });
    } catch (error) {
        console.error("Критична помилка:", error);
        return res.status(500).json({ error: error.message });
    }
}
