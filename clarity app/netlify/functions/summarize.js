const https = require("https");

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

    const data = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Length": data.length
      }
    };

    const responseBody = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      });
      req.on("error", reject);
      req.write(data);
      req.end();
    });

    const result = JSON.parse(responseBody);

    return {
      statusCode: 200,
      body: result.choices[0].message.content
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: "Error generating clarity"
    };
  }
};
