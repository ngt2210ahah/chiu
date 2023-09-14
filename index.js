L.V. Bằng
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');
const axios = require('axios');
const dataFilePath = './data.json';
const token = '';

try {
const bot = new TelegramBot(token, { polling: true });

const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Cách dùng:

    /up <url>: để treo url cần uptime
    /del <url>: xoá url đã treo
    /check: xem list url đã treo

Chi tiết liên hệ author L.V. Bằng!
Facebook: https://www.facebook.com/l.v.bang205
Telegram: @batmanuwu11`
  );
});

bot.onText(/\/up (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1].trim();

  if (!data[chatId]) {
    data[chatId] = { urls: [] };
  }

  data[chatId].urls.push(url);
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  bot.sendMessage(chatId, Đã thêm url ${url} vào server thành công!);
});

bot.onText(/\/del (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1].trim();

  if (data[chatId] && data[chatId].urls.includes(url)) {
    data[chatId].urls = data[chatId].urls.filter((u) => u !== url);
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    bot.sendMessage(chatId, Đã xoá url ${url} khỏi server thành công!);
  } else {
    bot.sendMessage(chatId, Không tìm thấy url ${url} trong danh sách!);
  }
});

bot.onText(/\/check/, (msg) => {
  const chatId = msg.chat.id;
  const urls = data[chatId] ? data[chatId].urls : [];
  bot.sendMessage(chatId, List url bạn đã treo:\n\n${urls.join('\n')});
});

bot.on('text', (msg) => {
    console.log(msg);
})

console.log('Bot started!');

setInterval(async () => {
  for (const chatId in data) {
    if (data.hasOwnProperty(chatId)) {
      const urls = data[chatId].urls;
      for (const url of urls) {
        try {
          const response = await axios.get(url);
          if (response.status === 200) {
            console.log(URL ${url} hoạt động bình thường.);
          } else {
            console.log(URL ${url} gặp vấn đề.);
            await bot.sendMessage(chatId, Url ${url} gặp sự cố: ${response.status});
          }
        } catch (error) {
          console.error(Lỗi khi kiểm tra URL ${url}: ${error.message});
          try {
          await bot.sendMessage(chatId, Lỗi khi kiểm tra url ${url}: ${error.message});
        } catch (err) {
          console.error(Lỗi khi gửi tin nhắn!)
        }
      }
      }
    }
  }
}, 60000);
          
} catch (err) {
  console.log(err);
}
