export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { goal, dueDate } = req.body;

  if (!goal || !dueDate) {
    return res.status(400).json({ error: 'Missing goal or due date' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a goal planning assistant. Break goals into clear, achievable steps with deadlines.',
          },
          {
            role: 'user',
            content: `My goal is "${goal}" and I want to complete it by ${dueDate}. Create a weekly step-by-step plan.`,
          },
        ],
      }),
    });

    const data = await response.json();

    const plan = data.choices?.[0]?.message?.content;
    if (!plan) throw new Error('No plan generated');

    res.status(200).json({ plan });
  } catch (error) {
    console.error('AI error:', error);
    res.status(500).json({ error: 'Failed to generate plan' });
  }
}
