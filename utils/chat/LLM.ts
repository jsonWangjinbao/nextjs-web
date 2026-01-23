const LLM_ENDPOINT: string = process.env.LLM_ENDPOINT!;
const LLM_MODEL: string = process.env.LLM_MODEL!;
const LLM_TIMEOUT_MS: number = Number(process.env.LLM_TIMEOUT_MS!);

// 做一个优化，封装一个带超时机制的 fetch 方法

/**
 * 带超时机制的 fetch 方法
 * @param {*} url 请求的地址，这里对应的是和大模型进行交互的地址
 * @param {*} options fetch 配置项
 * @param {*} timeout 超时时间
 */
async function fetchWithTimeout(
  url: string,
  options = {},
  timeout: number = Number(LLM_TIMEOUT_MS),
) {
  const controller = new AbortController();

  // 既然都超过 timeout 时间了，那就说明超时
  // 中止请求
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options, // 将原本的 fetch 配置项展开
      signal: controller.signal, // 允许中途取消请求
    });

    clearTimeout(timeoutId);

    return response;
  } catch (err: any) {
    clearTimeout(timeoutId);

    // 超时的错误
    if (err.name === "AbortError") console.error("请求超时，请稍候重试");

    // 其它类型的错误：原样抛出
    console.error(err);
    throw err;
  }
}

/**
 * 调用大模型的接口
 * @param {*} messages
 * @param {*} tools 工具的数组
 * @param {*} callback 流式回调函数
 * @returns
 */
export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  tools = null,
  callback: (chunk: string) => void,
) {
  const requestBody: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    stream: boolean;
    tools?: Array<{ name: string; description: string; parameters: any }>;
  } = {
    model: LLM_MODEL,
    messages,
    stream: true, // 统一使用流式
  };

  if (tools) requestBody.tools = tools;

  const response = await fetchWithTimeout(LLM_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok)
    console.error(
      `模型请求失败☹️：${response.status} : ${response.statusText}`,
    );

  // 代码来到这里，说明采用流式的形式
  const reader = response.body?.getReader(); // 拿到 Reader 对象
  const decoder = new TextDecoder("utf-8"); // 创建一个 utf-8 的解码器

  let fullResponse: string = ""; // 用于存储模型这一次的完整回复
  const toolCalls: Array<{
    index: number;
    id: string;
    type: string;
    function: { name: string; arguments: string };
  }> = []; // 该数组用于存储要调用的工具
  // toolCalls: [{index, id, type: "function", function: {name, arguments}}]

  while (true) {
    const { done, value } = (await reader?.read()) || {
      done: true,
      value: new Uint8Array(),
    }; // 读取当前块的内容
    if (done) break;

    // 对二进制数据进行解码
    const chunk = decoder.decode(value, { stream: true });

    // 后面就是一些 JS 相关的基操了
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      // 针对流式返回的信息，需要根据 deepseek 模型返回的数据的特点，做一些额外的操作
      if (!line.startsWith("data: ")) continue;

      // 移除 "data :" 的前缀
      const jsonStr = line.slice(6);

      // 跳过最后的 [DONE] 标记
      if (jsonStr === "[DONE]") continue;

      try {
        // jsonStr = '{"choices":[{"delta":{"content":"你好，"}}]}'
        // jsonStr = '{"choices":[{"delta":{"tool_calls":[{"index":0,"id":"abc","function":{"name":"getWeather","arguments":"{\\"city\\":\\"北"}}]}}]}'
        const data = JSON.parse(jsonStr);
        // delta = {"delta":{"content":"你好，"}}
        // delta = {"delta":{"tool_calls":[{"index":0,"id":"abc","function":{"name":"getWeather","arguments":"{\\"city\\":\\"北"}}]}}
        const delta = data.choices?.[0]?.delta;

        if (delta) {
          if (delta.content) {
            // 进入此分支，说明模型返回的是文本内容
            fullResponse += delta.content;
            callback?.(delta.content);
          }

          if (delta.tool_calls) {
            // 进入此分支，说明模型返回的是工具调用
            // 这里面核心就是要将需要调用的工具添加到 toolCalls 数组里面
            // 大模型返回的 tool_calls 是一个数组，因为可能涉及到调用多个工具
            for (const toolCall of delta.tool_calls) {
              const existingCall = toolCalls.find(
                (call) => call.index === toolCall.index,
              );

              if (existingCall) {
                // 说明已经存在
                // 这个分支需要合并参数
                if (toolCall.function?.name) {
                  existingCall.function.name = toolCall.function.name;
                }
                if (toolCall.function?.arguments) {
                  existingCall.function.arguments +=
                    toolCall.function.arguments;
                }
              } else {
                // 说明是新的工具调用，存储一个新的
                // 当前的 toolCall = { index: 0, id: 'abc', function: { name: 'getWeather', arguments: '{"city":"北' } }
                // toolCall = { index: 0, id: 'abc', function: { name: 'getWeather', arguments: '{"city":"京' } }
                // 工具名是完整的，但是参数并不完整，因为是流式返回的
                toolCalls.push({
                  index: toolCall.index,
                  id: toolCall.id,
                  type: "function",
                  function: {
                    name: toolCall.function?.name,
                    arguments: toolCall.function?.arguments,
                  },
                });
              }
            }
          }
        }
      } catch (e: any) {
        console.error("JSON解析失败☹️", e.message);
      }
    }
  }

  // 如果需要调用工具，返回一个对象{content, tool_calls}
  // 其中 tool_calls记录了要调用哪些工具
  if (toolCalls.length > 0)
    return { content: fullResponse, tool_calls: toolCalls };

  return fullResponse;
}
