# 项目编码规则 (非显而易见部分)

## 数据存储模式

- 评价数据必须使用`localEvaluations`格式存储在 localStorage 中
- 批量提交 API 调用必须使用`batch: true`参数
- 用户 ID 必须通过`generateEncryptedUserId()`生成，格式为`{department}_{hash}`

## 组件开发规则

- 客户端组件必须以`"use client";`开头
- 评价组件必须支持本地优先的数据存储策略
- 所有评价表单必须验证等级分布要求（经控贸易和开投贸易部门）

## API 开发规则

- 评价 API 必须支持批量提交操作
- 人员数据 API 必须支持部门过滤参数
- 所有 API 错误必须返回详细的错误信息

## 关键函数使用

- `validateGradeDistribution()`: 在提交前必须调用验证等级分布
- `saveEvaluationToLocal()`: 评价数据必须先保存到本地
- `submitAllLocalEvaluations()`: 批量提交必须使用此函数

## 数据结构要求

- 评价数据必须包含 scores、totalScore、timestamp 字段
- 人员数据必须包含 id、name、department、role 字段
- localStorage 中的 localEvaluations 必须按 userId 组织

## 特殊处理逻辑

- 职能部门用户需要选择评价部门
- 经控贸易和开投贸易用户自动评价自己部门
- 评价完成后自动跳转到下一个未评价人员
