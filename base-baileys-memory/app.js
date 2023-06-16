require('dotenv').config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");
const { Configuration, OpenAIApi } = require("openai");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

const generateResponse = async (newQuestion) => {
  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    stop: ["END", ". END", " END", "."],
  });

  const openai = new OpenAIApi(configuration);
  const options = {
    model: process.env.REACT_APP_OPENAI_MODEL,
    prompt: newQuestion,
    temperature: 0.1,
    max_tokens: 100,
  };
  try {
    const response = await openai.createCompletion(options);
    if (response.data.choices) {
      return response.data.choices[0].text;
    }
  } catch (error) {
    console.log(error);
  }
};

const flowPrincipal = addKeyword("").addAction(
    async (ctx, { flowDynamic }) => {
      const data = await generateResponse(ctx.body);
      flowDynamic(data.replace(/^(\.)?(\n)+/, ''));
    }
  );

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
