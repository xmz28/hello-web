# hello-web

一个使用 HTML、CSS 和 JavaScript 编写的个人主页项目。

项目包含个人介绍、作品展示、博客、小游戏、网站导航、状态面板和旅游签证材料查询页，适配桌面端与移动端浏览。

## 功能

- 个性化首页与个人介绍
- 独立作品页，介绍 GitHub 公开项目及源码或下载内容
- 博客内容展示、筛选与加载更多
- B 站视频快照展示
- 网页小游戏
- 常用网站导航
- 站点状态面板
- 状态面板网络检查：网站响应时间、出口 IP、IPv4 / IPv6 与城市天气
- 国际测速与 Windows 本地路由追踪（路由追踪需运行本地助手）
- 旅游签证类型与材料查询（日本、韩国、申根、英国、澳大利亚、新西兰、美国、加拿大）
- GitHub、B 站、抖音及页面访问二维码弹窗
- 模拟终端页面
- 明暗主题与多语言切换
- 响应式页面布局

主要页面支持简体中文、繁体中文、英语和日语，语言与主题设置会在刷新及同一浏览器的其他标签页中同步。首页、个人页、博客、作品、导航、状态面板和小游戏分别调整了日间与夜间样式；小游戏切换主题时会保留当前进度。

## 项目结构

```text
hello-web/
├── index.html          # 首页入口
├── home.html           # 个人页面
├── blog.html           # 博客页面
├── projects.html       # 项目与作品
├── blog-videos.js      # 已核实的 B 站视频数据
├── games.html          # 小游戏页面
├── games.js            # 小游戏交互逻辑
├── nav.html            # 网站导航
├── dashboard.html      # 状态面板
├── visa.html           # 旅游签证材料查询页
├── terminal.html       # 模拟终端
├── ssh.html            # 模拟 SSH 页面
├── assets/
│   ├── images/          # 页面图片、社交二维码及其原图
│   ├── blog/            # 博客文章封面
│   └── vendor/          # Leaflet 地图资源及许可证
├── docs/design/         # 设计参考图、对比截图和验收记录
├── downloads/           # Windows 路由助手分片及校验信息
├── tools/               # 素材处理与视频快照更新脚本
├── network-helper.py   # 本地路由追踪助手源码
├── network-tools.js    # 测速、路由追踪与地图交互
├── start-network-dashboard.cmd  # Windows 本地启动入口
├── style.css           # 页面样式
├── interface-copy.js   # 多语言界面文案
├── site.js             # 公共交互逻辑
├── social-modals.js    # 社交与页面二维码弹窗
├── theme-init.js       # 页面主题初始化
├── site-widgets.js     # 状态面板组件
├── network-checks.js   # 多站点 HTTP 延迟与多来源出口 IP 查询
└── updates.json        # 更新记录
```

## 本地运行

本项目不需要安装依赖，下载或克隆仓库后直接打开 `index.html` 即可。

也可以使用本地静态服务器运行：

```bash
python -m http.server 8080
```

然后访问：

```text
http://localhost:8080
```

状态面板在访客浏览器中检测 8 个网站的 HTTP 响应时间（每站最多 12 次），并展示 IPIP、IPinfo、ipwho.is 和 Cloudflare 看到的出口 IP，以及 IPv4 / IPv6 和基于 IPIP 城市的天气。结果可能受到 VPN 分流、跨域限制及第三方服务可用性的影响；HTTP 响应时间不等同于 ICMP Ping，IP 归属地也不是访客的实际位置。

## 国际测速与路由追踪

