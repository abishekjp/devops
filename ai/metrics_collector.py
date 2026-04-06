"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 23: ai/metrics_collector.py
Phase 8 — Research Metrics Collector
 
Reads results.csv (playbook generation) and remediation_log.csv
(auto-remediation) to calculate and display research metrics.
 
Metrics calculated:
  - Avg AI playbook generation time
  - Total YAML lines generated
  - Estimated manual time saved
  - Percentage time reduction
  - Playbook run success rate
  - Remediation breakdown by urgency
 
Output: research_metrics.txt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
 
import os
import sys
import csv
from datetime import datetime
 
try:
    from auto_remediation import AI_MODELS
except ImportError:
    sys.path.insert(0, '.')
    sys.path.insert(0, 'ai')
    from auto_remediation import AI_MODELS
 
try:
    from tabulate import tabulate
except ImportError:
    print("⚠️  tabulate package not installed. Run: pip install tabulate")
    sys.exit(1)
 
# ── File Paths ──────────────────────────────────────────────
RESULTS_FILE    = "results.csv"
REMEDIATION_LOG = "remediation_log.csv"
METRICS_OUTPUT  = "research_metrics.txt"
 
# ── Manual baseline: 8 minutes per playbook task ────────────
MANUAL_TIME_PER_TASK_SECONDS = 8 * 60  # 480 seconds
 
 
def read_csv_safe(filepath):
    """Read a CSV file and return list of dicts. Returns empty list if missing."""
    if not os.path.isfile(filepath):
        return []
    try:
        with open(filepath, "r", newline="") as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        print(f"⚠️  Error reading {filepath}: {e}")
        return []
 
 
def calculate_playbook_metrics(results):
    """Calculate metrics from playbook generation results."""
    metrics = {
        "total_playbooks":      0,
        "avg_generation_time":  0,
        "total_yaml_lines":     0,
        "total_ai_time":        0,
        "total_manual_time":    0,
        "time_saved":           0,
        "time_reduction_pct":   0,
        "valid_yaml_count":     0,
        "run_attempted_count":  0,
        "run_success_count":    0,
        "success_rate":         0,
    }
 
    if not results:
        return metrics
 
    metrics["total_playbooks"] = len(results)
 
    gen_times = []
    for r in results:
        try:
            gen_times.append(float(r.get("generation_time_seconds", 0)))
        except (ValueError, TypeError):
            pass
 
    if gen_times:
        metrics["avg_generation_time"] = sum(gen_times) / len(gen_times)
        metrics["total_ai_time"]       = sum(gen_times)
 
    for r in results:
        try:
            metrics["total_yaml_lines"] += int(r.get("lines_of_yaml", 0))
        except (ValueError, TypeError):
            pass
 
    metrics["total_manual_time"] = metrics["total_playbooks"] * MANUAL_TIME_PER_TASK_SECONDS
    metrics["time_saved"]        = metrics["total_manual_time"] - metrics["total_ai_time"]
    if metrics["total_manual_time"] > 0:
        metrics["time_reduction_pct"] = (
            metrics["time_saved"] / metrics["total_manual_time"]
        ) * 100
 
    metrics["valid_yaml_count"] = sum(
        1 for r in results if r.get("yaml_valid", "").lower() == "true"
    )
    metrics["run_attempted_count"] = sum(
        1 for r in results if r.get("run_attempted", "").lower() == "true"
    )
    metrics["run_success_count"] = sum(
        1 for r in results if r.get("run_success", "").lower() == "true"
    )
    if metrics["run_attempted_count"] > 0:
        metrics["success_rate"] = (
            metrics["run_success_count"] / metrics["run_attempted_count"]
        ) * 100
 
    return metrics
 
 
def calculate_remediation_metrics(logs):
    """Calculate metrics from remediation logs."""
    metrics = {
        "total_alerts":   0,
        "auto_fixed":     0,
        "escalated":      0,
        "auto_fixed_pct": 0,
        "escalated_pct":  0,
        "by_urgency":     {},
    }
 
    if not logs:
        return metrics
 
    metrics["total_alerts"] = len(logs)
 
    for log in logs:
        success = log.get("success", "").lower() == "true"
        safe    = log.get("safe_to_automate", "").lower() == "true"
 
        if safe and success:
            metrics["auto_fixed"] += 1
        else:
            metrics["escalated"] += 1
 
        urgency = log.get("urgency", "unknown")
        if urgency not in metrics["by_urgency"]:
            metrics["by_urgency"][urgency] = {"total": 0, "auto_fixed": 0}
        metrics["by_urgency"][urgency]["total"] += 1
        if safe and success:
            metrics["by_urgency"][urgency]["auto_fixed"] += 1
 
    if metrics["total_alerts"] > 0:
        metrics["auto_fixed_pct"] = (
            metrics["auto_fixed"] / metrics["total_alerts"]
        ) * 100
        metrics["escalated_pct"] = (
            metrics["escalated"] / metrics["total_alerts"]
        ) * 100
 
    return metrics
 
 
