"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 22: ai/test_simulation.py
Phase 7 — Viva Demo Script
 
AI Provider: OpenRouter (https://openrouter.ai/api/v1)
Models: openai/gpt-oss-20b:free → nvidia/nemotron-nano-9b-v2:free (FREE with fallback)
 
Fires 5 infrastructure alerts through the AI auto-remediation
engine in dry-run mode. Demonstrates real-time AI diagnosis
without executing any actual Ansible commands.
 
Alerts simulated:
  1. disk_full     — web-server-01 at 94%
  2. nginx_down    — web-server-02
  3. high_cpu      — web-server-01 at 97%
  4. high_memory   — k8s-node-01 at 91%
  5. service_down  — web-server-02 (postgresql)
 
Outputs:
  - Per-alert AI diagnosis results
  - Summary table (tabulate)
  - Research statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
 
import sys
import time
import json
from datetime import datetime
 
# ── Dependencies ────────────────────────────────────────────
try:
    from tabulate import tabulate
except ImportError:
    print("⚠️  tabulate package not installed. Run: pip install tabulate")
    sys.exit(1)
 
# ── Import auto-remediation module ──────────────────────────
try:
    from auto_remediation import receive_alert, remediate, AI_MODELS
except ImportError:
    sys.path.insert(0, '.')
    sys.path.insert(0, 'ai')
    from auto_remediation import receive_alert, remediate, AI_MODELS
 
# ── Test Alert Definitions ──────────────────────────────────
ALERTS = [
    {
        "type":      "disk_full",
        "host":      "web-server-01",
        "metric":    "disk_usage_percent",
        "value":     "94%",
        "threshold": "85%",
        "partition": "/dev/sda1",
        "timestamp": datetime.now().isoformat(),
        "message":   "Disk usage at 94% on /dev/sda1"
    },
    {
        "type":      "nginx_down",
        "host":      "web-server-02",
        "metric":    "service_status",
        "value":     "N/A",
        "service":   "nginx",
        "timestamp": datetime.now().isoformat(),
        "message":   "Nginx web server is not responding on port 80"
    },
    {
        "type":      "high_cpu",
        "host":      "web-server-01",
        "metric":    "cpu_usage_percent",
        "value":     "97%",
        "threshold": "80%",
        "duration":  "5 minutes",
        "timestamp": datetime.now().isoformat(),
        "message":   "CPU usage sustained at 97% for 5 minutes"
    },
    {
        "type":      "high_memory",
        "host":      "k8s-node-01",
        "metric":    "memory_usage_percent",
        "value":     "91%",
        "threshold": "85%",
        "timestamp": datetime.now().isoformat(),
        "message":   "Memory usage at 91% — OOM risk"
    },
    {
        "type":      "service_down",
        "host":      "web-server-02",
        "metric":    "service_status",
        "value":     "N/A",
        "service":   "postgresql",
        "timestamp": datetime.now().isoformat(),
        "message":   "PostgreSQL service is not running"
    }
]
 
 
def run_simulation():
    """Execute the full 5-alert simulation in dry-run mode."""
 
    # ── Banner ──────────────────────────────────────────────
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                                                          ║")
    print("║   🤖  AI AUTO-REMEDIATION — LIVE SIMULATION              ║")
    print("║                                                          ║")
    print("║   5 infrastructure alerts → AI diagnosis → auto-fix      ║")
    print("║   Mode: DRY RUN (no real changes)                        ║")
    print("║   Provider: OpenRouter (FREE with auto-fallback)         ║")
    print("║   Cost: $0.00                                            ║")
    print("║                                                          ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
 
    results     = []
    total_alerts = len(ALERTS)
 
    # ── Process each alert ──────────────────────────────────
    for i, alert in enumerate(ALERTS, 1):
        alert_type = alert["type"]
        host       = alert["host"]
 
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"  📨 Firing alert {i}/{total_alerts}: {alert_type.upper()} on {host}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"  Value: {alert.get('value', 'N/A')}")
        print(f"  Message: {alert['message']}")
        print()
 
        # ── AI diagnosis via OpenRouter ─────────────────────
        # receive_alert() normalizes the action field before returning,
        # so diagnosis["action"] is always a valid PLAYBOOK_MAP key.
        start_time = time.time()
        diagnosis  = receive_alert(alert, dry_run=True)
        elapsed    = time.time() - start_time
 
        action  = diagnosis.get("action", "N/A")
        urgency = diagnosis.get("urgency", "N/A")
 
        # ── Display diagnosis ───────────────────────────────
        print(f"  🧠 AI Diagnosis ({elapsed:.1f}s):")
        print(f"     Root Cause:   {diagnosis.get('root_cause', 'N/A')}")
        print(f"     Action:       {action}")
        print(f"     Urgency:      {urgency}")
        print(f"     Safe to Auto: {diagnosis.get('safe_to_automate', 'N/A')}")
        print(f"     Playbook:     {diagnosis.get('playbook_name', 'N/A')}")
        print(f"     Reason:       {diagnosis.get('reason', 'N/A')}")
        print()
 
        # ── Attempt remediation (dry run) ───────────────────
        success = remediate(diagnosis, host, dry_run=True)
        print()
 
        # ── Store result — action is already normalized here ─
        results.append({
            "alert":     alert_type,
            "host":      host,
            "diagnosis": diagnosis.get("root_cause", "N/A")[:30],
            "action":    action,
            "urgency":   urgency,
            "auto_fix":  "✅" if diagnosis.get("safe_to_automate") else "❌",
            "time_s":    f"{elapsed:.1f}"
        })
 
        # ── Pause between alerts ────────────────────────────
        if i < total_alerts:
            print("  ⏳ Next alert in 4 seconds...")
            print()
            time.sleep(4)
 
    # ── Summary Table ───────────────────────────────────────
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║                  SIMULATION RESULTS                      ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
 
    table_data = [
        [r["alert"], r["host"], r["diagnosis"], r["action"],
         r["urgency"], r["auto_fix"], r["time_s"]]
        for r in results
    ]
 
    headers = ["Alert", "Host", "Diagnosis", "Action",
               "Urgency", "Auto-Fix", "Time(s)"]
 
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
 
    # ── Research Statistics ─────────────────────────────────
    auto_fixed   = sum(1 for r in results if r["auto_fix"] == "✅")
    escalated    = total_alerts - auto_fixed
    times        = [float(r["time_s"]) for r in results]
    avg_time     = sum(times) / len(times) if times else 0
    fastest_idx  = times.index(min(times))
    slowest_idx  = times.index(max(times))
 
    print()
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("  📊 RESEARCH SUMMARY")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"  Total alerts processed:  {total_alerts}")
    print(f"  Auto-remediated:         {auto_fixed}")
    print(f"  Escalated to human:      {escalated}")
    print(f"  Avg AI response time:    {avg_time:.1f}s")
    print(f"  Fastest:                 {min(times):.1f}s ({results[fastest_idx]['alert']})")
    print(f"  Slowest:                 {max(times):.1f}s ({results[slowest_idx]['alert']})")
    print(f"  AI Provider:             OpenRouter (FREE)")
    print(f"  Models:                  {' → '.join(AI_MODELS[:2])}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print()
    print("✅ Simulation complete — all alerts processed in dry-run mode")
 
 
# ── Entry Point ─────────────────────────────────────────────
if __name__ == "__main__":
    run_simulation()