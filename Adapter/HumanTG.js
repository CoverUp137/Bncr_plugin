/**
 * This file is part of the Bncr project.
 * @author windyday
 * @name HumanTG
 * @team Bncr团队
 * @version 1.0.6
 * @description HumanTG适配器
 * @adapter true
 * @public true
 * @disable false
 * @priority 100
 * @classification ["官方适配器"]
 * @Copyright ©2024 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * 1.0.6更新说明: 去除HumanTG发消息，只用作监听和执行脚本，不会回复任何消息！仅限自己使用
 */


/* 配置构造器 */
const jsonSchema = BncrCreateSchema.object({
  enable: BncrCreateSchema.boolean().setTitle('是否开启适配器').setDescription(`设置为关则不加载该适配器`).setDefault(false),
  apiId: BncrCreateSchema.number().setTitle('apiID').setDescription(`你的telegarm的apiID`).setDefault(0),
  apiHash: BncrCreateSchema.string().setTitle('apiHash').setDescription(`你的telegarm的apiHash`).setDefault(''),
  startLogOutChat: BncrCreateSchema.string().setTitle('启动日志输出位置').setDescription(`启动日志输出群id或个人id ,不填不推送`).setDefault(''),
  connectionRetries: BncrCreateSchema.number().setTitle('链接超时重试次数').setDescription(`链接超时重试次数`).setDefault(10),
  proxyEnable: BncrCreateSchema.boolean().setTitle('Telegram代理开关').setDescription(`打开socks5代理开关`).setDefault(false),
  proxy: BncrCreateSchema.object({
    host: BncrCreateSchema.string().setTitle('主机地址').setDescription(`域名或ip`).setDefault(''),
    port: BncrCreateSchema.number().setTitle('端口号').setDescription(`代理端口号`),
    socksType: BncrCreateSchema.number().setTitle('版本类型').setDescription(`默认5 代表socks5`).setDefault(5),
    timeout: BncrCreateSchema.number().setTitle('链接超时').setDescription(`链接超时`).setDefault(5),
    username: BncrCreateSchema.string().setTitle('账户').setDescription(`你的代理账户名`).setDefault(''),
    password: BncrCreateSchema.string().setTitle('密码').setDescription(`你的代理密码`).setDefault(''),
  }).setTitle('代理配置'),
});