国际测速可在静态托管页面直接使用，提供 LibreSpeed 公共节点：日本东京 A573、美国洛杉矶 Clouvider。手动启动延迟、下载、上传测试；每个吞吐阶段最多 8 秒、3 个并发请求，下载上限 64 MiB，上传上限 16 MiB。下载按实际收到的字节计量，上传最终速度按得到成功响应的有效载荷计量；不计协议开销。公共节点可能受限或暂时不可达，可切换节点。节点来源：[LibreSpeed 公共服务器列表](https://librespeed.org/backend-servers/servers.php)。测速期间暂停未完成的网站延迟检测。

**普通访客不需要安装 Python。** 在网页的“首次使用”入口点击下载，网页会自动合并并校验 `downloads/` 中的分片，保存为 `NetworkRouteHelper-Windows-x64.exe`。双击运行即可打开本地追踪面板（Windows 10 / 11，64 位）。免安装版本自带运行环境、面板资源和 Leaflet；不需要终端命令、管理员权限或浏览器扩展。首次下载后仍需要访客自己运行程序，网页不能自动执行下载的软件。面板中的“退出本地助手”会停止服务与未完成的追踪。

普通网页没有本机 ICMP traceroute 接口。Chrome 扩展也需注册并调用本机 Native Messaging 程序；仅安装扩展并不能消除本机程序的需要。因此目前采用下载后直接运行的单文件助手，保留网页操作、自动结果与地图展示。静态线上页面提供下载，执行探测时自动打开助手提供的本地面板；线上页面不会直接连任意本地端口。

发布网站时一并部署 `downloads/` 目录。构建脚本在本机生成完整 EXE，并生成便于仓库托管的分片；网页下载时自动还原为同一个文件。当前可执行文件由本项目源码打包，尚未做商业代码签名；下载体积与 SHA256 记录在 `downloads/network-helper-release.json` 和 `.sha256` 文件中。后续正式发行可增加代码签名与独立版本更新。

开发者可继续使用 Python 3.10+ 的源码模式（无需额外 Python 包）：双击 `start-network-dashboard.cmd`，或运行：

```powershell
python network-helper.py
```

打开 [本地状态面板](http://127.0.0.1:8765/dashboard.html)，选择 8 个网站预设，或输入域名、HTTP/HTTPS 网站地址、IPv4 / IPv6，点击开始追踪。助手调用 Windows `tracert.exe`，自动逐跳传回 IP 和三次响应时间；公网跳点通过 IPinfo / ipwho.is 查询城市、ASN / 运营商与估算坐标，自动进入表格和 Leaflet 地图，无需手工导入。查询结果最多缓存 24 小时。`*`、私网与未知位置保留在表格，不编造地图坐标。

静态托管页无法直接发出 ICMP，也不会把服务器自身的路线冒充访客路线，因此在未连接助手时显示启动说明。助手只接受本地同源会话，不开放远程 CORS。每次最多 30 跳，约 100 秒，可随时停止。ICMP 路线可能不经过仅代理网页流量的 VPN。地图虚线连接的是 IP 数据库估算位置，不是物理线路；Anycast、数据库误差可能使城市与真实响应机房不同。Leaflet 1.9.4 随项目附带并保留许可证，底图使用 OpenStreetMap 并显示署名。

停止后台助手：

```powershell
python network-helper.py --stop
```

验证助手输入与解析：`python test-network-helper.py`。

重建访客下载（在 Windows 64 位 Python 环境安装 PyInstaller 后运行）：

```powershell
python tools/build-network-helper.py
```

助手 1.1.0 起，EXE 放在本项目根目录或 `downloads/` 时会直接读取项目中的最新页面，编辑 HTML/CSS/JS 后刷新本地面板即可同步，不需要为本机预览重新打包。状态行会标明“最新项目页面”或“程序内置页面快照”；助手通过禁用本地缓存及按文件修改时间标记资源避免旧 CSS/JS 残留。启动新版助手时会替换旧版本地服务。

普通访客单独下载 EXE 后仍使用内置快照，线上页面与内置页面不会自动同步。发布修改时需运行上述构建命令，并同时上传新的网页和 `downloads/`，访客重新下载并运行新版助手。当前没有配置线上页面自动更新源。

## 更新 B 站视频

博客使用 `blog-videos.js` 中的静态快照。当前 30 条来自已登录投稿页的“最新发布”列表，并逐条通过 B 站视频详情接口核实归属。公开投稿列表接口会限流，因此网页打开时无法可靠地直接同步最近 30 条。

在 PowerShell 中运行以下命令，可尝试重新获取最近 30 条并更新快照：

```powershell
.\tools\update-bilibili-videos.ps1
```

若接口返回限流或不足 30 条，脚本会报错并保留原有快照。也可以用 `-Bvid` 参数加入已知视频，例如：

```powershell
.\tools\update-bilibili-videos.ps1 -Bvid @('BV1qAaN6tErG', 'BV1St8J6SEhE')
```

`-Bvid` 会用所提供的视频重建快照，并验证投稿者是否为本站的 B 站账号。

## 在线仓库

[GitHub：xmz28/hello-web](https://github.com/xmz28/hello-web)

## 技术栈

- HTML5
- CSS3
- JavaScript
- Remix Icon
- particles.js
