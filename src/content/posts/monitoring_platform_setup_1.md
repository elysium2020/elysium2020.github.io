---
title: '搭建监控平台（一）'
pubDate: 2025-05-11
description: '在 Linux 下搭建基于 Prometheus 和 Grafana 的监控平台。完成初步安装与设置'
tags: ['linux', 'grafana', 'prometheus', 'nginx']
---

## 选型

最近终于有空搞搞机子了。
整了个 4C + 4G + 60G 的虚拟机来玩玩 Linux。

现在第一步就是搭建一个检测虚拟机状态的平台。
在搜索后决定用 Prometheus + Grafana 的架构来搭建。

## 流程

### 安装及初启动

首先我们需要安装上述软件，为了实现同时监控系统我们在安装完上述软件后再安装 node_exporter。
我在选择的发行版中官方仓库已经有相关包，这里直接选择使用包管理器安装：

```sh
sudo dnf install grafana prometheus
```

然后启动这两个服务：

```sh
systemctl enable --now grafana prometheus
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

此时脚本正常运行。

现在让我们看看 Grafana。
Grafana 网页端非常友好，我们只需要按照提示导入 Prometheus 数据源即可。
关于 dashboard，官方内置的已经过时，
我这里更推荐使用 [Node Exporter Full](https://grafana.com/grafana/dashboards/1860-node-exporter-full/)。
配置时输入 1860 导入即可。

### 路由转发

实际的环境中，为了安全是不可能之间将 3030 暴露到互联网中。
因此，我们需要配置路径来让管理员可以访问。
比如域名为 `foo.bar`，则需要访问 `foo.bar/monitor` 来进行访问。

为了实现这样的功能，我们需要对 grafana 设置如下：

```ini
# /etc/grafana/grafana.ini
[server]
domain = localhost
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

现在我们可以通过访问 foo.bar/monitor 来访问 Grafana。
