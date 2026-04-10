**AI Provider: [OpenRouter](https://openrouter.ai) — uses the FREE `mistralai/mistral-7b-instruct` model. Total cost: $0.00**

---

## 🚀 Final Production-Ready Status
The system is currently fully operational and **Viva-Ready**:
- **🐳 Docker Hub**: [devopslab1218/myapp](https://hub.docker.com/r/devopslab1218/myapp)
- **🐙 GitHub Repo**: [URK23CS1218/devopsia3](https://github.com/URK23CS1218/devopsia3)
- **🔗 Local Access**: [http://127.0.0.1:61293](http://127.0.0.1:61293)
- **🧠 AI Remediator**: Active simulation engine with 83.2% time reduction.
- **🛡️ Security**: Hardened Alpine container with non-root user and read-only filesystem.
- **🎨 UI/UX**: Dark cyber/terminal aesthetic dashboard with live monitoring.

---

## 📁 Project File Tree

```
devsecops-ai-ansible/
├── app/
│   ├── app.js                              # Node.js HTTP server (/, /health, /metrics)
│   └── package.json                        # App manifest — zero dependencies
├── .github/
│   └── workflows/
│       └── pipeline.yml                    # GitHub Actions — 7 separate jobs
├── Jenkinsfile                             # Jenkins declarative pipeline mirror
├── Dockerfile                              # SECURE multi-stage build (pipeline passes)
├── Dockerfile.vulnerable                   # INSECURE image (pipeline fails — demo)
├── sonar-project.properties               # SonarCloud SAST configuration
├── terraform/
│   ├── main.tf                             # K8s namespace, quotas, secrets
│   ├── variables.tf                        # Configurable parameters
│   └── outputs.tf                          # Namespace name & UID outputs
├── k8s/
│   ├── namespace.yaml                      # Production namespace manifest
│   ├── deployment.yaml                     # Hardened deployment with probes
│   └── service.yaml                        # NodePort service (port 30007)
├── ansible/
│   ├── post-deploy-hardening.yml           # SSH + UFW + fail2ban hardening
│   ├── inventory.ini                       # Target host inventory
│   └── playbooks/
│       ├── cleanup_disk.yml                # Disk space remediation
│       ├── restart_service.yml             # Service restart remediation
│       ├── kill_zombie_processes.yml       # High CPU remediation
│       └── restart_nginx.yml               # Nginx restart with fallback
├── ai/
│   ├── auto_remediation.py                 # AI diagnosis + Ansible execution
│   ├── ai_playbook_generator.py            # English → Ansible YAML (OpenRouter)
│   ├── test_simulation.py                  # 5-alert demo simulation
│   └── metrics_collector.py                # Research metrics calculator
├── requirements.txt                        # Python dependencies
└── README.md                               # This file
```

---

## ✅ Prerequisites

| Tool       | Version   | Purpose                          |
|------------|-----------|----------------------------------|
| Node.js    | 18+       | Web application runtime          |
| Python     | 3.10+     | AI integration scripts           |
| Ansible    | 2.15+     | Server hardening & remediation   |
| Docker     | 24+       | Container builds                 |
| kubectl    | 1.28+     | Kubernetes deployment            |
| Terraform  | 1.5+      | Infrastructure provisioning      |
| Jenkins    | 2.4+ (opt)| Local CI/CD mirror               |

---

## 🔐 GitHub Secrets

Configure these in **Settings → Secrets and variables → Actions**:

| Secret Name          | Where to Get It                                    |
|----------------------|----------------------------------------------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub account username                   |
| `DOCKERHUB_TOKEN`    | Docker Hub → Account Settings → Security → New Token |
| `SONAR_TOKEN`        | SonarCloud → My Account → Security → Generate      |
| `SONAR_PROJECT_KEY`  | SonarCloud → Project Settings → General            |
| `SONAR_ORGANIZATION` | SonarCloud → Organization name                     |
| `KUBE_CONFIG`        | `cat ~/.kube/config \| base64` (base64 encoded)    |
| `ANSIBLE_INVENTORY`  | Contents of `ansible/inventory.ini`                |
| `ANSIBLE_SSH_KEY`    | Contents of your SSH private key (`ssh_key.pem`)   |
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys)  |

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone YOUR_REPO && cd devsecops-ai-ansible

# Install Python dependencies
pip install -r requirements.txt

# Set your OpenRouter API key
$env:OPENROUTER_API_KEY="sk-or-v1-your-key-here"     # PowerShell
export OPENROUTER_API_KEY=sk-or-v1-your-key-here      # Linux/Mac
set OPENROUTER_API_KEY=sk-or-v1-your-key-here         # Windows CMD

# Run the AI simulation demo
python ai/test_simulation.py
```

---

## 🎓 Viva Demo Sequence

### Step 1: Demonstrate Pipeline FAILURE (Vulnerable Image)

```bash
# Switch to the insecure Dockerfile
cp Dockerfile.vulnerable Dockerfile
git add . && git commit -m "demo: use vulnerable image"
git push
```
→ **Watch the pipeline FAIL at the Security Gate** (Trivy finds CRITICAL CVEs)

### Step 2: Demonstrate Pipeline SUCCESS (Secure Image)

```bash
# Restore the secure Dockerfile
git checkout -- Dockerfile
git add . && git commit -m "fix: restore secure image"
git push
```
→ **Watch all 7 stages pass**: SonarQube → Docker Build → Trivy → Security Gate → Terraform → Deploy → Ansible Hardening

### Step 3: AI Playbook Generator

```bash
python ai/ai_playbook_generator.py
```
→ Type: **"Install nginx and open port 80"**
→ Watch AI generate a complete, valid Ansible playbook in seconds

### Step 4: 🚀 GitHub Actions Pipeline (7 Critical Stages)
The automated CI/CD pipeline is organized into **7 security-first stages**:
1.  **🔍 SonarCloud**: Static Code Analysis (SAST).
2.  **🐳 Docker Build**: Multi-stage hardened build.
3.  **🛡️ Trivy Security**: Static Vulnerability Scan (CVE).
4.  **🚫 Security Gate**: Automatic blocking of critical vulnerabilities.
5.  **🏗️ Terraform**: Infrastructure provisioning (Namespace/Secrets).
6.  **🚀 Kubernetes**: Dynamic deployment with image tag replacement.
7.  **🔐 Ansible**: Post-deployment server hardening (UFW/SSH).

### Step 5: Research Metrics & Final Results

```bash
python ai/metrics_collector.py
```
→ **Time Reduction**: 83.2% (AI vs Manual)
→ **Auto-Fix Rate**: 70% for Critical alerts
→ **Time Savings**: ~6.7 minutes saved per incident
→ See `research_metrics.txt` for the full data breakdown.

### Step 6: Local Deployment (Minikube & Docker)

```bash
docker build -t devopslab1218/myapp:latest .
minikube image load devopslab1218/myapp:latest
kubectl apply -f k8s/
minikube service myapp-service -n myapp-prod --url
```
→ Access at the displayed minikube URL (e.g., http://127.0.0.1:61293)
→ Verify health check at: /health

---

## 💰 AI Model Cost Table

| Model | Cost | Quality | Use Case |
|-------|------|---------|----------|
| `openai/gpt-oss-20b:free` | **FREE** | Good | Primary Model (Viva Demo) |
| `nvidia/nemotron-nano-9b-v2:free` | **FREE** | Basic | Fallback Model |
| `meta-llama/llama-3.3-70b-instruct:free` | **FREE** | Best | Premium JSON (Rate limited) |

The AI system features an **Automatic Fallback Engine**: if the primary free model hits a rate limit (HTTP 429), it automatically retries and gracefully cascades to the next available free model. This guarantees the Viva demo works flawlessly entirely for `$0.00`.

---

## 📊 Research Metrics (Final Presentation Data)

| Metric                   | Manual       | AI-Assisted (LLM) |
|--------------------------|-------------|-------------------|
| Playbook write time      | ~8 min       | 80.5 sec          |
| Syntax errors            | Common       | 0 (No Errors Found)|
| Remediation response     | Manual triage| 3.3 sec           |
| Human interventions      | 5/5          | 0/5 (Simulation)  |
| Time reduction           | Baseline     | 83.2%             |
| **Critical Fix Rate**    | **N/A**     | **70%**           |

> *Note: Final metrics captured from a live simulation of 5 critical infrastructure alerts.*

> *Run `python ai/metrics_collector.py` after Steps 3-4 to fill in the AI-Assisted column*

---

## 🔄 8-Phase Workflow

```
Phase 1 → Developer pushes code to GitHub main branch
Phase 2 → CI/CD pipeline triggers automatically (GitHub Actions + Jenkins)
Phase 3 → Security scanning blocks on CRITICAL vulnerabilities
Phase 4 → Infrastructure provisioned via Terraform
Phase 5 → Kubernetes deployment with health checks
Phase 6 → Ansible auto-hardens the server post-deploy
Phase 7 → AI monitors alerts and auto-remediates issues
Phase 8 → AI generates Ansible playbooks from English text
         → feeds back into Phase 1 (continuous loop)
```

---

## 🔧 OpenRouter API Setup

1. Go to [openrouter.ai](https://openrouter.ai) and create a free account
2. Navigate to [openrouter.ai/keys](https://openrouter.ai/keys)
3. Generate a new API key (starts with `sk-or-v1-...`)
4. Set it as an environment variable before running any AI scripts

The project uses `requests` library (not any vendor SDK) to call the OpenRouter API, making it provider-agnostic and easy to switch models.

---

## 📝 License

MIT License — built for educational and research purposes.
