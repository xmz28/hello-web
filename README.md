# hello-web

一个使用 HTML、CSS 和 JavaScript 编写的个人主页项目。

项目包含个人介绍、博客、小游戏、网站导航和状态面板等页面，并适配桌面端与移动端浏览。

## 功能

- 个性化首页与个人介绍
- 博客内容展示
- 网页小游戏
- 常用网站导航
- 站点状态面板
- 明暗主题与多语言切换
- 响应式页面布局

## 项目结构

```text
hello-web/
├── index.html          # 首页入口
├── home.html           # 个人页面
├── blog.html           # 博客页面
├── games.html          # 小游戏页面
├── nav.html            # 网站导航
├── dashboard.html      # 状态面板
├── style.css           # 页面样式
├── site.js             # 公共交互逻辑
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

## 在线仓库

[GitHub：xmz28/hello-web](https://github.com/xmz28/hello-web)

## 技术栈

- HTML5
- CSS3
- JavaScript
- Remix Icon
- particles.js
