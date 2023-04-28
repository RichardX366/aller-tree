import { RequestHandler } from 'express';
import { Configuration, OpenAIApi } from 'openai';
import { unlink, writeFile, rename, rm, readdir } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openAI = new OpenAIApi(configuration);

const treeImages = {
  magnolia:
    'https://cdn.shopify.com/s/files/1/0778/2679/products/SouthernMagnolia1_695x695_1875b317-2e34-4e51-8f7c-1c706d98c56d_695x695.jpg?v=1643389953',
  oak: 'https://static01.nyt.com/images/2021/04/04/realestate/31garden1/oakImage-1617054677967-superJumbo.jpg',
  palm: 'https://nwdistrict.ifas.ufl.edu/hort/files/2021/05/Palm3-scaled.jpg',
  pine: 'https://cdn.shopify.com/s/files/1/0059/8835/2052/products/Austian_Pine_Tree_FGT_600x600_72779fa7-bfb4-420c-8a36-a133a98c45e8_grande.jpg?v=1645737129',
  spruce:
    'https://www.naturehills.com/pub/media/catalog/product/n/o/norway-spruce-treewithouttrunk-1.jpg',
  sycamore:
    'https://cdn.shopify.com/s/files/1/2045/8185/products/3087_grande.jpg?v=1612125504',
};

if (!existsSync('results')) mkdirSync('results');

export const main: RequestHandler = async (req, res) => {
  const time = Date.now();

  readdir('results').then((files) => {
    files.forEach((file) => {
      const fileTime = +file.split('.')[0];
      if (time - fileTime > 1000 * 60 * 60) {
        unlink(`results/${file}`);
      }
    });
  });

  await writeFile(`python/${time}.jpg`, req.body.data, 'base64');
  const trees = execSync(`python3 python/main.py python/${time}.jpg`)
    .toString()
    .trim();
  await unlink(`python/${time}.jpg`);
  try {
    await rename(`runs/detect/predict/${time}.jpg`, `results/${time}.jpg`);
  } catch {}
  await rm('runs', { recursive: true });

  if (!trees) return res.send('no');

  let prompt = `Relative to normal pollen amounts, rate the following tree, in which low number (1-3) indicates a low pollen count, while a high number (8-10) indicates a high pollen count all in json form {"${trees}":N,"highest":"${trees}"}: `;
  if (trees.includes(',')) {
    prompt =
      'Relative to normal pollen amounts, rate the following trees, in which low number (1-3) indicates a low pollen count, while a high number (8-10) indicates a high pollen count, and then also select which of the following tree have the highest or irregular allergenic level all in json form {TREE:N,"highest":TREE}: ';
  }

  const {
    data: { choices },
  } = await openAI.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content:
          'You are an AI that does not care about or talk about what you can or cannot do. Just provide as accurate a result as possible.',
        role: 'system',
      },
      {
        content: prompt + trees,
        role: 'user',
      },
    ],
  });
  const message = choices[0].message?.content.split('}')[0] + '}';
  console.log(message);
  res.json({ message, time });
  // Client should then fetch /results/[time]
};

export const getImage: RequestHandler = async (req, res) => {
  const { time } = req.params;
  res.sendFile(`${process.cwd()}/results/${time}.jpg`);
  await rm(`results/${time}.jpg`);
};

export const getTree: RequestHandler = async (req, res) => {
  const { tree } = req.params;
  const {
    data: { choices },
  } = await openAI.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content:
          'You are an AI that does not care about or talk about what you can or cannot do. Just provide as accurate a result as possible.',
        role: 'system',
      },
      {
        content: `Relative to normal pollen amounts, rate the ${tree} tree, in which low number (1-3) indicates a low pollen count, while a high number (8-10) indicates a high pollen count. Also provide a description of it like what it looks like.`,
        role: 'user',
      },
    ],
  });
  const message = choices[0].message?.content;

  res.json({ message, image: treeImages[tree as keyof typeof treeImages] });
};
