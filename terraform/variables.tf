# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FILE 9: terraform/variables.tf
# Phase 4 — Terraform Variables
# Defines all configurable parameters for the infrastructure
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Kubernetes Context ──────────────────────────────────────
variable "kube_context" {
  description = "Kubernetes context to use from kubeconfig"
  type        = string
  default     = "docker-desktop"
}

# ── Namespace ───────────────────────────────────────────────
variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "myapp-prod"
}

# ── Environment ─────────────────────────────────────────────
variable "environment" {
  description = "Deployment environment label"
  type        = string
  default     = "production"
}

# ── Sensitive: Database URL ─────────────────────────────────
variable "db_url" {
  description = "Database connection string"
  type        = string
  sensitive   = true
  default     = ""
}

# ── Sensitive: API Key ──────────────────────────────────────
variable "api_key" {
  description = "Application API key"
  type        = string
  sensitive   = true
  default     = ""
}
