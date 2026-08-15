import { CohereClientV2 } from "cohere-ai";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

(async () => {
  const response = await cohere.chat({
    model: "command-a-plus-05-2026",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant of bakery e-commerce online shop.",
      },
      {
        role: "user",
        content: "hello world!",
      },
    ],
  });

  console.log(response);
})();
