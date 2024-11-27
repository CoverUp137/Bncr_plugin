/**
 * @author windyday
 * @name qq
 * @team Bncr团队
 * @version 1.1.1
 * @description 外置qq机器人适配器，同意好友，同意加群，入群欢迎词，适配伪装消息，群消息关键词撤回
 * @adapter true
 * @public true
 * @disable false
 * @priority 10000
 * @classification ["官方适配器"]
 * @Copyright ©2023 Aming and Anmours. All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 */

const jsonSchema = BncrCreateSchema.object({
  enable: BncrCreateSchema.boolean()
    .setTitle('是否开启适配器')
    .setDescription('设置为关则不加载该适配器')
    .setDefault(false),
  mode: BncrCreateSchema.string()
    .setTitle('适配器模式')
    .setDescription('下面框框填入: <span style="color: blue;">ws</span><br>ntqq/napcat接收地址为: <span style="color: red;">ws://bncrip:9090/api/bot/qqws</span>')
    .setDefault('ws'),
  autoApproveFriendRequest: BncrCreateSchema.boolean()
    .setTitle('是否自动同意好友请求')
    .setDescription('设置为开则自动同意所有的好友请求')
    .setDefault(false),
  autoApproveGroupRequest: BncrCreateSchema.boolean()
    .setTitle('是否自动同意加群请求/邀请')
    .setDescription('设置为开则自动同意所有的加群请求和邀请<br><span style="color: red;">需要把机器人设置为管理员</span>')
    .setDefault(false),
  enableWelcomeMessage: BncrCreateSchema.boolean()
    .setTitle('是否启用入群欢迎消息')
    .setDescription('')
    .setDefault(false),
  welcomeMessage: BncrCreateSchema.string()
    .setTitle('')
    .setDescription('自定义入群后的欢迎消息，\\n为换行<br><span style="color: red;">需要把机器人设置为管理员</span>')
    .setDefault(''),
  enableRecallMessage: BncrCreateSchema.boolean()
    .setTitle('是否启用群撤回消息功能')
    .setDescription('')
    .setDefault(false),
  recallKeywords: BncrCreateSchema.string()
  .setTitle('自定义撤回消息关键词')
  .setDescription('Q群收到包含该关键词的消息时，执行撤回操作<br><span style="color: red;">多个关键词请用“|”分隔</span>')
  .setDefault('')
});

const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = async () => {
  await ConfigDB.get();
  if (!Object.keys(ConfigDB.userConfig).length) {
    sysMethod.startOutLogs('未配置qq适配器,退出.');
    return;
  }
  if (!ConfigDB?.userConfig?.enable) return sysMethod.startOutLogs('未启用外置qq 退出.');
  let qq = new Adapter('qq');

  qq.inlinemask = async function (msgInfo) {
    return qq.receive(msgInfo);
  };

  await ws(qq);
  return qq;
};

