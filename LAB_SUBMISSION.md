# Harness Enterprise Sales Engineer Lab Submission

**Candidate:** Ashime
**Date:** December 15, 2025
**Harness Account:** ashimeashime36

---

## Executive Summary

This lab demonstrates a complete CI/CD implementation using the Harness platform, showcasing:

- **Continuous Integration**: Automated build, test, and container image publishing
- **Continuous Delivery**: Kubernetes deployment with canary release strategy
- **Enterprise Features**: Templatization, connectors, and infrastructure-as-code

**Key Outcome:** A fully automated pipeline that takes code from GitHub, runs tests, builds a Docker image, and deploys to Amazon EKS using a canary deployment strategy - all with built-in rollback capabilities.

---

## Architecture Overview
![Architecture Diagram](./screenshots/Blank%20diagram.png)

---

## Lab Tasks Completed

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Kubernetes Cluster Setup | ✅ Complete | EKS cluster `harness-lab` in us-east-1 |
| 2 | Harness Delegate Install | ✅ Complete | `helm-delegate` running in cluster |
| 3 | CI Pipeline (Build, Test, Push) | ✅ Complete | Pipeline `ci-pipeline` |
| 4 | CD Pipeline (Canary Deployment) | ✅ Complete | Canary + Rolling strategy |
| 5 | **Bonus:** Template Creation | ✅ Complete | `nodejs-test-template` |

---

## Infrastructure Details

### Amazon EKS Cluster

| Property | Value |
|----------|-------|
| Cluster Name | `harness-lab` |
| Region | `us-east-1` |
| Kubernetes Version | 1.32 |
| Node Group | `lab-nodes` |
| Node Type | t3.medium |
| Node Count | 2 |
| Namespaces Created | `harness-delegate-ng`, `harness-builds`, `default` |

### Harness Delegate

| Property | Value |
|----------|-------|
| Name | `helm-delegate` |
| Type | Kubernetes (Helm) |
| Namespace | `harness-delegate-ng` |
| Status | Connected |
| Purpose | Executes pipeline tasks within the cluster |

**Why Delegate Matters:**
The delegate model is a key Harness differentiator. It runs inside the customer's infrastructure, making only outbound connections. This means:
- No firewall ports need to be opened
- Credentials stay within the customer's network
- Secure execution without exposing infrastructure

---

## Connectors Configured

| Connector | Type | Purpose | Connection Method |
|-----------|------|---------|-------------------|
| `github-connector` | GitHub | Source code repository | Harness Platform (via token) |
| `dockerhub-connector` | Docker Registry | Container image storage | Harness Platform (via token) |
| `k8s-connector` | Kubernetes | EKS deployment target | Via Delegate |

**Value of Connectors:**
Connectors are configured once and reused across all pipelines. This eliminates credential sprawl and provides centralized management with continuous health validation.

### Connectors Screenshot
![Connectors](screenshots/connectors.png)

---

## CI/CD Pipeline

### Pipeline: `ci-pipeline`

The pipeline consists of two stages:
1. **build-and-push** (CI Stage) - Builds, tests, and pushes Docker image
2. **deploy-to-k8s** (CD Stage) - Deploys to EKS with canary strategy

### Pipeline Visual View
![Pipeline Visual](screenshots/pipeline-visual.png)

### CI Stage Steps

| Step | Type | Description |
|------|------|-------------|
| Clone Codebase | Built-in | Clones from GitHub `aashime/harness-ci-lab` |
| Run_Tests | Run | Executes `npm install && npm test` in Node 18 container |
| Build_and_Push | BuildAndPushDockerRegistry | Builds Dockerfile, pushes to DockerHub |

**Features Enabled:**
- ✅ Build Intelligence (caching)
- ✅ Clone Codebase
- ✅ Kubernetes build infrastructure

**Image Tags:**
- `aashime/harness-ci-lab:latest`
- `aashime/harness-ci-lab:<pipeline-sequence-id>` (for traceability)

---

## CD Pipeline - Canary Deployment

### Stage: `deploy-to-k8s`

**Deployment Type:** Kubernetes
**Strategy:** Canary

**Execution Flow:**

