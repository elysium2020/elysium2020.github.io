---
title: '搭建监控平台（二）'
pubDate: 2025-05-14
description: '完成 Prometheus 的监控告警与 Alertmanager 的自动处理告警'
tags: ['linux', 'prometheus', 'alertmanager']
---

## 前言

在上一篇博文中，我们完成了监控平台的初步搭建。
但光有监控还不够，在 OOM、磁盘即将满、BTRFS 出现错误等情况时，
我们可能会因为未能及时监控到而导致服务器出现异常。
为了解决这个情况，我们可以利用 Prometheus 中的监控功能来设置对一些情况的警告。
并经由 Alertmanager 进行统一管理并转发。
本博文拟针对一些常见情况设置自动告警，并经由 Alertmanager 往指定邮箱发送告警邮件。

## 配置 Prometheus

### 关联 Alertmanager

在正式设置警告规则前，我们应该关联 Prometheus 与 Alertmanager，
让 Prometheus 正确向 Alertmanager 发送告警信息：

```yml
#/etc/prometheus/prometheus.yml
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

### 配置告警规则

首先，应该创建一个子目录用于维护警告：

```sh
mkdir -p /etc/prometheus/rules
```

然后在配置文件引入这个目录：

```yml
#/etc/prometheus/prometheus.yml
rule_files:
  - '/etc/prometheus/rules/*.yml'
```

接着我们创建相关的告警规则：

```yml
#/etc/prometheus/rules/system.yml
groups:
  - name: hostStatsAlert
    rules:
      - alert: CPUHighUse
        expr: '(1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))) * 100 > 0.85'
      - alert: DiskFull
        expr: 'node_filesystem_avail_bytes{mountpoint=~"/"} / node_filesystem_size_bytes < 0.85'
      - alert: OOM
        expr: 'node_memory_MemAvailable_bytes/node_memory_MemTotal_bytes < 0.85'
      - alert: NodeDown
        expr: 'up == 0'
```

然后重启 Prometheus：

```sh
systemctl restart prometheus
```

## 安装并配置 Alertmanager

Alertmanager 同样也在官方仓库中，直接安装即可。

紧接着我们对其进行简单的配置，让他通过指定的 Gmail 邮箱向一个特殊的邮箱发送告警邮件：

```yml
#/etc/alertmanager/alertmanager.yml
global:
  smtp_smarthost: smtp.gmail.com:587
  smtp_from: <接受邮箱地址>
  smtp_auth_username: <发送邮箱用户名>
  smtp_auth_password: <发送邮箱密码>

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'email'

receivers:
  - name: email
    email_configs:
      - to: <接受邮箱地址>
        send_resolved: true

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

然后启动 Alertmanager：

```sh
systemctl enable --now alertmanager
```
