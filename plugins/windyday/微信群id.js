/**
 * @author windyday
 * @name 微信群id
 * @team 红灯区
 * @version 1.0.0
 * @description 获取微信群id
 * @rule ^wx ([^ \n]+)$
 * @admin true
 * @public true
 * @priority 1000
 * @disable false
 * @classification ["微信id"]
 */
 
module.exports = async s => {
  
    function utf8ToHex(inputString) {
        const buffer = Buffer.from(inputString, 'utf-8');
        
        const hexString = buffer.toString('hex');
        

        return hexString;
    }


    const content = s.param(1);

    const hexString = utf8ToHex(content);
    await s.reply(`微信群id: ${hexString}`);
};


