---
title: Repositories
description: Overview of all Pelindung Bumi repositories and their purposes.
---

Pelindung Bumi maintains three primary repositories to manage documentation, blog content, and infrastructure.

## Repository Overview

### peta

**Purpose**: Documentation site

**Live site**: [docs.pelindungbumi.dev](https://docs.pelindungbumi.dev)

**GitHub**: [pelindung-bumi/peta](https://github.com/pelindung-bumi/peta)

**Description**:

The `peta` repository is the home for Pelindung Bumi's documentation. Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build), it provides a clean, readable source of truth for:

- Project information
- Operational guides
- References and notes
- Team workflows

**Key Features**:

- Starlight documentation framework for navigation and search
- Automated deployment to GitHub Pages
- Version-controlled documentation
- Easy to maintain and update

**Stack**:

- Framework: Astro
- Docs: Starlight
- Package manager: Bun
- Deployment: GitHub Pages

**Content**:

- Getting Started guide
- Blog Operations guide
- Infrastructure Operations guide
- Project overview and repository references

---

### pelindung-bumi.github.io

**Purpose**: Blog and main website

**Live site**: [pelindungbumi.dev](https://pelindungbumi.dev)

**GitHub**: [pelindung-bumi/pelindung-bumi.github.io](https://github.com/pelindung-bumi/pelindung-bumi.github.io)

**Description**:

The `pelindung-bumi.github.io` repository is the Pelindung Bumi blog—a minimalist technology learning blog where the team writes in public about infrastructure, Kubernetes, cloud, SRE, DevOps, and related engineering topics.

Built with Astro and the Bearnie template, it's designed to be:

- Clean and minimalist
- Fast and readable
- Focused on practical content over marketing language

**Key Features**:

- MDX for rich blog posts with code examples
- Automatic RSS feed generation
- Sitemap generation for SEO
- Open Graph images for social sharing
- Git-based writer metadata (tracks who wrote and modified posts)

**Stack**:

- Framework: Astro
- Template: Bearnie
- Package manager: Bun
- Styling: Tailwind CSS
- Deployment: GitHub Pages

**Content**:

- Posts on Kubernetes, deployment, infrastructure
- Articles on cloud, SRE, and DevOps
- Tutorials and how-to guides
- Technical explanations and learnings

---

### semesta

**Purpose**: Declarative infrastructure management

**GitHub**: [pelindung-bumi/semesta](https://github.com/pelindung-bumi/semesta)

**Description**:

The `semesta` repository manages Pelindung Bumi's infrastructure declaratively using NixOS. It contains the configurations for all machines and services in a reproducible, maintainable way.

Semesta uses powerful NixOS tooling:

- **nixos-anywhere**: For first-time server installations
- **colmena**: For day-2 deployments to existing hosts
- **disko**: For declarative disk and filesystem management

**Key Features**:

- Declarative infrastructure as code
- Reproducible deployments
- Version-controlled system configs
- Easy rollbacks if things break
- Shared NixOS modules for reusable logic

**Stack**:

- OS: NixOS
- Language: Nix (flake-based)
- Deployment: colmena
- Install: nixos-anywhere
- Disk management: disko

**Infrastructure**:

Current managed hosts:

- **vpn**: NetBird control plane + VPN peer/router
- **lb01**: Simple load balancer for Kubernetes API
- **kube01**: Single-node Kubernetes cluster (k3s)

**Services**:

- NetBird (self-hosted control plane and peer)
- k3s (Kubernetes distribution)
- nginx (reverse proxy and load balancing)

---

## Live Sites

All three repositories publish live sites:

- **Documentation**: [docs.pelindungbumi.dev](https://docs.pelindungbumi.dev)
- **Blog**: [pelindungbumi.dev](https://pelindungbumi.dev)
- **Infrastructure**: No live site (infrastructure as code only)

## Quick Links

### Documentation

- [Getting Started](/guides/getting-started)
- [Blog Operations](/operations/blog)
- [Infrastructure Operations](/operations/infrastructure)
- [Project Overview](/reference/project-overview)

### GitHub Repositories

- [pelindung-bumi/peta](https://github.com/pelindung-bumi/peta) - Documentation
- [pelindung-bumi/pelindung-bumi.github.io](https://github.com/pelindung-bumi/pelindung-bumi.github.io) - Blog
- [pelindung-bumi/semesta](https://github.com/pelindung-bumi/semesta) - Infrastructure

### Live Sites

- [docs.pelindungbumi.dev](https://docs.pelindungbumi.dev) - Documentation site
- [pelindungbumi.dev](https://pelindungbumi.dev) - Blog

## Deployment

All three repositories deploy to GitHub Pages:

- **Trigger**: Push to `main` branch
- **Tooling**: Astro Actions for `peta` and `pelindung-bumi.github.io`
- **Domain**: CNAME files configured in each repo

## Contributing

Each repository has its own `AGENTS.md` file with:

- Purpose and scope
- Stack and tooling preferences
- Design and content rules
- Workflow guidelines
- Commands reference

Refer to the `AGENTS.md` in each repository for specific contribution guidelines.

## Organization

All repositories belong to the Pelindung Bumi GitHub organization: [pelindung-bumi](https://github.com/pelindung-bumi)

The organization includes Rivaldo, Leo, and Rolando who work together on infrastructure, Kubernetes, cloud, and SRE topics—and write down anything worth remembering.
