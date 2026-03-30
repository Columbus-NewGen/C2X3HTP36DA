# GymMate Web App

GymMate: Your Fitness Buddy

Frontend web application built with React, TypeScript, and Vite.

## Overview

This repository contains the GymMate frontend used for:

- user authentication and profile
- workout/exercise browsing
- machine and floorplan management
- dashboard and leaderboard features

## Tech Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 4
- React Router
- TanStack Query
- Axios

## Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 9+
- Docker (optional, for container deployment)

## Quick Start (Local Development)

1) Install dependencies

```bash
pnpm install
```

2) Create local environment file

Create `.env` in project root:

```env
VITE_SERVER_URL=https://api.example.com
VITE_BASE_URL=https://app.example.com
VITE_PORT=4000
```

3) Run development server

```bash
pnpm dev
```

Default app URL: `http://localhost:4000`

## Build and Preview

Build production assets:

```bash
pnpm build
```

Preview built assets locally:

```bash
pnpm preview
```

## Scripts

- `pnpm dev` - start dev server
- `pnpm build` - build production bundle
- `pnpm preview` - preview production bundle
- `pnpm lint` - run ESLint

## Environment Variables

This app uses Vite environment variables:

- `VITE_SERVER_URL` - backend API base URL
- `VITE_BASE_URL` - frontend base URL
- `VITE_PORT` - local dev port

Important:

- variables prefixed with `VITE_` are exposed to browser code
- do not put secrets (tokens, private keys, DB credentials) in `VITE_*`
- keep real local values in `.env` (not committed)
- use CI/CD secrets for build-time environment values in production

## Docker (Production Build and Run)

Build image:

```bash
docker build -t gymmate-webapp:latest .
```

Run container:

```bash
docker run --rm -p 4000:4000 gymmate-webapp:latest
```

## Production Readiness Checklist

Before publishing this repo or deploying:

- ensure `.env` is excluded from git
- include only `.env.example` in repository
- verify no API keys/tokens are committed
- run lint and build checks:

```bash
pnpm lint
pnpm build
```

## Suggested `.env.example`

Commit this file as template:

```env
VITE_SERVER_URL=https://api.example.com
VITE_BASE_URL=https://app.example.com
VITE_PORT=4000
```

## Project Credits

### หัวข้อโครงงาน

GymMate : เพื่อนรู้ใจเรื่องฟิตเนส  
GymMate : Your Fitness Buddy

### โดย

- ภาณุเดช เสือเผือก รหัส 650610797
- ภูเบศร์ เรืองคุ้ม รหัส 650610798
- อนวัช รัตนกิจศร รหัส 650610818

### ข้อมูลหลักสูตร

- ภาควิชา: วิศวกรรมคอมพิวเตอร์
- อาจารย์ที่ปรึกษา: ผศ.ดร. นวดนย์ คุณเลิศกิจ
- ปริญญา: วิศวกรรมศาสตรบัณฑิต
- สาขา: วิศวกรรมคอมพิวเตอร์
- ปีการศึกษา: 2568

ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่ ได้อนุมัติให้โครงงานนี้เป็นส่วนหนึ่งของการศึกษาตามหลักสูตรปริญญาวิศวกรรมศาสตรบัณฑิต (สาขาวิศวกรรมคอมพิวเตอร์)

### คณะกรรมการสอบโครงงาน

- ประธานกรรมการ: ผศ.ดร. นวดนย์ คุณเลิศกิจ
- กรรมการ: ผศ. โดม โพธิกานนท์
- กรรมการ: ผศ.ดร. ลัชนา ระมิงค์วงศ์
