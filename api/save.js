export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Отримуємо сирі дані з ManyChat
  const { raw_data } = req.body;

  try {
    // Розбиваємо рядок назад на частини (за роздільником |)
    const parts = raw_data.split('|');
    
    const result = {
      project: parts[0] || 'Не вказано',
      options: parts[1] || 'Немає',
      price: parts[2] || '0 грн'
    };

    // Повертаємо об'єкт, який ManyChat збереже в поля
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
