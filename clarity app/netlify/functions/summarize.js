exports.handler = async function (event) {
  try {
    const { answers } = JSON.parse(event.body);

    const prompt = `
You are a clarity guide, not a therapist.

Using the user's answers, produce:

CLARITY SUMMARY
- Decision in one line
- Core tension
- Realistic risk (not imagined)

NEXT ACTION
- One specific action
- Why this action matters now

Constraints:
- No emotional language
- No generic advice
- Under 120 words.

Answers:
${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: data.choices[0].message.content
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: "Error generating clarity"
    };
  }
};
