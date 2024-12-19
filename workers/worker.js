// 此js为cloudflared workers使用，复制整个代码到新建的workers里，修改需要访问的链接或部署后添加环境变量
// 在设置---触发事件 里设置访问频率，例如2分钟，保存即可，可开启日志查看，检查是否运行

// Telegram配置(不需要可忽略)
const TG_ID = '';           // 替换为你的Telegram用户chat_id
const TG_TOKEN = '';        // 替换为你的Telegram Bot的token

// 24小时不间断访问的URL数组,可添加环境变量，环境变量名格式：URL_1 URL_2 URL_3...
const defaultUrls = [            
  'https://www.google.com',             
  'https://www.google.com',
  'https://www.google.com'  // 可添加多个URL，每个URL之间用英文逗号分隔,最后一个URL后不要加逗号
];

// 指定时间段访问的URL数组,可添加环境变量，环境变量名格式：WEBSITE_1 WEBSITE_2 WEBSITE_3...
const defaultWebsites = [
  'https://www.baidu.com',
  'https://www.baidu.com',
  'https://www.baidu.com'  // 可添加多个URL，每个URL之间用英文逗号分隔,最后一个URL后不要加逗号
  // ... 添加更多URL
];

// 从环境变量获取URL数组
function getUrlsFromEnv(prefix) {
  const envUrls = [];
  let index = 1;
  while (true) {
    const url = globalThis[`${prefix}${index}`];
    if (!url) break;
    envUrls.push(url);
    index++;
  }
  return envUrls;
}

// 读取默认URL和环境变量中的URL
const urls = [...defaultUrls, ...getUrlsFromEnv('URL_')];
const websites = [...defaultWebsites, ...getUrlsFromEnv('WEBSITE_')];

// 检查是否在暂停时间内 (1:00-5:00)
function isInPauseTime(hour) {
  return hour >= 1 && hour < 5;
}

// 发送消息到Telegram
async function sendToTelegram(message) {
  const url = `https://api.telegram.org/bot${TG_TOKEN}/sendMessage`;
  const body = JSON.stringify({
    chat_id: TG_ID,
    text: message,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      console.error(`Telegram推送失败: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Telegram推送出错: ${error.message}`);
  }
}

// 生成随机IP
function getRandomIP() {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// 生成随机版本号
function getRandomVersion() {
  const chromeVersion = Math.floor(Math.random() * (131 - 100 + 1)) + 100;
  return chromeVersion;
}

// 获取随机 User-Agent
function getRandomUserAgent() {
  const agents = [
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomVersion()}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${getRandomVersion()}.0.0.0 Safari/537.36`,
    `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/${getRandomVersion()}.0.0.0`,
    `Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1`
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

async function axiosLikeRequest(url, index, retryCount = 0) {
  try {
    // 随机延迟 1-6 秒
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 5000));
    
    const config = {
      method: 'get',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'X-Forwarded-For': getRandomIP(),
        'X-Real-IP': getRandomIP(),
        'Origin': 'https://glitch.com',
        'Referer': 'https://glitch.com/'
      },
      redirect: 'follow',
      timeout: 30000
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const status = response.status;
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });
    
    if (status !== 200) {
      // 非200状态码发送通知
      await sendToTelegram(`保活日志：${timestamp}\n访问失败: ${url}\n状态码: ${status}`);
    }
    
    return {
      index,
      url,
      status,
      success: status === 200,
      timestamp
    };
    
  } catch (error) {
    if (retryCount < 2) {
      // 如果出错且重试次数小于2，等待后重试
      await new Promise(resolve => setTimeout(resolve, 10000));
      return axiosLikeRequest(url, index, retryCount + 1);
    }
    const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Hong_Kong' });
    // 发送错误通知
    await sendToTelegram(`保活日志：${timestamp}\n访问出错: ${url}\n错误信息: ${error.message}`);
    console.error(`${timestamp} 访问失败: ${url} 状态码: 500`);
    return {
      index,
      url,
      status: 500,
      success: false,
      timestamp
    };
  }
}

async function handleScheduled() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
  const hour = now.getHours();

  // 24小时访问 - 并行执行但保持顺序
  const results = await Promise.all(urls.map((url, index) => axiosLikeRequest(url, index)));
  
  // 按原始顺序排序并打印结果
  results.sort((a, b) => a.index - b.index).forEach(result => {
    if (result.success) {
      console.log(`${result.timestamp} 访问成功: ${result.url}`);
    } else {
      console.error(`${result.timestamp} 访问失败: ${result.url} 状态码: ${result.status}`);
    }
  });

  // 检查是否在暂停时间
  if (!isInPauseTime(hour)) {
    const websiteResults = await Promise.all(websites.map((url, index) => axiosLikeRequest(url, index)));
    
    websiteResults.sort((a, b) => a.index - b.index).forEach(result => {
      if (result.success) {
        console.log(`${result.timestamp} 访问成功: ${result.url}`);
      } else {
        console.error(`${result.timestamp} 访问失败: ${result.url} 状态码: ${result.status}`);
      }
    });
  } else {
    console.log(`当前处于暂停时间 1:00-5:00 --- ${now.toLocaleString()}`);
  }
}

// 处理HTTP请求
async function handleRequest() {
  return new Response("Worker is running!", {
    headers: { 'content-type': 'text/plain' },
  });
}

// 监听请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest());
});

// 监听定时任务
addEventListener('scheduled', event => {
  event.waitUntil(handleScheduled());
});
