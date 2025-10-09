# Shiba Chinese 项目服务器使用说明

## 📋 服务器基本信息

### 实例配置

| 项目         | 详情                                   |
| ------------ | -------------------------------------- |
| **实例 ID**  | `d2a89faf04d6407aa53c9fb831ad8558`     |
| **实例名称** | AlibabaCloudLinux-ndox                 |
| **云服务商** | 阿里云 ECS                             |
| **地域**     | 华东 2（上海）                         |
| **规格**     | 通用型：2 核 2GB 内存 + 40GB ESSD 云盘 |
| **操作系统** | Alibaba Cloud Linux 3.21.04            |
| **运行状态** | 运行中                                 |

### 网络信息

| 类型         | IP 地址                             |
| ------------ | ----------------------------------- |
| **公网 IP**  | `139.196.49.164`                    |
| **私有 IP**  | `172.24.38.174`                     |
| **开放端口** | 22 (SSH), 80 (HTTP), 3000 (Next.js) |

### 访问凭证

| 项目          | 信息                                       |
| ------------- | ------------------------------------------ |
| **SSH 端口**  | 22                                         |
| **登录用户**  | root                                       |
| **密码**      | `qazxsw123Z` ⚠️ **建议首次登录后立即修改** |
| **SSH 密钥**  | shiba (`~/.ssh/id_ed25519`)                |
| **密钥对 ID** | d2a89faf04d6407aa53c9fb831ad8558           |

---

## 🔐 SSH 连接方式

### 方式一：使用 SSH 密钥（推荐）

如果已配置密钥：

```bash
ssh root@139.196.49.164
```

### 方式二：使用密码

```bash
ssh root@139.196.49.164
# 输入密码：qazxsw123Z
```

### 配置新的 SSH 密钥

```bash
# 本地生成密钥对（如果没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id root@139.196.49.164
```

### 修改 root 密码（首次登录后必做）

```bash
passwd
# 输入新密码两次
```

---

## 🏗️ 项目部署架构

### 技术栈

- **Node.js**: v20.19.5（通过 nvm 管理）
- **包管理器**: npm v10.8.2
- **框架**: Next.js 15.5.4
- **进程管理**: PM2
- **反向代理**: Nginx 1.20.1
- **Swap**: 2GB（位于 `/swapfile`）

### 目录结构

```
/srv/Shiba-chinese/          # 项目根目录
├── .next/                    # Next.js 构建产物
├── node_modules/             # 依赖包
├── app/                      # 应用代码
├── components/               # 组件
├── lib/                      # 工具函数
├── public/                   # 静态资源
├── package.json              # 项目配置
└── next.config.ts            # Next.js 配置

/etc/nginx/
├── nginx.conf                # Nginx 主配置
└── conf.d/
    └── shibapark.conf        # 站点配置

/root/.pm2/                   # PM2 配置和日志
├── logs/                     # 日志目录
│   ├── shiba-out.log         # 标准输出日志
│   └── shiba-error.log       # 错误日志
└── dump.pm2                  # PM2 进程列表

/root/.nvm/                   # Node.js 版本管理
└── versions/node/v20.19.5/   # Node.js 安装目录
```

### 服务端口

| 服务    | 端口 | 说明             |
| ------- | ---- | ---------------- |
| Nginx   | 80   | HTTP 入口        |
| Next.js | 3000 | 应用服务（内部） |

### 访问地址

- **IP 访问**: http://139.196.49.164
- **域名访问**: http://shibapark.store（DNS 解析完成后）

---

## 🚀 常用管理命令

### PM2 进程管理

```bash
# 查看服务状态
pm2 status

# 查看实时日志
pm2 logs shiba

# 查看最近日志（不跟踪）
pm2 logs shiba --lines 50 --nostream

# 重启服务
pm2 restart shiba

# 停止服务
pm2 stop shiba

# 启动服务
pm2 start shiba

# 保存 PM2 进程列表
pm2 save

# 查看详细信息
pm2 show shiba

# 监控资源占用
pm2 monit
```

### Nginx 管理

```bash
# 查看 Nginx 状态
systemctl status nginx

# 启动 Nginx
systemctl start nginx

# 停止 Nginx
systemctl stop nginx

# 重启 Nginx
systemctl restart nginx

# 重新加载配置（无需重启）
systemctl reload nginx

# 测试配置文件语法
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log
```

