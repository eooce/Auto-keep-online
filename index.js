const axios = require('axios');
const http = require('http');
const cron = require('node-cron');
const port = process.env.PORT || 7860;     
const moment = require('moment-timezone');

// 添加24小时访问的URL数组
const urls = [
  'https://www.baidu.com',             // 此处可备注名称，例如：glitch
  'https://www.yahoo.com',             // 此处可备注名称，例如：glitch
  'https://www.baidu.com',             // 此处可备注名称，例如：glitch
  'https://www.yahoo.com',             // 此处可备注名称，例如：glitch
  'https://www.baidu.com',             // 此处可备注名称，例如：glitch
  'https://www.yahoo.com',             // 此处可备注名称，例如：glitch
  'https://www.baidu.com',             // 此处可备注名称，例如：glitch
  'https://www.yahoo.com',             // 此处可备注名称，例如：glitch
  // 添加更多24小时不间断访问的URL
];

// 添加在01:00至05:00暂停访问，其他时间正常访问的URL数组
function visitWebsites() {
  const websites = [
    'https://www.google.com',        // 此处可备注名称，例如：Back4app
    'https://www.google.com',        // 此处可备注名称，例如：Back4app
    'https://www.google.com',        // 此处可备注名称，例如：Back4app
    'https://www.google.com'         // 此处可备注名称，例如：Back4app，最后一个url后面没有逗号
    //添加更多的指定时间访问的URL
  ];

 // 遍历网页数组并发送请求
  websites.forEach(async (url) => {
    try {
      const response = await axios.get(url);
      console.log(`${moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')} Visited web successfully: ${url} - Status code: ${response.status}\n`);
    } catch (error) {
      console.error(`Error visiting ${url}: ${error.message}\n`);
    }
  });
}

// 检查并设置定时器
function checkAndSetTimer() {
  const currentMoment = moment().tz('Asia/Hong_Kong');
  const formattedTime = currentMoment.format('YYYY-MM-DD HH:mm:ss');
  if (currentMoment.hours() >= 1 && currentMoment.hours() < 5) {
    console.log(`Stop visit from 1:00 to 5:00 --- ${moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')}`);
    clearInterval(visitIntervalId); // 清除定时器
    const nextVisitTime = moment().tz('Asia/Hong_Kong').add(0, 'day').hours(5).minutes(0).seconds(0);
    const nextVisitInterval = nextVisitTime.diff(currentMoment);
    setTimeout(() => {
      startVisits();
    }, nextVisitInterval);
  } else {
    startVisits();
  }
}

let visitIntervalId; 
function startVisits() {
  clearInterval(visitIntervalId);
// visitWebsites();
  visitIntervalId = setInterval(() => {
    visitWebsites();
  }, 2 * 60 * 1000);   // 每2分钟执行一次访问
}

function runScript() {
  const runScriptIntervalId = setInterval(() => {
    //console.log('Running script');
    checkAndSetTimer();
  }, 2 * 60 * 1000); // 每2分钟检查一次
}
checkAndSetTimer();
runScript();

// 24小时不间断访问
async function scrapeAndLog(url) {
  try {
    const response = await axios.get(url);
    console.log(`${moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')} Web visited Successfully: ${url} - Status code: ${response.status}\n`);
  } catch (error) {
    console.error(`${moment().tz('Asia/Hong_Kong').format('YYYY-MM-DD HH:mm:ss')}: Web visited Error: ${url}: ${error.message}\n`);
  }
}
// 每2分钟访问一次
cron.schedule('*/2 * * * *', () => {
  console.log('Running webpage access...');
  urls.forEach((url) => {
    scrapeAndLog(url);
  });
});

// 创建HTTP服务
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, World!\n');
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found\n');
  }
});

server.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
