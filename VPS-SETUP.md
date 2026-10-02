# Fresh VPS setup checklist

Everything to go from a bare Ubuntu box to a running D-Kit, in order. The
production layout is one pm2 process (`dkit-api`) serving both the API and the
built website on port 3001, with a Cloudflare tunnel in front.

## 1. Base packages

- [ ] Update and install the basics:

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential ufw
sudo ufw allow OpenSSH && sudo ufw --force enable
```

## 2. Node.js 22 LTS

- [ ] Install via NodeSource and verify:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # expect v22.x
```

## 3. PostgreSQL

- [ ] Install, then create the app user and database (pick a real password —
      it goes into `backend/.env` as `DB_PASSWORD`):

```bash
sudo apt-get install -y postgresql
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER dkituser WITH PASSWORD '<password>';"
sudo -u postgres psql -c "CREATE DATABASE dkit OWNER dkituser;"
```

## 4. Redis

- [ ] Install and enable (the backend expects it on `localhost:6379`):

```bash
sudo apt-get install -y redis-server
sudo systemctl enable --now redis-server
redis-cli ping   # expect PONG
```

## 5. GitHub access (so the VPS can pull/push the repo)

- [ ] Generate a dedicated key and print the public half:

```bash
ssh-keygen -t ed25519 -C "dkit-vps" -f ~/.ssh/github_ed25519 -N ""
cat ~/.ssh/github_ed25519.pub
```

- [ ] Add that key on GitHub: **Settings → SSH and GPG keys → New SSH key**.
- [ ] Pin the key for github.com in `~/.ssh/config`:

```
Host github.com
  IdentityFile ~/.ssh/github_ed25519
  IdentitiesOnly yes
```

- [ ] Verify: `ssh -T git@github.com` → "Hi <username>!"
- [ ] Clone the repo:

```bash
git clone git@github.com:<you>/<repo>.git d-kit
cd d-kit
```

## 6. Secrets and environment

Nothing secret lives in git, so restore the env file:

- [ ] Create `backend/.env` from the template and fill it in
      (`DB_PASSWORD` from step 3, `JWT_SECRET` via `openssl rand -hex 32`,
      `RESEND_API_KEY` from resend.com, `PUBLIC_URL`):

```bash
cp backend/.env.example backend/.env
nano backend/.env
chmod 600 backend/.env
```

The old VPS keeps the working values: copy them from its `backend/.env`, or
pull them from the migration archive (`env/backend.env`).

## 7. Install, build, start

- [ ] Build the website and boot the API under pm2:

```bash
cd website && npm install && npm run build && cd ..
cd backend && npm install && cd ..
sudo npm install -g pm2
pm2 start backend/ecosystem.config.js
pm2 save
```

- [ ] Verify locally before touching DNS:

```bash
curl -s http://localhost:3001/api/health   # expect {"status":"ok",...}
```

## 8. Cloudflare tunnel

The tunnel ID is portable — reusing it means no DNS or Resend/OAuth changes.
Its credentials live only on the old box (or in the migration archive), so:

- [ ] Restore the identity from the migration archive
      (`cloudflared/cert.pem` + credentials JSON → `~/.cloudflared/`), or run
      `cloudflared tunnel login` and `cloudflared tunnel create my-website-tunnel`
      for a brand-new tunnel (then update the DNS record in the Cloudflare dashboard).
- [ ] Install cloudflared and test manually first:

```bash
sudo apt-get install -y cloudflared   # or grab the .deb from cloudflare
cloudflared tunnel run my-website-tunnel
```

- [ ] Confirm `curl -s https://dkit.name.ng/api/health` works — **but only
      after stopping the tunnel on the old box** (two boxes can't hold the
      same tunnel; see cutover below).

## 9. Cutover (the only downtime — seconds)

- [ ] Old box: `pm2 stop dkit-tunnel && pm2 save`
- [ ] New box:

```bash
pm2 start cloudflared --name dkit-tunnel -- cloudflared tunnel run my-website-tunnel
pm2 save
pm2 startup systemd -u $USER --hp $HOME   # run the printed command if any
```

- [ ] Verify: site loads, login works, dashboard Secrets/Cron/Monitors respond.
- [ ] Rollback if anything's wrong: `pm2 start dkit-tunnel` on the old box.

## 10. Backups (do this the same day)

The repo has no data and no secrets — the only copies of your DB and
`backend/.env` live on the box until you export them.

- [ ] Weekly off-box export via cron (`crontab -e`):

```
0 4 * * 0 cd /home/<you>/d-kit && bash scripts/migrate-export.sh >> ~/migrate.log 2>&1
30 4 * * 0 scp ~/dkit-migration-*.tar.gz backup@offbox:/backups/ && rm ~/dkit-migration-*.tar.gz
```

- [ ] Keep a copy of `backend/.env` in a password manager — it's five lines
      and unrecoverable if lost.

## 11. Old box decommission (after a few days)

- [ ] Confirm the new box is stable, then keep the old box untouched for a
      few days as the rollback path.
- [ ] When confident: delete the migration archives from both boxes (they
      contain the DB and secrets) and shut the old box down.
