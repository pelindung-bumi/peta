---
title: Infrastructure Operations
description: "Guide to managing NixOS infrastructure with Semesta: hosts, services, and deployments."
---

This guide covers how to operate and maintain Pelindung Bumi's NixOS infrastructure managed declaratively in the [semesta](https://github.com/pelindung-bumi/semesta) repository.

## Repository Overview

Semesta manages infrastructure declaratively with NixOS. The repository contains configurations for all machines and services.

### GitHub Repository

[semesta](https://github.com/pelindung-bumi/semesta)

### Toolchain

Semesta uses three primary tools:

- **nixos-anywhere**: For first-time server installations
- **colmena**: For day-2 deployments to existing hosts
- **disko**: For declarative disk and filesystem management

### Repository Layout

```text
semesta/
├── flake.nix              # Nix flake: hosts, dev shells, colmena config
├── modules/
│   └── nixos/            # Reusable NixOS modules (shared logic)
├── hosts/                # Individual host configurations
│   ├── lb01/            # Load balancer
│   ├── kube01/          # Kubernetes cluster
│   └── vpn/             # NetBird control plane
└── scripts/             # Utility scripts
```

### Why Use Nix?

- **Declarative**: Describe what you want, not how to achieve it
- **Reproducible**: Same config → same system
- **Rollbacks**: Safely revert changes if things break
- **Versioned**: All config is Git-tracked

## Getting Started

### Prerequisites

On your local machine, you need:

1. **Nix package manager**: Install from [nixos.org](https://nixos.org/download.html)
2. **SSH access**: To all managed hosts (for deploying)
3. **Git**: For cloning the repository

### Clone and Enter Dev Shell

```bash
# Clone the repository
git clone https://github.com/pelindung-bumi/semesta.git
cd semesta

# Enter the Nix dev shell (includes colmena, nixos-anywhere, etc.)
nix develop
```

The dev shell includes:
- `colmena`: Deployment tool
- `nixos-anywhere`: OS install tool
- `nixos-rebuild`: Server-side rebuilding
- `git`: Version control
- `ssh`: Remote access

### Repository Structure

- **`flame.nix`**: Central configuration file
  - Declares all hosts
  - Defines the Nix channel (stable 25.11)
  - Sets up Colmena deployment targets

- **`modules/nixos/`**: Shared NixOS logic
  - `common.nix`: Base settings for all hosts
  - `cloud-host.nix`: Cloud-specific configuration
  - `managed-ssh.nix`: SSH hardening
  - `netbird-selfhosted.nix`: NetBird control plane module
  - And more...

- **`hosts/<name>`**: Host-specific files
  - `configuration.nix`: Main config (imports modules, sets services)
  - `disko.nix`: Disk layout and filesystems
  - `hardware-configuration.nix`: Detected from hardware (generated on install)
  - Service-specific configs: `k3s.nix`, `netbird.nix`, etc.

## Host Profiles

Semesta currently manages three hosts:

### vpn

**Role**: NetBird control plane + VPN peer/router

**Endpoints**:
- Private: `10.200.2.108`
- Public: `103.125.103.148`
- SSH Port: `22222`

**Purpose**:
- Run self-hosted NetBird control plane
- Act as a NetBird peer
- Route traffic to the private subnet (`10.200.0.0/16`)

**Flake target**: `.#vpn`

**Service**: `nginx` + `netbird-server` + `netbird-dashboard` + `netbird` (peer)

### lb01

**Role**: Simple load balancer for Kubernetes API

**Endpoints**:
- Private: `10.200.1.93`
- Public: `103.125.102.156`
- SSH Port: `22`

**Purpose**:
- TCP proxy for Kubernetes API traffic
- Client → lb01:6443 → kube01:6443

**Flake target**: `.#lb01`

**Service**: `nginx` (stream module)

### kube01

**Role**: Single-node Kubernetes cluster

**Endpoints**:
- Private: `10.200.0.177`
- Public: `103.125.103.90`
- SSH Port: `22`

**Purpose**:
- Run k3s (single-node cluster)
- Host Kubernetes workloads
- Reserved second disk for future Ceph/Rook storage

**Flake target**: `.#kube01`

**Service**: `k3s`

## SSH Aliases

Configure SSH aliases in `~/.ssh/config` for easier access:

```text
Host semesta-vpn
  HostName 103.125.103.148
  User root
  Port 22222
  IdentityFile ~/.ssh/your-key
  IdentitiesOnly yes

Host semesta-lb01
  HostName 10.200.1.93
  User root
  Port 22
  IdentityFile ~/.ssh/your-key
  IdentitiesOnly yes

Host semesta-kube01
  HostName 10.200.0.177
  User root
  Port 22
  IdentityFile ~/.ssh/your-key
  IdentitiesOnly yes
```

Replace `~/.ssh/your-key` with your actual private key path.

## First Installation (nixos-anywhere)

Use `nixos-anywhere` to install NixOS on a fresh server.

### Prerequisites

- Server is running a supported OS (Ubuntu, Debian, Fedora, etc.)
- SSH access with `root` user
- Private key for authentication
- Target disk to format

### Install Command Template

```bash
nix run nixpkgs#nixos-anywhere -- \
  --copy-host-keys \
  --generate-hardware-config nixos-generate-config ./hosts/<host>/hardware-configuration.nix \
  --flake .#<host> \
  --target-host root@<server-ip> \
  -i /path/to/private-key \
  -p 22
```

### Example: Install lb01

```bash
nix run nixpkgs#nixos-anywhere -- \
  --copy-host-keys \
  --generate-hardware-config nixos-generate-config ./hosts/lb01/hardware-configuration.nix \
  --flake .#lb01 \
  --target-host root@10.200.1.93 \
  -p 22
```

### What Happens During Install

1. `nixos-anywhere` connects via SSH
2. It generates `hardware-configuration.nix` based on detected hardware
3. `disko.nix` defines and formats the filesystem
4. NixOS is installed with the configuration from `.#<host>`
5. The system reboots into the new NixOS install

### Important Notes

- **`disko.nix`** owns the filesystem layout
- **`hardware-configuration.nix`** is generated; don't edit manually after first install
- After install, the host is ready for day-2 operations

### Checklist for New Hosts

Before running `nixos-anywhere`:

1. [ ] Create `hosts/<name>/configuration.nix`
2. [ ] Create `hosts/<name>/disko.nix`
3. [ ] Add host to `flake.nix` in the `hosts` section
4. [ ] Update SSH alias in `~/.ssh/config`
5. [ ] Test SSH access to the server
6. [ ] Know which disk to format (e.g., `/dev/vda`)

## Day-2 Deployment (colmena)

After a host is installed, use `colmena` for updates and changes.

### Preferred Method: Colmena

```bash
# From the dev shell
nix run github:zhaofengli/colmena -- apply --build-on-target --on <host>
```

This:

1. Syncs the configuration to the host
2. Builds the new config on the target host
3. Switches to the new system
4. Keeps the old generation available for rollback

### Example Deployment

```bash
# Deploy to vpn
nix run github:zhaofengli/colmena -- apply --build-on-target --on vpn

# Deploy to lb01
nix run github:zhaofengli/colmena -- apply --build-on-target --on lb01

# Deploy to kube01
nix run github:zhaofengli/colmena -- apply --build-on-target --on kube01
```

### Fallback: Server-Side Rebuild

If `colmena` fails (common on macOS or with local Nix issues):

```bash
# Sync manually
rsync -az --delete ./ root@semesta-vpn:/root/semesta/

# SSH in
ssh root@semesta-vpn

# Rebuild on the server
cd /root/semesta
sudo nixos-rebuild switch --flake .#vpn
```

### Validating Before Deployment

Always validate locally first:

```bash
# Build the target system to check for errors
nix build .#nixosConfigurations.vpn.config.system.build.toplevel

# If that succeeds, deploy with colmena
nix run github:zhaofengli/colmena -- apply --build-on-target --on vpn
```

## Adding a New Host

Use this checklist when adding a new host to Semesta:

### 1. Create Host Directory

```bash
mkdir -p hosts/new-host
```

### 2. Create configuration.nix

```bash
# Minimal example
cat > hosts/new-host/configuration.nix << 'EOF'
{ config, modulesPath, lib, pkgs, ... }:
{
  imports = [
    ./disko.nix
    ./hardware-configuration.nix
    "${modulesPath}/virtualisation/proxmox-lxc.nix"  # or other base module
    ../modules/nixos/common.nix
    ../modules/nixos/managed-ssh.nix
    # Add other modules as needed
  ];

  # Host-specific configuration
  networking.hostName = "new-host";

  # Add services
  services.nginx.enable = true;
}
EOF
```

### 3. Create disko.nix

Define the disk layout. Example for a VM:

```nix
{ config, lib, pkgs, modulesPath, ... }:
{
  disko.devices disk = {
    vda = {
      type = "disk";
      device = "/dev/vda";
      content = {
        type = "gpt";
        partitions = {
          boot = {
            size = "1M";
            type = "EF02";  # BIOS boot partition
          };
          ESP = {
            size = "512M";
            type = "EF00";  # EFI System Partition
            content = {
              type = "filesystem";
              format = "vfat";
              mountpoint = "/boot";
            };
          };
          root = {
            size = "100%";
            content = {
              type = "filesystem";
              format = "ext4";
              mountpoint = "/";
            };
          };
        };
      };
    };
  };
}
```

### 4. Add to flake.nix

```nix
hosts.new-host = {
  system = "x86_64-linux";
  modules = [
    disko.nixosModules.disko
    ./hosts/new-host/configuration.nix
  ];
  deployment = {
    targetHost = "10.200.1.100";  # IP or SSH alias
    targetPort = 22;
    targetUser = "root";
    tags = [ "new-host" "web" ];
  };
};
```

### 5. Create SSH Alias

Add to `~/.ssh/config`:

```text
Host semesta-new-host
  HostName 10.200.1.100
  User root
  Port 22
  IdentityFile ~/.ssh/your-key
  IdentitiesOnly yes
```

### 6. Install with nixos-anywhere

Run the install command:

```bash
nix run nixpkgs#nixos-anywhere -- \
  --copy-host-keys \
  --generate-hardware-config nixos-generate-config ./hosts/new-host/hardware-configuration.nix \
  --flake .#new-host \
  --target-host root@10.200.1.100 \
  -p 22
```

### 7. Document the Host

Add details to this guide in the "Host Profiles" section and README.md.

## Service Guides

### NetBird on vpn

NetBird is self-hosted on `vpn` and serves two roles:

1. **Control plane**: Dashboard, management API, signal/relay, STUN
2. **Peer/Router**: `vpn` itself joins the mesh and routes to private subnet

#### Configuration

Located in `hosts/vpn/netbird.nix` and module `modules/nixos/netbird-selfhosted.nix`.

Key settings:
- Domain: `netbird.pelindungbumi.dev`
- TLS via ACME (Let's Encrypt)
- Managed with `nginx` reverse proxy

#### Bootstrap Flow

1. **Create admin account**:
   - Go to `https://netbird.pelindungbumi.dev/setup`
   - Create first admin user

2. **Create setup key**:
   - In NetBird dashboard, generate a setup key

3. **Join the vpn host**:
   ```bash
   ssh root@semesta-vpn
   sudo netbird up --management-url https://netbird.pelindungbumi.dev --setup-key <SETUP_KEY> --hostname vpn
   ```

4. **Join a client** (e.g., laptop):
   ```bash
   netbird up --management-url https://netbird.pelindungbumi.dev
   ```

5. **Configure subnet routing**:
   - In NetBird dashboard:
     - Add route: `10.200.0.0/16` via peer `vpn`
     - Enable masquerade on the route
     - Allow access for the client peer/group

#### Peer Access vs Subnet Access

**Peer access**: Reach a NetBird peer by its NetBird IP
- Example: `ping vpn.netbird.selfhosted`

**Subnet access**: Reach machines behind a routing peer
- Example: `ping 10.200.0.177` (kube01 private IP)

If subnet access fails, check:
1. The routing peer (`vpn`) is connected
2. The route is attached to the correct peer
3. Masquerade is enabled on the route
4. The client is allowed by policy/group
5. The target device allows the traffic

#### Common Commands

**Check services on vpn**:
```bash
ssh root@semesta-vpn 'systemctl status nginx netbird-server netbird-dashboard netbird'
```

**Check NetBird peer status**:
```bash
ssh root@semesta-vpn 'sudo netbird status -d'
```

**Update NetBird**:
```bash
# Update the image version in modules/nixos/netbird-selfhosted.nix
# Deploy with colmena
nix run github:zhaofengli/colmena -- apply --build-on-target --on vpn
```

#### Troubleshooting

**Cannot access dashboard**:
- Check `nginx` status: `systemctl status nginx`
- Verify ACME certificate: `ls -la /var/lib/acme/netbird.pelindungbumi.dev/`

**Route not working**:
- Verify the route in dashboard
- Check masquerade is enabled
- Verify `vpn` can reach the private subnet
- Check firewall allows NetBird traffic

**Peer not connecting**:
- Verify the setup key is correct
- Check `systemctl status netbird` on the peer
- Verify the management URL is correct

### k3s on kube01

Kubernetes runs as a single-node cluster on `kube01` using k3s.

#### Configuration

Located in `hosts/kube01/k3s.nix`.

Key settings:
- Role: `server` (single node)
- Disabled: Traefik, servicelb (to avoid conflict with future load balancers)
- API TLS SANs: Includes multiple IPs and DNS name

#### API Endpoints

Kubernetes API is configured with multiple SANs for flexibility:

```
10.200.0.177    (kube01 private IP)
10.200.1.93     (lb01 private IP)
103.125.102.156 (lb01 public IP)
kubeapi.pelindungbumi.dev:6443
```

You can access kube API from any of these.

#### Accessing the Cluster

**From a client machine**:

```bash
# Copy kubeconfig from kube01
ssh root@semesta-kube01 'cat /etc/rancher/k3s/k3s.yaml' > kubeconfig

# Edit kubeconfig to point to lb01 or public IP
sed -i 's/127.0.0.1:6443/kubernetes-api.pelindungbumi.dev:6443/' kubeconfig

# Use kubectl
export KUBECONFIG=$(pwd)/kubeconfig
kubectl get nodes
```

**Common kubectl commands**:

```bash
kubectl get nodes
kubectl get pods -A
kubectl get services
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

#### Storage Planning

`kube01` has two disks:
- `vda`: OS disk managed by disko
- `vdb`: Reserved for future Ceph/Rook storage

Do **not** use `vdb` currently. It will be used for a future Ceph cluster.

#### Common Operations

**Restart k3s**:
```bash
ssh root@semesta-kube01 'systemctl restart k3s'
```

**Check k3s status**:
```bash
ssh root@semesta-kube01 'systemctl status k3s'
```

**Update k3s version**:
```bash
# Edit hosts/kube01/k3s.nix to change the k3s.version or services.k3s.package
# Deploy with colmena
nix run github:zhaofengli/colmena -- apply --build-on-target --on kube01
```

#### Troubleshooting

**Cannot access kube API**:
- Check if k3s is running: `systemctl status k3s`
- Verify firewall allows port 6443
- Try direct IP: `https://10.200.0.177:6443`
- Check certificate SANs in k3s.nix

**Pods not starting**:
- Check pod status: `kubectl describe pod <name>`
- Check node resources: `kubectl describe node kube01`
- Check k3s logs: `journalctl -u k3s -f`

**lb01 can't reach kube API**:
- Verify lb01 can ping 10.200.0.177:6443
- Check firewall on both hosts
- Verify nginx on lb01 is running

### nginx on lb01

`lb01` is a simple TCP proxy for Kubernetes API traffic.

#### Configuration

Located in `hosts/lb01/nginx-lb.nix`.

Uses `streamConfig` for TCP proxying:

```nix
services.nginx = {
  enable = true;
  streamConfig = ''
    upstream kubeapi {
      server 10.200.0.177:6443;
    }

    server {
      listen 6443;
      proxy_pass kubeapi;
    }
  '';
};
```

#### Purpose

Simple, minimal proxy to:
- Provide a stable public endpoint for kube API
- Allow changing backend without updating all clients
- Simplify firewall rules (only lb01 needs public port 6443)

#### Common Operations

**Check nginx status**:
```bash
ssh root@semesta-lb01 'systemctl status nginx'
```

**Test connectivity**:
```bash
# From lb01
ssh root@semesta-lb01 'curl -k https://10.200.0.177:6443'

# From client (through lb01)
curl -k https://103.125.102.156:6443
```

#### Troubleshooting

**Cannot reach kube API through lb01**:
1. Check nginx is running on lb01
2. Verify lb01 can reach `10.200.0.177:6443`
3. Check firewall allows port 6443 on both hosts
4. Test direct connection to kube01

**nginx fails to start**:
1. Check syntax: `nginx -t`
2. Verify upstream IP is correct
3. Check if port 6443 is already in use

## Common Commands

### Validate a Host Locally

```bash
nix build .#nixosConfigurations.<host>.config.system.build.toplevel
```

### Deploy with Colmena

```bash
nix run github:zhaofengli/colmena -- apply --build-on-target --on <host>
```

### Server-Side Build

```bash
sudo nixos-rebuild switch --flake .#<host>
```

### Check Host Configuration

```bash
# View the flake configuration
nix flake show

# Check the host's flake output
nix eval .#nixosConfigurations.vpn.config.networking.hostName
```

### SSH into Hosts

```bash
ssh root@semesta-vpn
ssh root@semesta-lb01
ssh root@semesta-kube01
```

### Check System Status on Hosts

```bash
# All services
systemctl status

# Specific service
systemctl status nginx

# Journal logs
journalctl -u nginx -f
```

### Rollbacks

```bash
# List generations
nixos-rebuild list-generations

# Rollback to previous generation
sudo nixos-rebuild switch --rollback

# Switch to specific generation
sudo nixos-rebuild switch --rollback <number>
```

## Troubleshooting

### disko vs hardware-configuration.conflicts

If flake evaluation complains about `fileSystems` conflicts:

- **Problem**: Both `disko.nix` and `hardware-configuration.nix` define file systems
- **Solution**: Keep storage layout in `hosts/<host>/disko.nix`, remove from `hardware-configuration.nix`
  ```bash
  # Edit hosts/<host>/hardware-configuration.nix
  # Remove all fileSystems.* and swapDevices entries
  ```

### Colmena Fails from macOS

If `colmena` fails with errors about architecture or Nix daemon:

- **Problem**: Local macOS Nix environment not compatible
- **Solution**: Use server-side fallback:
  ```bash
  rsync -az --delete ./ root@semesta-vpn:/root/semesta/
  ssh root@semesta-vpn
  cd /root/semesta
  sudo nixos-rebuild switch --flake .#vpn
  ```

### Lost SSH Access

If you lock yourself out by changing SSH or networking:

- **Prevention**: Always validate with `nix build` before deploying
- **Recovery via console**:
  - Access server via provider console (VNC/serial)
  - Rollback: `nixos-rebuild switch --rollback`
  - Or edit config directly and rebuild
- **Recovery via rescue system**: Some providers offer a rescue OS mode

### Service Can't Start

If a service fails after deployment:

```bash
# Check service status
systemctl status <service>

# Check logs
journalctl -u <service> -n 50

# Check if port is in use
ss -tulpn | grep <port>

# Check firewall
nixos-rebuild switch --print-build-logs --show-trace
```

### DNS Issues

If hostnames don't resolve:

```bash
# Check DNS resolution
nslookup kubeapi.pelindungbumi.dev

# Check /etc/hosts
cat /etc/hosts

# Check domain's DNS records (e.g., via whois)
```

## Repository Rules

From `semesta/AGENTS.md`:

- **Channel Policy**: Use stable `nixpkgs` (25.11) unless explicitly requested
- **Home Manager**: Do not introduce Home Manager unless explicitly requested
- **Structure**:
  - Shared logic in `modules/nixos`
  - Host-specific config in `hosts/<name>`
  - Each host has `configuration.nix` and `disko.nix`
- **Services**:
  - Prefer simple built-in NixOS services
  - Use modules for reusable service logic
  - Keep upstream-aligned configuration
- **Colmena**:
  - Prefer `colmena apply --build-on-target` for day-2 deployments
  - Use SSH aliases for easier management
  - Keep deployment metadata in `flake.nix`
- **Safety Rules**:
  - Never run destructive install commands without user confirmation
  - Preserve SSH access during changes
  - Validate before deploying

## Security Best Practices

1. **SSH Access**:
   - Use key-based authentication only
   - Root access is allowed on infrastructure nodes
   - Consider adding managed users for non-root access

2. **Firewalls**:
   - Each host locks down ports to what's needed
   - Use private network for internal traffic where possible

3. **Secrets**:
   - Never commit secrets to git
   - Use environment variables or secrets management for sensitive data
   - Consider tools like `agenix` or `sops` for secrets in Nix

4. **Updates**:
   - Test in dev/staging before production
   - Keep rollback generations available
   - Monitor logs after deployments

## Future Plans

From `semesta/README.md`:

- Add remote builder so `colmena` works reliably from local machine
- Document kubeconfig distribution workflow for `kubeapi.pelindungbumi.dev:6443`
- Evaluate Cilium as a CNI replacement for flannel
- Plan Ceph/Rook for the reserved disk on future storage-capable Kubernetes host
- Add monitoring and observability stack

## Repository Links

- **Infra Repo**: [semesta](https://github.com/pelindung-bumi/semesta)
- **Blog Repo**: [pelindung-bumi.github.io](https://github.com/pelindung-bumi/pelindung-bumi.github.io)
- **Docs Repo**: [peta](https://github.com/pelindung-bumi/peta)
- **GitHub Org**: [pelindung-bumi](https://github.com/pelindung-bumi)
