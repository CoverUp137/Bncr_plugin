/**
 * @author windyday
 * @name 域名剩余时间
 * @team 红灯区
 * @version 1.0.1
 * @description 查询域名过期时间，方便续费。安装依赖:npm i whois dayjs  使用命令: 域名剩余时间 xxx.cn
 * @rule ^域名剩余时间 (.+)
 * @admin true
 * @public true
 * @priority 9999
 * @disable false
 * @classification ["查询域名剩余时间"]
 */


const whois = require('whois');
const dayjs = require('dayjs');
/** Code Encryption Block[419fd178b7a37c9eae7b7426c4a042031ab70aa8d16f2bddd083c11d7d23cd43f91d75b570b262629c480bf9697d586f8945d12edf6560d06c7d6119abdc94e860167dc0acc55ca4f13b439639087376a42bc282b7b1dd8b669f33490a327e170b35556a5324401957df15060d1d38c8f2997095c877a9d44e4aec329800728792e1ce1b5ac1212c824a2b78fe255fcc3d46260610847de743fc3948c45e62eebdc30ffd97132e165ad98547ab44faad1ac045f3fba7c05be7a0318594b7a42a0ee27134a77f4b2ffda3f911063ca553bbf5142357507f427ab7d19ff6b8d09c3624ceac823be2df798ff72001c5ff84cca2bb7665f96d241c0eb93005beebfe02a9b67c4c5f5d0fd1063a7a2801e56abf1de97b7df185d6474fead509a8556e09e25883a883887de878fbb887021a40c226ec958d5c449e579df1e06ec0240f4d5473e5e8efed8bd0f60e8612d1d2a8345a08f0ba300e9118f847094238518dc32047456ce56d4afe1d148f9ac51794e0b1420e6d55be6fef8b529d3bbd6f6a9b828e6ff961243722150c55c86790fd0f5db80821ee306caa17fda8a19498ada1847d16683e169790956eb1208002bec0cdcdb542bf5dfe6b621190b5c7affff788ff73f993979a59932139e75c080e953517b740c9e2fc6016f803b0fa45417e086157c30a2f8fff6364bc5f72f7f0ed2f1504def484fc21769bd773b24468bc6c1d2fb27f6a8ae1b63963ed32073c2155e4fab8d6ab0e959710c65a21e6a238d85ff4a4f58a9775b237c5650c23115a6e257845def79f08395f408f4d070049ce085e250bdb4f1b87b7e9fb9b51090d23250715529ec19fc6433b35c325e90bd5049c1783007db272d90c21e41088e412e2783958882387e5420d9323a58151e28897e00fe21817426a499d76c80c3a3e5c251d6486697dd019dd5f5471a49b10d631b939ba971e853cb6eed223b875b83bf3faa4606391c18ccc4167a61e47461747e783a92cb1d2ee2e0e8c07cff5ddd75cacac85715a10682a07215625a5233f215cc199890408caaa68fd9316d105af73b12cec55c67d546f8ff59944e7de1896537d41ceca5c700d532b89eec487cba5822862b74051d4d2188456efa6befde7502035fa22f599cd9ac49f1309730823821c739594c5296d32c18ab1ae2de48ac59a3fec6b8c0ee113f199227c8b8b7fa74dd7cf270a6b80b49f282c439e0aa81ff5e7d0eb33720e7a0d3a7d8c1a3c0241350b7f1f57168645c4f30263130f4a3b5f2c530beab30a222270df694e705fc8c2b8df9bc66b2d326d61c299d85147a662d680907d696d28ee6ecc839ed8e627673403bdc28a66f87709a8a6e6b7a4a566d01d9d79884fa83459fe5183074943a504a580476fedfac7e35745135939813c4846b0c04e7e75b1d897f5097f3735416e073b886f13aa9d9cf85e80a11e06a8a7eef3a24df07b4bd7a3694d1f35ca2da607932e2e77767cf6e1389ea9617d0ca2920db317966bfd59d32eabc2fefacab51f1c93950e9e09779da02b31b576b4f30de329213e98c0408c611dcbf6a88168da855e2423f6b90c6189d67da40cb996eec4f35ae54ba8e7a212329b0201785742af6c2703000316047978ad7d5f41029e8df54709fb073c95ffcddc54d6f174dd4214306b27dee015181c8257d7db654f116e3076ffafcad95ec97fe1be06fd86a64778ac99162e5d1faba78336ae9d9e1324ddcb76087cc6189acae781d9368b6f40fa9c635460a949084841c0790de0910d5c543ed22b92da08996540d4ae44be37020692bf8338d89d6a4a9ff546ce387b8c5e5561314cd967f0f43d547c051a3f0d48fc9d2a4b48ef215b50f0545faf5a53e99a59d72da81eb994bac5a192de19a79080d874b4aa982edd3ec318786b897ee62e861cc7db5e398577243f949a88f0151e28f3e62560f44a5ce4d57454ea4f455c555187d56e9a9d82f04ac3e4c28119eb11e9353ddda122065edfc104b6b43953de4b2fb57157655b2b4ec56a372f0c3027e0acaea189f7231c88f3fcd1018050729cbc0a25d42388d893042c1635fbc069a4727006b6a4f294261607a2fd050469d8b872a52455193cf12b456e2eccde49901b3de2795deef7524fe38c1a6eae56113b01615c601765c08cb8f92d0ce23eb02f7798be97de5840d68b260cf5dd87c2a7ee5f29055a3320bdbeb9d8c6eef5c31f0b872e62f6f2a6a07ffb8c4a610868306704789c745569757868f6e38b23b97aec3c90896239b335607eab5f193ac934840445e40fc7043b8796ee01f6092030e2f89b3d3b40d6af9edad4592a417797e814b5a264abf1e917e083a8931152c1f9e8d957bd80290bde58c37ed6dcf184cefd5719df4bda908fed11c38f62a1ee93bc1ca15f5a77137517717bf529c9ecd654ea3e92ff6192567c0195f6d4d46562ca17a006549ca06f09f5b5a53490b5d15cada9cc0bc9d47f3534bae7fbcdd1457ab37095b740f4a82c9c541904de4b9db1c9c3311867ea3e6a1846358c2cde980f728f26dbf06d988a9b959bed206351116b076b5ee35dd134b1e1856de15630efa04bb2a948415841fb27b39f48a1bc031edda44659937b1c0182b6042ccc17648f173f0e28d0e32127dee15e31722ab397de8dcaf5a9f68c777c654a148e35db327cbe02052fd36cb2fba4fc7d4ee288275d2d9f279b37ef9662456e11f3763d0d5767120d001fa2bec171615439867be33acf4753d31102f7f5ebeeff85e07088a9bfd7e81db97c3293690759e1885d02fd2b95b71ce10c68bdd6524bf696c55554d9facf5e8c5cf1acfe5e18009dc3f8ef299c710a0a29aa7155ef49c7351da4eb4e46661f89b626bf9a3c32364025e446f11b8249b5802440f75b071efcd784afe4c88ae4f106fdf93030b681206ecf388ef4e8a54fae11a94a0565bbb872f63e12f86c88f5e98204a02758812473574cdb60b47945327b79f5584468d75fb5756833f6a977c94b03e94b716a6f73782d308c1c6f9a9ef002b9b65ce2c19ba11d2200f0b817ba3d0ea31d72e2627b70faf57c7d6abf1abf5c04a32c8d48283787bccb71448165713bbe83da7d3cd779999ccd9b7b2bc95f7320eb9869166e7c12e2339a97cacd5c2e41e58bbe34b5ca9f415fc717e733a3ca71300045ed808c6d3e3edcaa76a393aa5db930742331de47d5058d64f34daa3a103f2b9b832463b46dbe99a9b4301536c98afe1d57939effa3437f3d07924a7b05b54fbb7e25ed87b29174a38588bd87191f67d3bc47dff8299b2186a5a196930fab7ec4245f1b8c2023272c86751731d64e0d5ef403c4070eb75cfa630b5a9a8acfc52ea1bfd4a132bce98e0284beb8bf41775d6ce0bf8e84099b89cc16ac8f9824ad57] */
