/**
 * @author windyday
 * @name ping
 * @team 红灯区
 * @version 1.0.3
 * @description 执行 ping dns
 * @rule ^ping ([^ \n]+)$
 * @admin true
 * @public true
 * @priority 1000
 * @disable false
 * @classification ["ping"]
 */

const { exec } = require('child_process');

module.exports = async s => {
    const target = s.param(1);

    if (target) {
        exec(`ping -c 4 ${target}`, (error, stdout, stderr) => {
            if (error) {
                s.reply(`执行 ping 命令时出错: ${stderr}`);
                return;
            }
            s.reply(`PING ${target} 的结果:\n${stdout}`);
        });
    } else {
        s.reply('无效的 ping 命令。请使用格式: ping [target]');
    }
};
