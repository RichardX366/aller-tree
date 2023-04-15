import { RequestHandler } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { unlink, writeFile } from 'fs/promises';
import { execSync } from 'child_process';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);

export const main: RequestHandler = async (req, res) => {
  const time = Date.now();
  await writeFile(`python/${time}.jpg`, req.body.data, 'base64');
  const trees = execSync(`python3 python/main.py python/${time}.jpg`)
    .toString()
    .trim();
  await unlink(`python/${time}.jpg`);

  if (!trees) return res.send('No trees found');

  let prompt =
    'Relative to normal pollen amounts, rate the following tree, in which low number (1-3) indicates a low pollen count, while a high number (8-10) indicates a high pollen count: ';
  if (trees.includes(',')) {
    prompt =
      'Relative to normal pollen amounts, rate the following trees, in which low number (1-3) indicates a low pollen count, while a high number (8-10) indicates a high pollen count, and then also select which of the following tree have the highest or irregular allergenic level: ';
  }

  const {
    data: { choices },
  } = await openAI.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content: prompt + trees,
        role: 'user',
      },
    ],
  });
  const message = choices[0].message?.content;

  res.send(message);
};
