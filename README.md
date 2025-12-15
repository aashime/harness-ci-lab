# Harness CI/CD Lab

A complete CI/CD pipeline implementation using Harness, demonstrating continuous integration and continuous deployment to Amazon EKS with canary deployment strategy.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Harness Platform                                   │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │      CI Pipeline            │    │         CD Pipeline                 │ │
│  │  ┌─────────┐                │    │  ┌──────────────────────────────┐  │ │
│  │  │  Clone  │                │    │  │     Canary Deployment        │  │ │
│  │  └────┬────┘                │    │  │  ┌─────────┐  ┌───────────┐  │  │ │
│  │       ▼                     │    │  │  │ Canary  │→ │  Delete   │  │  │ │
│  │  ┌─────────┐                │    │  │  │ Deploy  │  │  Canary   │  │  │ │
│  │  │  Test   │                │    │  │  └─────────┘  └───────────┘  │  │ │
│  │  └────┬────┘                │    │  └──────────────────────────────┘  │ │
│  │       ▼                     │    │  ┌──────────────────────────────┐  │ │
│  │  ┌─────────┐                │    │  │    Primary Deployment        │  │ │
│  │  │ Build & │────────────────┼────┼─▶│  ┌─────────────────────┐    │  │ │
│  │  │  Push   │                │    │  │  │  Rolling Deploy     │    │  │ │
│  │  └─────────┘                │    │  │  └─────────────────────┘    │  │ │
│  └─────────────────────────────┘    │  └──────────────────────────────┘  │ │
└─────────────────────────────────────────────────────────────────────────────┘
         │                                          │
         ▼                                          ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   DockerHub     │                    │      Amazon EKS         │
│   aashime/      │                    │   ┌───────────────────┐ │
│   harness-ci-lab│                    │   │  harness-ci-lab   │ │
└─────────────────┘                    │   │  (2 replicas)     │ │
                                       │   └───────────────────┘ │
                                       │   ┌───────────────────┐ │
                                       │   │  LoadBalancer     │ │
                                       │   └───────────────────┘ │
                                       └─────────────────────────┘
```

## Project Structure

```
harness-ci-lab/
├── app.js                 # Node.js Express application
├── app.test.js            # Jest unit tests
├── package.json           # Node.js dependencies
├── Dockerfile             # Container build instructions
├── k8s/                   # Kubernetes manifests
│   ├── deployment.yaml    # Deployment with health checks
│   └── service.yaml       # LoadBalancer service
└── harness/               # Harness configuration (as code)
    ├── pipelines/
    │   └── ci-cd-pipeline.yaml
    ├── templates/
    │   └── nodejs-test-template.yaml
    ├── connectors/
    │   ├── github-connector.yaml
    │   ├── dockerhub-connector.yaml
    │   └── k8s-connector.yaml
    ├── environments/
    │   └── dev.yaml
    ├── services/
    │   └── harness-ci-lab-svc.yaml
    └── infrastructure/
        └── eks-cluster.yaml
```

## Lab Completed Tasks

| Task | Description | Status |
|------|-------------|--------|
| 1 | Kubernetes Cluster Setup (EKS) | ✅ |
| 2 | Harness Delegate Installation | ✅ |
| 3 | CI Pipeline (Build, Test, Push) | ✅ |
| 4 | CD Pipeline (Canary Deployment) | ✅ |
| 5 | Bonus: Step Templatization | ✅ |

## CI Pipeline Features

- **Clone Codebase**: Fetches from GitHub
- **Run Tests**: Executes `npm test` with Jest
- **Build & Push**: Builds Docker image and pushes to DockerHub
- **Build Intelligence**: Caching enabled for faster builds

## CD Pipeline Features

- **Canary Deployment**: Deploys to 1 pod first for validation
- **Rolling Deployment**: Full rollout after canary succeeds
- **Automatic Rollback**: Reverts on failure
- **Health Checks**: Liveness and readiness probes configured

## Infrastructure

- **EKS Cluster**: `harness-lab` in `us-east-1`
- **Node Type**: t3.medium (2 nodes)
- **Delegate**: `helm-delegate` running in `harness-delegate-ng` namespace
- **Build Namespace**: `harness-builds`
- **App Namespace**: `default`

## Application Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Welcome message |
| `GET /health` | Health check |
| `GET /api/info` | App information |

## Running Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start application
npm start
```

## Building Docker Image

```bash
docker build -t aashime/harness-ci-lab:latest .
docker run -p 3000:3000 aashime/harness-ci-lab:latest
```

## Harness Connectors

| Connector | Type | Purpose |
|-----------|------|---------|
| `github-connector` | GitHub | Source code repository |
| `dockerhub-connector` | Docker Registry | Container image storage |
| `k8s-connector` | Kubernetes | EKS cluster deployment |

## Template: nodejs-test-template

Reusable step template for running Node.js tests:
- Container: `node:18`
- Commands: `npm install && npm test`
- Can be used across multiple pipelines

## Cleanup

To delete the EKS cluster and avoid AWS charges:

```bash
eksctl delete cluster --name harness-lab --region us-east-1
```

## Author

Ashime - Harness SE Candidate Lab