def generate_report(pb_metrics, rem_metrics):
    """Generate the full research metrics report."""
    lines = []
    lines.append("═" * 60)
    lines.append("  RESEARCH METRICS REPORT")
    lines.append(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"  AI Provider: OpenRouter (FREE)")
    lines.append(f"  Models: {' → '.join(AI_MODELS[:2])}")
    lines.append("═" * 60)
    lines.append("")
 
    # ── Playbook Generation Metrics ─────────────────────────
    lines.append("━━━ AI PLAYBOOK GENERATION ━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("")
 
    pb_table = [
        ["Total playbooks generated",      pb_metrics["total_playbooks"]],
        ["Avg generation time",            f"{pb_metrics['avg_generation_time']:.1f}s"],
        ["Total YAML lines generated",     pb_metrics["total_yaml_lines"]],
        ["Valid YAML rate",                f"{pb_metrics['valid_yaml_count']}/{pb_metrics['total_playbooks']}"],
        ["", ""],
        ["Total AI time",                  f"{pb_metrics['total_ai_time']:.1f}s"],
        ["Est. manual time (8min/task)",   f"{pb_metrics['total_manual_time']:.0f}s ({pb_metrics['total_manual_time']/60:.0f}min)"],
        ["Time saved",                     f"{pb_metrics['time_saved']:.0f}s ({pb_metrics['time_saved']/60:.1f}min)"],
        ["Time reduction",                 f"{pb_metrics['time_reduction_pct']:.1f}%"],
        ["", ""],
        ["Playbooks run attempted",        pb_metrics["run_attempted_count"]],
        ["Playbooks run success",          pb_metrics["run_success_count"]],
        ["Run success rate",               f"{pb_metrics['success_rate']:.0f}%"],
    ]
    lines.append(tabulate(pb_table, headers=["Metric", "Value"], tablefmt="grid"))
    lines.append("")
 
    # ── Remediation Metrics ─────────────────────────────────
    lines.append("━━━ AI AUTO-REMEDIATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("")
 
    rem_table = [
        ["Total alerts processed", rem_metrics["total_alerts"]],
        ["Auto-remediated",        f"{rem_metrics['auto_fixed']} ({rem_metrics['auto_fixed_pct']:.0f}%)"],
        ["Escalated to human",     f"{rem_metrics['escalated']} ({rem_metrics['escalated_pct']:.0f}%)"],
    ]
    lines.append(tabulate(rem_table, headers=["Metric", "Value"], tablefmt="grid"))
    lines.append("")
 
    # ── Urgency Breakdown ───────────────────────────────────
    if rem_metrics["by_urgency"]:
        lines.append("━━━ REMEDIATION BY URGENCY ━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("")
        urgency_table = []
        for urgency, data in sorted(rem_metrics["by_urgency"].items()):
            pct = (data["auto_fixed"] / data["total"] * 100) if data["total"] > 0 else 0
            urgency_table.append([
                urgency.upper(),
                data["total"],
                data["auto_fixed"],
                f"{pct:.0f}%"
            ])
        lines.append(tabulate(
            urgency_table,
            headers=["Urgency", "Total", "Auto-Fixed", "Fix Rate"],
            tablefmt="grid"
        ))
        lines.append("")
 
    # ── Comparison Table ────────────────────────────────────
    lines.append("━━━ MANUAL vs AI-ASSISTED COMPARISON ━━━━━━━━━━━━━━━")
    lines.append("")
    comparison = [
        ["Playbook write time",     "~8 min",        f"{pb_metrics['avg_generation_time']:.1f}s"],
        ["Syntax errors",           "Common",         f"{pb_metrics['total_playbooks'] - pb_metrics['valid_yaml_count']} errors"],
        ["Remediation response",    "Manual triage",  f"{rem_metrics['auto_fixed']}/{rem_metrics['total_alerts']} auto-fixed"],
        ["Time reduction",          "Baseline",       f"{pb_metrics['time_reduction_pct']:.1f}%"],
    ]
    lines.append(tabulate(
        comparison,
        headers=["Metric", "Manual", "AI-Assisted"],
        tablefmt="grid"
    ))
    lines.append("")
 
    # ── Cost Analysis ───────────────────────────────────────
    lines.append("━━━ COST ANALYSIS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.append("")
    cost_table = [
        [AI_MODELS[0],                                   "FREE", "Primary Model"],
        [AI_MODELS[1],                                   "FREE", "Fallback Model"],
        ["meta-llama/llama-3.3-70b-instruct:free",       "FREE", "Best JSON but rate-limited"],
        ["Full viva demo (5 alerts)",                    "< $0.00", "Using free models"],
    ]
    lines.append(tabulate(
        cost_table,
        headers=["Model", "Cost", "Notes"],
        tablefmt="grid"
    ))
    lines.append("")
    lines.append("═" * 60)
 
    return "\n".join(lines)
 
 
# ── Main ────────────────────────────────────────────────────
if __name__ == "__main__":
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║         📊 RESEARCH METRICS COLLECTOR                    ║")
    print("║         Provider: OpenRouter (FREE)                      ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
 
    print(f"📂 Reading {RESULTS_FILE}...")
    results = read_csv_safe(RESULTS_FILE)
    print(f"   Found {len(results)} playbook generation records")
 
    print(f"📂 Reading {REMEDIATION_LOG}...")
    remediation_logs = read_csv_safe(REMEDIATION_LOG)
    print(f"   Found {len(remediation_logs)} remediation records")
    print()
 
    pb_metrics  = calculate_playbook_metrics(results)
    rem_metrics = calculate_remediation_metrics(remediation_logs)
 
    report = generate_report(pb_metrics, rem_metrics)
    print(report)
 
    try:
        with open(METRICS_OUTPUT, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"\n💾 Report saved to {METRICS_OUTPUT}")
    except Exception as e:
        print(f"\n⚠️  Failed to save report: {e}")
 