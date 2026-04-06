"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILE 21: ai/ai_playbook_generator.py
Phase 8 — AI Playbook Generator + Feedback Loop
 
AI Provider: OpenRouter (https://openrouter.ai/api/v1)
Models: openai/gpt-oss-20b:free → nvidia/nemotron-nano-9b-v2:free
        (FREE with automatic fallback on rate limits)
 
Generates production-ready Ansible playbooks from plain English.
Validates YAML, offers dry-run execution, and logs results.
 
Flow:
  1. User describes task in English
  2. AI generates complete Ansible YAML via OpenRouter
  3. PyYAML validates the output
  4. User can dry-run then live-run the playbook
  5. Results logged to results.csv
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
 
import os
import sys
import csv
import time
import tempfile
import subprocess
from datetime import datetime
 
try:
    import yaml
except ImportError:
    print("⚠️  pyyaml package not installed. Run: pip install pyyaml")
    sys.exit(1)
 
# ── Import shared AI call function ──────────────────────────
try:
    from auto_remediation import call_ai, AI_MODELS
except ImportError:
    sys.path.insert(0, '.')
    sys.path.insert(0, 'ai')
    from auto_remediation import call_ai, AI_MODELS
 
# ── Constants ───────────────────────────────────────────────
RESULTS_FILE   = "results.csv"
INVENTORY_FILE = "ansible/inventory.ini"
 
 
def print_banner():
    """Display the ASCII art banner."""
    banner = r"""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     █████╗ ██╗    ██████╗ ██╗      █████╗ ██╗   ██╗     ║
║    ██╔══██╗██║    ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝     ║
║    ███████║██║    ██████╔╝██║     ███████║ ╚████╔╝      ║
║    ██╔══██║██║    ██╔═══╝ ██║     ██╔══██║  ╚██╔╝       ║
║    ██║  ██║██║    ██║     ███████╗██║  ██║   ██║        ║
║    ╚═╝  ╚═╝╚═╝    ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝        ║
║                                                          ║
║        AI Ansible Playbook Generator                     ║
║        Powered by OpenRouter (FREE with fallback)        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    """
    print(banner)
 
 
def generate_playbook(task_description):
    """
    Generate an Ansible playbook from a plain English description.
 
    Args:
        task_description: English description of the desired task
 
    Returns:
        Tuple of (yaml_content, generation_time_seconds)
    """
    system_prompt = (
        "You are an expert Ansible engineer. "
        "The user describes a task in plain English. "
        "Write a complete Ansible playbook for Ubuntu 22.04. "
        "Target hosts group: webservers. "
        "Output ONLY valid YAML. No explanation. "
        "No markdown fences. No preamble."
    )
 
    start_time = time.time()
 
    try:
        yaml_content = call_ai(system_prompt, task_description, expect_json=False)
        generation_time = time.time() - start_time
 
        # Strip markdown fences if model wrapped the output
        yaml_content = yaml_content.strip()
        if yaml_content.startswith("```"):
            lines = yaml_content.split("\n")
            lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            yaml_content = "\n".join(lines)
 
        return yaml_content, generation_time
 
    except Exception as e:
        generation_time = time.time() - start_time
        print(f"❌ OpenRouter API error: {e}")
        return None, generation_time
 
 
def validate_yaml(yaml_content):
    """Validate generated YAML using PyYAML safe_load."""
    try:
        yaml.safe_load(yaml_content)
        return True
    except yaml.YAMLError as e:
        print(f"❌ YAML validation failed: {e}")
        return False
 
 
def run_playbook(yaml_content, dry_run=True):
    """Write playbook to temp file and execute with ansible-playbook."""
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode='w', suffix='.yml', delete=False, prefix='ai_playbook_'
        ) as f:
            f.write(yaml_content)
            temp_path = f.name
 
        cmd = ["ansible-playbook", temp_path, "-i", INVENTORY_FILE]
        if dry_run:
            cmd.append("--check")
            print("🔍 Running in DRY-RUN mode (--check)...")
        else:
            print("🚀 Running LIVE playbook...")
 
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        return result.returncode == 0, result.stdout, result.stderr
 
    except subprocess.TimeoutExpired:
        return False, "", "Playbook timed out after 300 seconds"
    except FileNotFoundError:
        return False, "", "ansible-playbook not found. Is Ansible installed?"
    except Exception as e:
        return False, "", str(e)
    finally:
        if temp_path:
            try:
                os.unlink(temp_path)
            except Exception:
                pass
 
 
