# Auto-keep-online

此脚本是基于node环境，定时访问网页，以保证容器活跃。

# 使用说明 
1：在基于node环境下的容器或vps（需要自己安装node环境）使用。

2：上传index.js和package.json文件至运行环境根目录。

3：替换index.js中第7行和第8行的网址，多个往下继续增加，不限数量。

4：index.js中的第38行为访问周期，默认为2分钟，可自行定义。

# 适用平台
* 包括但不限于Glitch，Rendenr，Back4app，clever cloud，Zeabur，codesanbox，replit。。。等等，不支持物理停机的容器。
* 部署在huggingface上的保活项目https://huggingface.co/spaces/sunxyz/Auto-keep-online，可直接复制我的space，修改index.js中的地址即可。

