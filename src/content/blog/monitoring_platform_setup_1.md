---
title: '搭建监控平台（一）'
pubDate: 2025-05-11
description: '在 Linux 下搭建基于 Prometheus 和 Grafana 的监控平台。完成初步安装与设置'
tags: ['linux', 'grafana', 'prometheus', 'nginx']
---

## 选型

最近终于有时间折腾一下 homelab。
我准备了一台 `4C + 4G + 60G` 的虚拟机，用来实践 Linux 环境下的监控方案。

现在第一步就是搭建一个检测虚拟机状态的平台。
在搜索后决定用 Prometheus + Grafana 的架构来搭建。

## 流程

### 安装及初启动

首先我们需要安装上述软件。为了同时监控系统资源，还需要额外安装 `node_exporter`。
我在选择的发行版中官方仓库已经有相关包，这里直接选择使用包管理器安装：

```sh
sudo dnf install grafana prometheus node_exporter
```

然后启动这些服务：

```sh
systemctl enable --now grafana prometheus node_exporter
```

现在我们就完成了安装以及初次启动。

### 配置

上文提到， Prometheus 如果要监控系统资源，要额外安装 node_exporter。
现在我们对 Prometheus 进行配置来启用这个插件：

```yaml
# /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          app: 'prometheus'
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
```

然后重启服务：

```sh
systemctl restart prometheus
```

即可完成插件启用。

现在让我们测试一下：

```sh
❯ sudo ss -tulnp | grep -E "9090|9100"
[sudo] password for elysium:
tcp   LISTEN 0      4096       127.0.0.1:9090       0.0.0.0:*    users:(("prometheus",pid=54760,fd=6))
tcp   LISTEN 0      4096               *:9100             *:*    users:(("node_exporter",pid=54759,fd=3))
```

此时相关服务已经正常运行。

现在让我们看看 Grafana。
Grafana 的 Web 界面已经提供了较完整的引导，我们只需要按提示导入 Prometheus 数据源即可。
关于 Dashboard，官方内置模板相对基础，
我这里更推荐使用 [Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)。
配置时输入 1860 导入即可。

### 路由转发

在实际环境中，通常不会直接将 `3000` 端口暴露到互联网。
因此，我们通常会通过反向代理暴露一个受控的访问路径，供管理员使用。
比如域名为 `foo.bar`，则需要访问 `foo.bar/monitor` 来进行访问。

为了实现这样的功能，我们需要对 grafana 设置如下：

```ini
# /etc/grafana/grafana.ini
[server]
domain = foo.bar
root_url = %(protocol)s://%(domain)s/monitor/
serve_from_sub_path = true
```

然后对 nginx 设置如下：

```nginx
# /etc/nginx/nginx.conf
server {
  location /monitor/ {
    proxy_pass http://localhost:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

然后重启这两个服务

```sh
systemctl restart nginx grafana
```

现在我们可以通过访问 `https://foo.bar/monitor/` 来访问 Grafana。
