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
- 旅游签证类型与材料查询（日本、韩国、申根、英国、澳大利亚、新西兰、美国、加拿大）
- GitHub、B 站、抖音及页面访问二维码弹窗
- 模拟终端页面
- 明暗主题与多语言切换
- 响应式页面布局

## 项目结构

```text
hello-web/
├── index.html          # 首页入口
├── home.html           # 个人页面
├── blog.html           # 博客页面
├── projects.html       # 项目与作品
├── blog-videos.js      # 已核实的 B 站视频数据
├── games.html          # 小游戏页面
├── nav.html            # 网站导航
├── dashboard.html      # 状态面板
├── visa.html           # 旅游签证材料查询页
├── terminal.html       # 模拟终端
├── ssh.html            # 模拟 SSH 页面
├── assets/
│   ├── images/          # 页面图片、社交二维码及其原图
│   └── blog/            # 博客文章封面
├── docs/design/         # 设计参考图、对比截图和验收记录
├── tools/               # 素材处理与视频快照更新脚本
├── style.css           # 页面样式
├── site.js             # 公共交互逻辑
├── social-modals.js    # 社交与页面二维码弹窗
├── theme-init.js       # 页面主题初始化
├── site-widgets.js     # 状态面板组件
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