/* 配置管理器 */
const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = () => {
  return new Promise(async (resolve, reject) => {
    /* 读取用户配置 */
    await ConfigDB.get();
    /* 如果用户未配置,userConfig则为空对象{} */
    if (!Object.keys(ConfigDB.userConfig).length) {
      reject('未配置适配器,退出.');
      return;
    }
    if (!ConfigDB?.userConfig?.enable) {
      reject('未启用HumanTG 退出.');
      //   sysMethod.startOutLogs('未启用HumanTG 退出.');
      return;
    }
    /** 定时器 */
    let timeoutID = setTimeout(() => {
      /* 2分钟限时，超时退出 */
      /* login timeout */
      reject('HumanTG登录超时,放弃加载该适配器');
      return;
    }, 2 * 60 * 1000);
    const sysDB = new BncrDB('system');
    /* 补全依赖 */
    await sysMethod.testModule(['telegram', 'input', 'markdown-it'], { install: true });

    // md解析html
    const md = require('markdown-it')({
      html: true,
      xhtmlOut: false,
      breaks: false,
      langPrefix: 'language-',
      linkify: false,
      typographer: false,
      quotes: '“”‘’',
    });
    // 去除最外层包裹
    md.renderer.rules.paragraph_open = () => '';
    md.renderer.rules.paragraph_close = () => '';

    const HumanTG = new Adapter('HumanTG'),
      { StringSession } = require('telegram/sessions'),
      { Api, TelegramClient } = require('telegram'),
      { NewMessage } = require('telegram/events'),
      input = require('input'),
      HumanTgDb = new BncrDB('HumanTG'),
      session = await HumanTgDb.get('session', ''); //Read Database
    HumanTG.Bridge = {};

    const apiId = ConfigDB.userConfig.apiId;
    const apiHash = ConfigDB.userConfig.apiHash;
    const stringSession = new StringSession(session); // fill this later with the value from session.save()

    const loginOpt = {
      connectionRetries: 100,
      useWSS: false,
      requestRetries: 1 /* 单次重试次数 */,
      timeout: 5 /* 超时5秒 */,
      autoReconnect: true /* 是否自动重连 */,
      floodSleepThreshold: 20,
      deviceModel: 'PC 64bit' /* 设备名 */,
      appVersion: sysMethod.Version /* 版本 */,
    };
    if (ConfigDB.userConfig.proxyEnable) {
      sysMethod.startOutLogs('使用socks5登录HumanTG...');
      loginOpt['proxy'] = ConfigDB.userConfig.proxy;
      loginOpt['proxy']['ip'] = ConfigDB.userConfig.proxy.host;
    } else sysMethod.startOutLogs('直连登录HumanTG...');

    const client = new TelegramClient(stringSession, apiId, apiHash, loginOpt);

    // client.setLogLevel("debug")

    await client.start({
      phoneNumber: async () => await input.text('输入注册TG手机号(带+86): '),
      password: async () => await input.text('输入密码: '),
      phoneCode: async () => await input.text('输入TG收到的验证码: '),
      onError: err => console.log(err),
    });
    try {
      await client.getDialogs().catch(e => e);
    } catch {}

    sysMethod.startOutLogs('HumanTG登录成功...');
    // await sysMethod.sleep(5);
    const newSession = client.session.save();
    if (newSession !== session) await HumanTgDb.set('session', newSession); //保存登录session
    /* 获取登录的账号信息 */
    const loginUserInfo = await client.getMe();
    /* 心跳检测 */
   // sysMethod.cron.newCron(`0 */5 * * * *`, async () => {
    //  try {
     //   await client.getMe();
    //  } catch {}
   // });
    /* 保存管理员信息 ，注释这句*/
    if (!(await HumanTgDb.get('admin'))) {
      HumanTgDb.set('admin', loginUserInfo.id.toString());
    }

    // console.log(loginUserInfo);

    let startLog = `Hello ${loginUserInfo.firstName || loginUserInfo.username}\n`;
	startLog += ``;
    // startLog += `Bncr 启动成功.....\n`;
    // startLog += sysMethod.getTime('yyyy-MM-dd hh:mm:ss') + '\n';
    // startLog += `\`-------------------------\``;
    let pushChat = ConfigDB.userConfig.startLogOutChat || '';
    /* 向指定用户发送信息 */
    pushChat && (await client.sendMessage(pushChat, { message: startLog, parseMode: 'md' }));
    let botid = ConfigDB.userConfig.tgBot?.token?.split(':')[0];

    /* 监听消息 */
    client.addEventHandler(async event => {
      /* 空消息拒收 */
      if (!event.message.text) return;
      const message = event.message;
      const senderInfo = await message.getSender();
      /* bot消息拒收 */
      if (senderInfo?.id?.toString() === botid) return;
      const msgInfo = {
        userId: senderInfo?.id?.toString() || '',
        friendId: message?.peerId?.userId?.toString() || '',
        userName: senderInfo?.username || senderInfo?.firstName || '',
        groupId: event.isPrivate ? '0' : message?.chatId?.toString() || '0',
        groupName: event.isPrivate ? '' : message?.chat?.title || '',
        msg: message.text || '',
        msgId: `${message?.id}` || '',
        replyToMsgId: `${message?.replyTo?.replyToMsgId}` || '0',
      };
      /* 禁用陌生人消息 */
      if (msgInfo.userId !== loginUserInfo.id.toString() && msgInfo.groupId === '0') return
      if (message?.replyTo?.replyToMsgId) {
        let ChatID = +msgInfo.groupId || +msgInfo.friendId || +msgInfo.userId;
        const replyMsg = await HumanTG.Bridge.getReplyMsg(ChatID, +msgInfo.replyToMsgId);
        Array.isArray(replyMsg) && replyMsg[0]?.message && (msgInfo.msg += replyMsg[0]?.message);
      }
      HumanTG.receive(msgInfo);
    }, new NewMessage());
    HumanTG.delMsg = async function (msgidArr) {
      // console.log('this', this);
      // console.log('msgidArr', msgidArr);
      // return;
      if (!Array.isArray(msgidArr) || !msgidArr.length) return;
      let delChatId = +this.msgInfo.groupId || +this.msgInfo.userId;
      if (this.msgInfo.userId !== loginUserInfo.id.toString()) return;
      await client.deleteMessages(
        delChatId,
        msgidArr.map(e => +e),
        { revoke: true }
      );
    };
    HumanTG.push = async function (replyInfo) {
      return this.reply(replyInfo);
    };
    HumanTG.Bridge.editImage = async function (replyInfo) {
      if (Object.prototype.toString.call(replyInfo) === '[object Object]') {
        let sendID = +replyInfo.groupId || +replyInfo.userId;
        if (['image', 'video'].includes(replyInfo.type)) {
          /* 编辑消息 */
          try {
            sendRes = await client.editMessage(sendID, {
              message: +replyInfo.msgId,
              text: replyInfo.msg,
              file: replyInfo.path,
              forceDocument: false,
            });
            return (sendRes && `${sendRes.id}`) || '';
          } catch (e) {
            console.log('编辑失败', e);
            return;
          }
        }
      }
    };
    HumanTG.Bridge.getReplyMsg = async (chatID, replyToMsgId) => {
      if (!chatID || !replyToMsgId) return {};
      try {
        return await client.getMessages(chatID, { ids: replyToMsgId });
      } catch (e) {
        // console.log('getReplyMsg', e);
        return {};
      }
    };
    HumanTG.Bridge.getReplySendInfo = async (chatID, replyToMsgId) => {
      if (!chatID || !replyToMsgId) return {};
      try {
        for await (const message of client.iterMessages(chatID, { ids: replyToMsgId })) {
          // console.log(message.id)
          return await message.getSender();
          // console.log('messagemessage', message.sender);
        }
      } catch (e) {
        return {};
      }
    };
    HumanTG.Bridge.getUserMsgId = async function (chatID, userId, num) {
      if (!chatID || !num || !userId) return [];
      let arr = [],
        lastID = 0;
      try {
        const get = async (offsetId = 0) => {
          for (const message of await client.getMessages(chatID, { limit: 100, offsetId })) {
            message.fromId?.userId?.toString() === userId && arr.push(message.id);
            if (arr.length === num) break;
            lastID = message.id;
          }
          if (arr.length === num || lastID - 1 < 1) return arr;
          return await get(lastID);
        };
        return await get();
      } catch {
        return [];
      }
    };
    HumanTG.Bridge.forwardMessages = async function (chatID, msgId, toChatId) {
      if (!chatID || !msgId || !toChatId) return false;
      try {
        await client.forwardMessages(chatID, { messages: msgId, fromPeer: toChatId });
        return true;
      } catch {
        return false;
      }
    };
    clearTimeout(timeoutID);
    resolve(HumanTG);
  });
};
