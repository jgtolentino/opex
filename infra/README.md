# Infrastructure

Infrastructure as code, environment templates, and deployment configurations.

## Structure

```
infra/
├── terraform/          # Cloud infrastructure definitions
├── k8s/                # Kubernetes manifests (if applicable)
├── docker/             # Docker Compose files
└── env-templates/      # .env file examples
```

## Docker

**Status:** Planned (Phase 4)

Docker Compose for local development stack.

### `docker/docker-compose.dev.yml`

Services:
- Supabase (local via supabase/supabase)
- Odoo CE + PostgreSQL
- n8n
- (Optional) Mattermost, Deepnote alternatives

**Usage:**
```bash
cd infra/docker
docker-compose -f docker-compose.dev.yml up -d
```

## Environment Templates

**Status:** Planned (Phase 4)

Example `.env` files in `env-templates/`:

### `.env.opex.example`
Environment variables for OpEx Portal:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `MATTERMOST_WEBHOOK_URL`

### `.env.supabase.example`
Supabase-specific variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_DB_PASSWORD`

### `.env.odoo.example`
Odoo-specific variables:
- `ODOO_ADMIN_PASSWORD`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `ODOO_DATABASE`

**Usage:**
1. Copy template to `.env`: `cp env-templates/.env.opex.example .env`
2. Fill in actual values
3. Never commit `.env` to git

## Terraform

**Status:** Optional (Phase 4+)

Infrastructure as code for cloud deployments.

### Planned Resources

- Vercel projects (apps)
- Supabase projects
- Cloud storage (S3, GCS)
- Monitoring (DataDog, Sentry)
- Secrets management (AWS Secrets Manager, Vault)

**Usage:**
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

## Kubernetes

**Status:** Optional (Phase 4+)

Kubernetes manifests for production deployment (if needed).

### Planned Manifests

- Odoo deployment + service
- n8n deployment + service
- Ingress controllers
- ConfigMaps and Secrets

**Usage:**
```bash
kubectl apply -f infra/k8s/
```

## Security

- **Never commit secrets** - Use `.env` files, secret managers, or environment variables
- **Rotate credentials** regularly
- **Use IAM roles** where possible instead of long-lived keys
- **Encrypt sensitive data** at rest and in transit

## Deployment Environments

### Local Development
- Docker Compose (`docker/docker-compose.dev.yml`)
- Local Supabase (`supabase start`)

### Staging
- Vercel preview deployments (PRs)
- Supabase staging project
- Test data and sandboxed environments

### Production
- Vercel production (main branch)
- Supabase production project
- Full monitoring and alerting

## Monitoring & Observability

**Planned:**
- Supabase metrics
- Vercel analytics
- n8n workflow logs
- Custom health dashboards (Data Lab UI)
- Mattermost alerts

## References

- **Docker Documentation:** https://docs.docker.com/
- **Terraform Documentation:** https://www.terraform.io/docs
- **Kubernetes Documentation:** https://kubernetes.io/docs/
- **Specs:** `.specify/specs/**`
