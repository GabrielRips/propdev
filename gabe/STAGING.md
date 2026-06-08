# Environments & deploy workflow

Two isolated environments run on the same droplet. Each has its own git branch,
database + uploaded files, Node process and TLS certificate.

| Env     | URL                                         | Branch    | Port | pm2 process    | Data dir                     |
|---------|---------------------------------------------|-----------|------|----------------|------------------------------|
| Prod    | https://170.64.225.210.nip.io               | `main`    | 8080 | `gabe`         | `/root/propdev-data`         |
| Staging | https://staging.170.64.225.210.nip.io       | `staging` | 8081 | `gabe-staging` | `/root/propdev-staging-data` |

Staging and prod **do not share data** — testing on staging never touches prod.

## Workflow: test before prod

```bash
# 1. make changes, then push to the staging branch
git checkout staging
git merge main            # keep staging current (or work directly on staging)
# ... commit your changes ...
git push origin staging

# 2. deploy + test staging
ssh root@170.64.225.210 '/root/deploy.sh staging'
# open https://staging.170.64.225.210.nip.io and verify

# 3. promote to prod
git checkout main
git merge staging
git push origin main
ssh root@170.64.225.210 '/root/deploy.sh prod'
# open https://170.64.225.210.nip.io
```

`/root/deploy.sh` is a symlink to `gabe/deploy.sh`. It pulls the right branch,
installs deps, builds the frontend, and restarts that environment's pm2 process.

## Handy

```bash
# copy prod data into staging (to test against a snapshot of real data)
ssh root@170.64.225.210 'pm2 stop gabe-staging; \
  cp -r /root/propdev-data/* /root/propdev-staging-data/; \
  pm2 start gabe-staging'

# logs
ssh root@170.64.225.210 'pm2 logs gabe-staging --lines 50'
```

> The droplet is small (458 MB RAM + 2 GB swap). Two idle Node servers are fine;
> a frontend build spikes memory into swap briefly. If it ever feels tight, move
> staging to its own droplet (only the nginx vhost + deploy target change).
