const token = ""; // Токен от BotFather
const myUserId = ; // ID телеграм (можно взять тут: t.me/userinfobot)
let otFolder = "Отчеты" // <- ПЕРЕИМЕНОВАТЬ, ЕСЛИ УЖЕ ЕСТЬ ПАПКА С ОТЧЕТАМИ


function zapusti(){

  Logger.log(DriveApp.getRootFolder());
}

function doGet(e){
var log = "Инициализация скрипта...\n";
const scriptUrl = ScriptApp.getService().getUrl();
log += (`ℹ️ URL адрес скрипта: ${scriptUrl}\nОжидание ответа telegram...\n`);
try{
const tApiWebhook = UrlFetchApp.fetch(`https://api.telegram.org/bot${token}/setWebhook?drop_pending_updates=true&url=${scriptUrl}`);
log += (`❗ Ответ api: ${tApiWebhook}\n`);
const tApiWebhookData = JSON.parse(tApiWebhook);
    if(tApiWebhookData.ok && tApiWebhookData.result){
      log += (`✅ Webhook успешно подключен.`);
    }else{
      log += (`Ошибка подключения webhook. Скопируйте или отправьте скриншот этого сообщения разработчику.`)
    }
} catch (err) {
  log += (`❗ Ошибка: ${err}`);
  if (err == `Exception: Request failed for https://api.telegram.org returned code 401. Truncated server response: {"ok":false,"error_code":401,"description":"Unauthorized"} (use muteHttpExceptions option to examine full response)` || err == `Exception: Не удалось отправить запрос сервису https://api.telegram.org. Код ошибки: 401. Сокращенный ответ сервера: {"ok":false,"error_code":401,"description":"Unauthorized"}. Чтобы ознакомиться с полным ответом, воспользуйтесь опцией muteHttpExceptions.`){
    log += `\n\n❗❗❗ Проверьте правильность введенего токена, который вы получили от BotFather.`
  }
}
return ContentService.createTextOutput(log);
}

function doPost(e) {
  const now = new Date();
  try {
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);
    if (data.message) {
      const chatId = data.message.chat.id;
      const text = data.message.text;
      const user = data.message.from.username || data.message.from.first_name;
      var message = "";
      if(chatId == myUserId){
            const folder = DriveApp.getFolderById(getFolderId());
            const parts = text.split("\n");
          if(parts[0] == ".создать папки"){
            parts.forEach((item, index) => {
              if(index != 0){
              let folderId = folder.createFolder(item).setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW).getId();
              message += `${index}. <a href="https://drive.google.com/drive/u/0/folders/${folderId}">${item}</a>\n`;
              }
            });
            sendMessage(chatId, `✅ <b>Создал папки:</b>\n${message}`);
          }
      }else{
        sendMessage(chatId, `<b>Нет доступа.</b>`);
      }
    }

  } catch (err) {
  }
}

function folderCreate() {
  const now = new Date();
  const fullDate = Utilities.formatDate(now, "GMT+3", "dd.MM.yyyy");
  const parentFolders = DriveApp.getFoldersByName(otFolder);
  let parentFolder;
  if (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  } else {
    parentFolder = DriveApp.createFolder(otFolder);
  }
  const newFolder = parentFolder.createFolder(fullDate);
  newFolder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  return newFolder.getId();
}

function getFolderId() {
  const now = new Date();
  const fullDate = Utilities.formatDate(now, "GMT+3", "dd.MM.yyyy");
  const parentFolders = DriveApp.getFoldersByName(otFolder);
  if (!parentFolders.hasNext()) {
    folderCreate();
    return getFolderId();
  }
  const parentFolder = parentFolders.next();
  const subFolders = parentFolder.getFoldersByName(fullDate);
  if (subFolders.hasNext()) {
    const targetFolder = subFolders.next();
    const id = targetFolder.getId();
    return id;
  } else {
    folderCreate();
    return getFolderId();
  }
}

function uploadImageFromUrl(imageUrl, fileName) {
  try {
    const response = UrlFetchApp.fetch(imageUrl);
    const imageBlob = response.getBlob().setName(fileName);
    const folder = DriveApp.getFolderById(getFolderId());
    const file = folder.createFile(imageBlob);
    return file.getUrl();
  } catch (e) {
  }
}

function sendMessage(chatId, text) {
  const url = "https://api.telegram.org/bot" + token + "/sendMessage";
  const payload = {
    "chat_id": chatId,
    "text": text,
    "parse_mode": "HTML"
  };
  UrlFetchApp.fetch(url, {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  });
}





