const axios = require('axios');
const fs = require('fs');
const cron = require('node-cron');

// 定义要访问的网页URL数组
const urls = [
  'https://bubble-horse-hippodraco.glitch.me',
  'https://achieved-vivacious-gallimimus.glitch.me',
  // 添加更多的URL
];

// 创建一个日志文件
const logFile = 'web-visit-log.txt';

// 创建一个函数来访问网页并将结果写入日志
async function scrapeAndLog(url) {
  try {
    const response = await axios.get(url);
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: Web visited Successfully ${url}\n`;

    // 将访问结果写入日志文件
    fs.appendFileSync(logFile, logMessage);

    console.log(logMessage);
  } catch (error) {
    const timestamp = new Date().toISOString();
    const errorMessage = `${timestamp}: Web visited Error ${url}: ${error.message}\n`;

    // 将错误信息写入日志文件
    fs.appendFileSync(logFile, errorMessage);

    console.error(errorMessage);
  }
}

// 使用cron来安排定期任务
cron.schedule('*/2 * * * *', () => {
  console.log('Running webpage access...');
  // 循环访问每个URL
  urls.forEach((url) => {
    scrapeAndLog(url);
  });
});