### 系统资源监控

```bash
# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 和内存占用
top
# 或者
htop  # 需要先安装：yum install htop -y

# 查看服务器运行时间和负载
uptime

# 查看端口监听
netstat -tlnp

# 查看进程
ps aux | grep node
```

---

## 🔄 项目更新部署流程

### 标准更新流程（从 GitHub 拉取）

```bash
# 1. SSH 登录服务器
ssh root@139.196.49.164

# 2. 进入项目目录
cd /srv/Shiba-chinese

# 3. 备份当前版本（可选）
cp -r .next .next.backup.$(date +%Y%m%d_%H%M%S)

# 4. 拉取最新代码
git pull origin main

# 5. 安装/更新依赖
npm install

# 6. 构建项目
npm run build

# 7. 重启服务
pm2 restart shiba

# 8. 查看日志确认启动成功
pm2 logs shiba --lines 20
```

### 快速更新（仅代码变更，无依赖变化）

```bash
cd /srv/Shiba-chinese && \
git pull && \
npm run build && \
pm2 restart shiba && \
pm2 logs shiba --lines 20
```

### 回滚到上一个版本

```bash
# 查看 git 历史
git log --oneline -10

# 回滚到指定 commit
git reset --hard <commit-id>

# 重新构建和重启
npm run build && pm2 restart shiba
```

---

## 🛠️ 故障排查

### 服务无法访问

**症状**：网站无法打开

**排查步骤**：

1. **检查 PM2 服务状态**

   ```bash
   pm2 status
   # 如果显示 stopped 或 errored
   pm2 restart shiba
   pm2 logs shiba --lines 50
   ```

2. **检查 Nginx 状态**

   ```bash
   systemctl status nginx
   # 如果未运行
   systemctl start nginx
   ```

3. **检查端口监听**

   ```bash
   netstat -tlnp | grep -E "(80|3000)"
   # 应该看到 80 端口（nginx）和 3000 端口（node）
   ```

4. **检查防火墙/安全组**
   - 登录阿里云控制台
   - 确认安全组规则开放了 80 端口

5. **查看错误日志**

   ```bash
   # PM2 错误日志
   pm2 logs shiba --err --lines 100

   # Nginx 错误日志
   tail -50 /var/log/nginx/error.log
   ```

### 内存不足

**症状**：构建失败，显示 SIGKILL 或 OOM

**解决方案**：

```bash
# 查看内存使用
free -h

# 查看 swap 是否启用
swapon --show

# 如果 swap 未启用，重新启用
swapon /swapfile

# 构建时限制内存使用
NODE_OPTIONS="--max-old-space-size=1536" npm run build
```

### 磁盘空间不足

```bash
# 查看磁盘使用
df -h

# 清理 PM2 日志
pm2 flush

# 清理 npm 缓存
npm cache clean --force

# 清理旧的构建文件
cd /srv/Shiba-chinese
rm -rf .next.backup.*

# 清理系统临时文件
yum clean all
```

### Node.js 版本问题

```bash
# 检查当前版本
node -v
npm -v

# 切换到正确版本
source ~/.bashrc
nvm use 20

# 如果 nvm 未加载
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

---

## 📊 性能监控与优化

### 实时监控

```bash
# 监控 PM2 进程
pm2 monit

# 监控系统资源
top
# 按 M 键按内存排序
# 按 P 键按 CPU 排序
# 按 q 退出

# 查看网络连接
netstat -an | grep :80 | wc -l  # 当前 HTTP 连接数
```

### 日志管理

```bash
# PM2 日志轮转配置（避免日志文件过大）
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Nginx 性能优化

编辑 `/etc/nginx/nginx.conf`：