```
┌─────────────────────────────────────────────────────────┐
│                    CANARY PHASE                         │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │ K8sCanaryDeploy │ ───▶ │ K8sCanaryDelete │          │
│  │ (1 pod)         │      │                 │          │
│  └─────────────────┘      └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   PRIMARY PHASE                         │
│  ┌─────────────────┐                                   │
│  │ K8sRollingDeploy│                                   │
│  │ (all pods)      │                                   │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              ROLLBACK (On Failure)                      │
│  ┌─────────────────┐      ┌─────────────────┐          │
│  │ K8sCanaryDelete │ ───▶ │K8sRollingRollback│         │
│  └─────────────────┘      └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Why Canary Deployment:**
- Reduces blast radius - only 1 pod receives traffic initially
- Allows validation before full rollout
- Automatic rollback if health checks fail
- Industry best practice used by Netflix, Google, Amazon

### Service & Environment

| Component | Name | Details |
|-----------|------|---------|
| Service | `harness-ci-lab-svc` | References K8s manifests in `k8s/` folder |
| Environment | `dev` | Pre-Production environment |
| Infrastructure | `eks-cluster` | Deploys to `default` namespace |

---

## Pipeline Execution Success

The screenshot below shows successful execution of both CI and CD stages:

![Pipeline Executions](screenshots/pipeline-executions.png)

**Execution Details:**
- 2 successful pipeline runs
- CI stage: `build-and-push` completed
- CD stage: `deploy-to-k8s` deployed to `dev (eks-cluster)`
- Service: `harness-ci-lab-svc`

---

## Kubernetes Manifests

### Deployment (`k8s/deployment.yaml`)
- 2 replicas for high availability
- Resource limits (CPU: 200m, Memory: 128Mi)
- Liveness probe: `/health` endpoint
- Readiness probe: `/health` endpoint

### Service (`k8s/service.yaml`)
- Type: LoadBalancer
- Exposes port 80, routes to container port 3000

---

## Template (Bonus)

### Template: `nodejs-test-template`

**Type:** Step Template
**Version:** v1

**Configuration:**
```yaml
template:
  name: nodejs-test-template
  type: Step
  spec:
    type: Run
    spec:
      connectorRef: dockerhubconnector
      image: node:18
      shell: Sh
      command: |-
        npm install
        npm test
```

**Value Proposition:**
- **Reusability:** Any pipeline can use this template with one click
- **Standardization:** Enforces consistent testing practices
- **Maintainability:** Update once, applies everywhere
- **Governance:** Platform team can mandate approved templates

---

## Live Application

### URLs

| Endpoint | URL |
|----------|-----|
| Main | http://af8ff179d9b434e3896b72ce0a902e3d-613870465.us-east-1.elb.amazonaws.com/ |
| Health | http://af8ff179d9b434e3896b72ce0a902e3d-613870465.us-east-1.elb.amazonaws.com/health |
| API Info | http://af8ff179d9b434e3896b72ce0a902e3d-613870465.us-east-1.elb.amazonaws.com/api/info |

### Live Application Response

![Live App Response](screenshots/live-app-response.png)

**Sample Responses:**

**GET /**
```json
{"message":"Welcome to Harness CI Lab!"}
```

**GET /health**
```json
{"status":"healthy","timestamp":"2025-12-15T23:09:33.626Z"}
```

---

## Resource Links

| Resource | URL |
|----------|-----|
| GitHub Repository | https://github.com/aashime/harness-ci-lab |
| DockerHub Image | https://hub.docker.com/r/aashime/harness-ci-lab |
| Live Application | http://af8ff179d9b434e3896b72ce0a902e3d-613870465.us-east-1.elb.amazonaws.com |
| Harness Account | https://app.harness.io (Account: ashimeashime36) |

---

## Key Learnings & Observations

### 1. Unified Platform Value
Harness consolidates CI and CD into a single platform, eliminating the need to integrate multiple tools (Jenkins + ArgoCD + scripts). This reduces operational overhead and provides a consistent experience.

### 2. Delegate Security Model
The delegate architecture is a significant differentiator. By running within the customer's infrastructure and making only outbound connections, it addresses enterprise security concerns without sacrificing functionality.

### 3. Deployment Strategies Made Easy
Implementing canary deployments traditionally requires significant custom scripting. Harness provides this out-of-the-box with a few clicks, democratizing advanced deployment patterns.

### 4. Template-Driven Governance
Templates enable platform teams to define standards that development teams can consume. This balances developer autonomy with organizational governance.

### 5. Visual + YAML Flexibility
The dual-mode editor (visual and YAML) caters to different user preferences. Teams can use the visual builder for simplicity or YAML for version control and automation.

---

## Challenges Encountered & Solutions

| Challenge | Solution |
|-----------|----------|
| GitHub branch dropdown not populating | Manually typed `main` in the branch field |
| Docker v2 registry warning in Kaniko | Harness automatically fell back to v1 registry |
| Delegate initial connection delay | Waited for heartbeat to establish (~2 min) |

---

## Conclusion

This lab demonstrates Harness's capability to deliver enterprise-grade CI/CD with:

- **Speed:** From code to production in minutes
- **Safety:** Canary deployments with automatic rollback
- **Scale:** Templates and connectors for enterprise adoption
- **Security:** Delegate model keeps credentials secure

The platform's unified approach, combined with its advanced deployment strategies and governance features, positions it as a compelling solution for organizations looking to modernize their software delivery practices.

---

## Appendix: Pipeline YAML

Full pipeline configuration available at:
https://github.com/aashime/harness-ci-lab/blob/main/harness/pipelines/ci-cd-pipeline.yaml

---

*Submission prepared by Ashime | December 15, 2025*