async function ws(qq) {
  const events = require('events');
  const eventS = new events.EventEmitter();
  const { randomUUID } = require('crypto');
  const listArr = [];

  router.ws('/api/bot/qqws', ws => {
    ws.on('message', async msg => {
      let body;
      try {
        body = JSON.parse(msg);
      } catch (error) {
        console.error('Invalid JSON message received:', msg);
        return;
      }

      // 拒绝心跳链接消息
      if (body.post_type === 'meta_event') return;

      if (body.post_type === 'request' && body.request_type === 'friend') {
        if (ConfigDB.userConfig.autoApproveFriendRequest) {
          const approve = true; 
          const requestBody = {
            action: 'set_friend_add_request',
            params: {
              flag: body.flag,
              approve: approve
            }
          };
          ws.send(JSON.stringify(requestBody));
          sysMethod.startOutLogs('已自动同意加好友请求');
        }
        return;
      }

      if (body.post_type === 'request' && body.request_type === 'group') {
        if (ConfigDB.userConfig.autoApproveGroupRequest) {
          const approve = true; 
          const requestBody = {
            action: 'set_group_add_request',
            params: {
              flag: body.flag,
              sub_type: body.sub_type, 
              approve: approve
            }
          };
          ws.send(JSON.stringify(requestBody));
          sysMethod.startOutLogs(`已自动同意${body.sub_type === 'add' ? '加群请求' : '加群邀请'}`);

          const { enableWelcomeMessage, welcomeMessage } = ConfigDB.userConfig;
          if (enableWelcomeMessage && welcomeMessage) {
            const formattedWelcomeMessage = welcomeMessage.replace(/\\n/g, '\n');
            const atMessage = {
              type: 'at',
              data: {
                qq: body.user_id 
              }
            };

            const sendGroupMsgBody = {
              action: 'send_group_msg',
              params: {
                group_id: body.group_id,
                message: [
                  atMessage,
                  { type: 'text', data: { text: ` ${formattedWelcomeMessage}` } }
                ]
              }
            };

            ws.send(JSON.stringify(sendGroupMsgBody));
          }
        }
        return;
      }

      if (body.echo) {
        for (const e of listArr) {
          if (body.echo !== e.uuid) continue;
          if (body.status && body.status === 'ok')
            return e.eventS.emit(e.uuid, body.data.message_id.toString());
          else return e.eventS.emit(e.uuid, '');
        }
      }

      // 不是消息退出
      if (!body.post_type || body.post_type !== 'message') return;
      let msgInfo = {
        userId: body.sender.user_id + '' || '',
        userName: body.sender.nickname || '',
        groupId: body.group_id ? body.group_id + '' : '0',
        groupName: body.group_name || '',
        msg: body.raw_message || '',
        msgId: body.message_id + '' || '',
      };

     if (msgInfo.groupId && msgInfo.groupId !== '0' && ConfigDB.userConfig.enableRecallMessage) {
  const recallKeywords = ConfigDB.userConfig.recallKeywords.split('|').filter(Boolean); 
  
  if (recallKeywords.length > 0 && recallKeywords.some(keyword => msgInfo.msg.includes(keyword))) {
    await qq.delMsg([msgInfo.msgId]);
    sysMethod.startOutLogs(`撤回消息：来自发送者QQ：${msgInfo.userId}，包含关键词的消息：${msgInfo.msg}`);
  } else if (recallKeywords.length === 0) {
    sysMethod.startOutLogs('撤回关键词为空，跳过撤回操作。');
  }
}
      qq.receive(msgInfo);
    });

    // 发送消息方法
    qq.reply = async function (replyInfo) {
      try {
        let uuid = randomUUID();
        let body = {
          action: 'send_msg',
          params: {},
          echo: uuid,
        };
        +replyInfo.groupId
          ? (body.params.group_id = replyInfo.groupId)
          : (body.params.user_id = replyInfo.userId);
        if (replyInfo.type === 'text') {
          body.params.message = replyInfo.msg.replace(/&amp;/g, '&');
        } else if (replyInfo.type === 'image') {
          body.params.message = `[CQ:image,file=${replyInfo.path}]`;
        } else if (replyInfo.type === 'video') {
          body.params.message = `[CQ:video,file=${replyInfo.path}]`;
        }
        ws.send(JSON.stringify(body));
        return new Promise((resolve, reject) => {
          listArr.push({ uuid, eventS });
          let timeoutID = setTimeout(() => {
            delListens(uuid);
            eventS.emit(uuid, '');
          }, 60 * 1000);
          eventS.once(uuid, res => {
            try {
              delListens(uuid);
              clearTimeout(timeoutID);
              resolve(res || '');
            } catch (e) {
              console.error(e);
            }
          });
        });
      } catch (e) {
        console.error('qq:发送消息失败', e);
      }
    };

    // 推送消息
    qq.push = async function (replyInfo) {
      return await this.reply(replyInfo);
    };

    // 注入删除消息方法
    qq.delMsg = async function (argsArr) {
      try {
        argsArr.forEach(e => {
          if (typeof e !== 'string' && typeof e !== 'number') return false;
          ws.send(
            JSON.stringify({
              action: 'delete_msg',
              params: { message_id: e },
            })
          );
        });
        return true;
      } catch (e) {
        console.log('qq撤回消息异常', e);
        return false;
      }
    };
  });

  // 向/api/系统路由中添加路由
  router.get('/api/bot/qqws', (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的get请求测试正常~，请用ws交互数据' })
  );
  router.post('/api/bot/qqws', async (req, res) =>
    res.send({ msg: '这是Bncr 外置qq Api接口，你的post请求测试正常~，请用ws交互数据' })
  );

function delListens(id) {
  listArr.forEach((e, i) => e.uuid === id && listArr.splice(i, 1));
}

}