```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

---

## 🔒 安全建议

### ⚠️ 必须完成的安全配置

1. **修改 root 密码**

   ```bash
   passwd
   ```

2. **配置防火墙（如果需要）**

   ```bash
   # 安装 firewalld
   yum install firewalld -y

   # 启动并设置开机自启
   systemctl start firewalld
   systemctl enable firewalld

   # 开放必要端口
   firewall-cmd --permanent --add-service=http
   firewall-cmd --permanent --add-service=https
   firewall-cmd --permanent --add-service=ssh
   firewall-cmd --reload
   ```

3. **禁用密码登录，只用密钥（可选但推荐）**

   ```bash
   # 编辑 SSH 配置
   vi /etc/ssh/sshd_config

   # 修改以下配置
   PasswordAuthentication no
   PubkeyAuthentication yes

   # 重启 SSH 服务
   systemctl restart sshd
   ```

4. **配置环境变量**

   ```bash
   # 编辑项目环境变量
   cd /srv/Shiba-chinese
   vi .env.local

   # 添加必要的环境变量
   # COMMERCE_API_URL=
   # COMMERCE_CHECKOUT_URL=
   # REVALIDATION_SECRET=
   # NEXT_PUBLIC_JPY_TO_CNY_RATE=0.052

   # 重启服务使环境变量生效
   pm2 restart shiba
   ```

### 定期维护

```bash
# 每月系统更新
yum update -y

# 每周日志检查
pm2 logs shiba --lines 100 --nostream > /root/weekly_logs_$(date +%Y%m%d).log

# 定期备份（建议设置 cron）
# 编辑 crontab
crontab -e

# 添加每天凌晨 3 点备份
0 3 * * * tar -czf /root/backups/shiba_$(date +\%Y\%m\%d).tar.gz /srv/Shiba-chinese/.next
```

---

## 🌐 域名和 HTTPS 配置

### 配置 HTTPS（使用 Let's Encrypt）

```bash
# 1. 安装 Certbot
yum install certbot python3-certbot-nginx -y

# 2. 申请证书（确保域名已解析到服务器）
certbot --nginx -d shibapark.store -d www.shibapark.store

# 3. 自动续期
certbot renew --dry-run

# 4. 设置定时任务自动续期
echo "0 3 * * * certbot renew --quiet" | crontab -
```

---

## 📞 紧急联系与支持

### 重启服务器

**阿里云控制台操作**：

1. 登录阿里云控制台
2. 找到实例 `d2a89faf04d6407aa53c9fb831ad8558`
3. 点击「重启」

**注意**：重启后所有服务会自动启动（已配置开机自启）

### 完全重装（最后手段）

如果服务器出现严重问题，可以：

1. 在阿里云控制台创建快照备份
2. 重新初始化系统盘
3. 按照本文档重新部署

### 快速恢复检查清单

重启后执行：

```bash
# 1. 检查基础服务
systemctl status nginx
systemctl status pm2-root

# 2. 检查应用
pm2 status
pm2 logs shiba --lines 20

# 3. 测试访问
curl http://localhost
curl http://localhost:3000

# 4. 检查网络
ping -c 3 google.com
```

---

## 📝 附录

### 环境变量说明

| 变量名                        | 说明          | 示例                         | 必需 |
| ----------------------------- | ------------- | ---------------------------- | ---- |
| `COMMERCE_API_URL`            | 商品 API 地址 | https://api.example.com      | 否   |
| `COMMERCE_CHECKOUT_URL`       | 结算跳转地址  | https://checkout.example.com | 否   |
| `REVALIDATION_SECRET`         | 重新验证密钥  | your-secret-key              | 是   |
| `NEXT_PUBLIC_JPY_TO_CNY_RATE` | 汇率          | 0.052                        | 否   |

### Git 操作备忘

```bash
# 查看当前分支
git branch

# 切换分支
git checkout <branch-name>

# 查看改动
git status
git diff

# 强制与远程同步（慎用！）
git fetch origin
git reset --hard origin/main
```

### 常见问题 FAQ

**Q: 如何查看 Node.js 版本？**

```bash
node -v
npm -v
```

**Q: 如何查看项目使用的端口？**

```bash
netstat -tlnp | grep node
```

**Q: 如何清空 PM2 日志？**

```bash
pm2 flush
```

**Q: 忘记了 SSH 密码怎么办？**
A: 通过阿里云控制台的「远程连接」功能登录，然后重置密码。

---

## 📄 版本历史

| 日期       | 版本 | 说明         |
| ---------- | ---- | ------------ |
| 2025-10-08 | v1.0 | 初始部署完成 |

---

**文档维护者**: 开发团队
**最后更新**: 2025-10-08
**服务器位置**: 阿里云华东 2（上海）
