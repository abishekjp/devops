# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FILE 8: terraform/main.tf
# Phase 4 — Infrastructure Provisioning
# Creates Kubernetes namespace, resource quotas, and secrets
# Provider: hashicorp/kubernetes
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Terraform Configuration ─────────────────────────────────
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  required_version = ">= 1.0"
}

# ── Kubernetes Provider ─────────────────────────────────────
# Uses the kubeconfig context specified in variables
provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = var.kube_context
}

# ── Resource 1: Namespace ───────────────────────────────────
# Dedicated namespace for production workloads
resource "kubernetes_namespace" "myapp" {
  metadata {
    name = var.namespace

    labels = {
      environment = var.environment
      managed-by  = "terraform"
      project     = "devsecops-ai-demo"
    }
  }
}

# ── Resource 2: Resource Quota ──────────────────────────────
# Prevents any single namespace from consuming too many resources
resource "kubernetes_resource_quota" "myapp" {
  metadata {
    name      = "myapp-quota"
    namespace = kubernetes_namespace.myapp.metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = "1"
      "requests.memory" = "512Mi"
      "limits.cpu"      = "2"
      "limits.memory"   = "1Gi"
      "pods"            = "10"
    }
  }
}

# ── Resource 3: Application Secrets ────────────────────────
# Sensitive values injected from CI/CD pipeline variables
resource "kubernetes_secret" "app_secrets" {
  metadata {
    name      = "myapp-secrets"
    namespace = kubernetes_namespace.myapp.metadata[0].name
  }

  type = "Opaque"

  data = {
    DATABASE_URL = var.db_url
    API_KEY      = var.api_key
  }
}
