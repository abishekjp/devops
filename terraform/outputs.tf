# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FILE 10: terraform/outputs.tf
# Phase 4 — Terraform Outputs
# Exports values for downstream pipeline stages
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ── Namespace Name ──────────────────────────────────────────
output "namespace_name" {
  description = "The name of the created Kubernetes namespace"
  value       = kubernetes_namespace.myapp.metadata[0].name
}

# ── Namespace UID ───────────────────────────────────────────
output "namespace_uid" {
  description = "The UID of the created Kubernetes namespace"
  value       = kubernetes_namespace.myapp.metadata[0].uid
}