def log_result(task_desc, gen_time, lines, valid, attempted, success, error):
    """Append generation result to results.csv."""
    file_exists = os.path.isfile(RESULTS_FILE)
    try:
        with open(RESULTS_FILE, "a", newline="") as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow([
                    "timestamp", "task_description", "generation_time_seconds",
                    "lines_of_yaml", "yaml_valid", "run_attempted",
                    "run_success", "error_message"
                ])
            writer.writerow([
                datetime.now().isoformat(), task_desc, f"{gen_time:.2f}",
                lines, valid, attempted, success, error
            ])
    except Exception as e:
        print(f"⚠️  Failed to write to results log: {e}")
 
 
# ── Main Interactive Loop ──────────────────────────────────
if __name__ == "__main__":
    print_banner()
 
    print("Describe what you want Ansible to do in plain English.")
    print("Example: 'Install nginx, configure a reverse proxy, and enable HTTPS'")
    print()
    task_description = input("🎯 Describe what Ansible should do: ").strip()
 
    if not task_description:
        print("❌ No description provided. Exiting.")
        sys.exit(1)
 
    print()
    print(f"📝 Task: {task_description}")
    print(f"⏳ Generating playbook with OpenRouter AI ({AI_MODELS[0]})...")
    print()
 
    yaml_content, gen_time = generate_playbook(task_description)
 
    if not yaml_content:
        log_result(task_description, gen_time, 0, False, False, False, "Generation failed")
        sys.exit(1)
 
    is_valid   = validate_yaml(yaml_content)
    line_count = len(yaml_content.strip().split('\n'))
 
    print("═" * 60)
    print("  GENERATED ANSIBLE PLAYBOOK")
    print("═" * 60)
    print()
    print(yaml_content)
    print()
    print("═" * 60)
    print(f"📊 Generated {line_count} lines in {gen_time:.1f}s")
    print(f"✅ YAML Valid: {'Yes' if is_valid else 'No'}")
    print()
 
    run_attempted = False
    run_success   = False
    error_msg     = ""
 
    response = input("▶️  Run this playbook? (yes/no): ").strip().lower()
 
    if response in ("yes", "y"):
        run_attempted = True
        print()
        success, stdout, stderr = run_playbook(yaml_content, dry_run=True)
        if stdout:
            print(stdout)
        if stderr:
            print(f"⚠️  {stderr}")
 
        if success:
            print("✅ Dry run passed!")
            print()
            live = input("▶️  Run LIVE (no --check)? (yes/no): ").strip().lower()
            if live in ("yes", "y"):
                success, stdout, stderr = run_playbook(yaml_content, dry_run=False)
                run_success = success
                if stdout:
                    print(stdout)
                if stderr:
                    error_msg = stderr
                    print(f"⚠️  {stderr}")
            else:
                print("⏭️  Skipping live run.")
                run_success = True
        else:
            error_msg = stderr or "Dry run failed"
            print(f"❌ Dry run failed: {error_msg}")
    else:
        print("⏭️  Skipping playbook execution.")
 
    log_result(
        task_description, gen_time, line_count,
        is_valid, run_attempted, run_success, error_msg
    )
 
    print()
    print("━" * 60)
    print("  📋 SUMMARY")
    print("━" * 60)
    print(f"  Task:            {task_description}")
    print(f"  Lines Generated: {line_count}")
    print(f"  Generation Time: {gen_time:.1f}s")
    print(f"  YAML Valid:      {'✅ Yes' if is_valid else '❌ No'}")
    print(f"  Run Attempted:   {'Yes' if run_attempted else 'No'}")
    print(f"  Run Success:     {'✅ Yes' if run_success else '❌ No' if run_attempted else 'N/A'}")
    print(f"  AI Models:       {' → '.join(AI_MODELS[:2])} (FREE)")
    print(f"  Results saved to: {RESULTS_FILE}")
    print("━" * 60)
 