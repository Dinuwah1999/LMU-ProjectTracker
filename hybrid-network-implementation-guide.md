# Step-by-Step Implementation Guide: Automation-Driven Hybrid Network Project

This comprehensive guide walks you through implementing your advanced hybrid network project using GNS3 and AWS Free Tier, with a focus on automation, security, and monitoring. The guide is designed to work with your AMD Ryzen 3 3300U laptop with 16GB RAM and will only use AWS Free Tier services to avoid any costs.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Environment Setup (Weeks 1-2)](#phase-1-environment-setup-weeks-1-2)
4. [Phase 2: Network Configuration (Weeks 3-4)](#phase-2-network-configuration-weeks-3-4)
5. [Phase 3: Security Implementation (Weeks 5-6)](#phase-3-security-implementation-weeks-5-6)
6. [Phase 4: Monitoring and Documentation (Weeks 7-8)](#phase-4-monitoring-and-documentation-weeks-7-8)
7. [Common Challenges and Solutions](#common-challenges-and-solutions)
8. [Advanced Features](#advanced-features)
9. [Resources and References](#resources-and-references)

## Project Overview

This project creates a secure, enterprise-grade hybrid network for SecureNet Pvt Ltd using GNS3 for on-premises simulation and AWS Free Tier for cloud integration. Key components include:

- **GNS3 Environment**: Simulates on-premises network with 5 departmental VLANs
- **AWS Cloud**: Uses Free Tier EC2 instances and VPC for cloud services
- **VPN Connectivity**: Self-hosted OpenVPN for secure hybrid connectivity
- **Automation**: Ansible and GitHub Actions for network automation
- **Security**: Comprehensive security controls and testing
- **Monitoring**: ELK Stack and Grafana/Prometheus for observability

The project demonstrates enterprise-level networking concepts while remaining feasible on standard hardware and without incurring AWS costs.

## Prerequisites

### Hardware Requirements
- CPU: AMD Ryzen 3 3300U (4 cores, 2.10 GHz) - Sufficient for this project
- RAM: 16GB (13.9 GB usable) - Enough for GNS3 + Docker containers
- Operating System: Windows 10 Enterprise
- Storage: At least 40GB free space

### AWS Free Tier Account
- Sign up at [aws.amazon.com](https://aws.amazon.com/)
- Note: Free Tier includes 750 hours/month of t2.micro/t3.micro instances, enough for one instance running 24/7

### Software to Install
- GNS3 (latest version)
- Docker Desktop for Windows
- Windows Subsystem for Linux 2 (WSL2) with Ubuntu
- Git and GitHub account
- Visual Studio Code (or your preferred editor)
- Wireshark
- Nmap
- OpenVPN client

## Phase 1: Environment Setup (Weeks 1-2)

### Week 1: Basic Setup

#### 1.1 Install WSL2 and Ubuntu

```powershell
# In PowerShell with Admin privileges
wsl --install

# After restart, open PowerShell again and install Ubuntu
wsl --install -d Ubuntu-20.04
```

#### 1.2 Install Docker Desktop

1. Download from [docker.com](https://www.docker.com/products/docker-desktop)
2. During installation, ensure WSL2 integration is enabled
3. In Docker Desktop settings, enable integration with your Ubuntu distro

#### 1.3 Install GNS3

1. Download from [gns3.com](https://www.gns3.com/software/download)
2. Choose "GNS3 VM" option during installation if your system has enough RAM
3. For systems with limited RAM, choose "Local installation"
4. Configure GNS3 to use Docker containers

#### 1.4 Configure GNS3 with Docker Integration

1. Open GNS3 and go to Edit > Preferences > Docker
2. Click "New" and select your Docker container images
3. Configure alpine, ubuntu, or custom network containers
4. Test Docker integration by dragging a container to the workspace

#### 1.5 Install Ansible in WSL2

```bash
# In Ubuntu WSL2
sudo apt update
sudo apt install -y python3 python3-pip
pip3 install ansible

# Verify installation
ansible --version
```

#### 1.6 Set Up GitHub Repository

1. Create a new GitHub repository for your project
2. Initialize with README.md and .gitignore
3. Clone to your local machine
4. Create directories for:
   - ansible-playbooks
   - network-configs
   - monitoring
   - documentation

### Week 2: Initial Topology and AWS Setup

#### 2.1 Create Basic GNS3 Topology

1. Add network devices to GNS3 workspace:
   - 1 router for internet connectivity
   - 1 core switch
   - 5 access switches (one for each department)
   - Docker containers as hosts

2. Create basic connectivity:
   - Connect router to cloud for internet access
   - Connect router to core switch
   - Connect core switch to access switches

#### 2.2 Set Up AWS Account and Configure CLI

1. Sign up for AWS Free Tier account if you haven't already
2. Create an IAM user with programmatic access
3. Install AWS CLI in WSL2:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

4. Configure AWS CLI:

```bash
aws configure
# Enter your Access Key ID, Secret Access Key, Region (e.g., us-east-1), and output format (json)
```

#### 2.3 Create Basic Ansible Inventory

Create a file `inventory.ini` in your ansible-playbooks directory:

```ini
[gns3_routers]
router1 ansible_host=192.168.122.x

[gns3_switches]
core_switch ansible_host=192.168.122.y
access_switch1 ansible_host=192.168.122.z
# Add more as needed

[aws]
ec2_instance ansible_host=<EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem

[all:vars]
ansible_connection=ssh
ansible_user=admin
ansible_password=cisco
ansible_network_os=ios
```

## Phase 2: Network Configuration (Weeks 3-4)

### Week 3: GNS3 Network Configuration

#### 3.1 Configure VLANs in GNS3

1. Define 5 VLANs for departments:
   - VLAN 10: Management (192.168.10.0/24)
   - VLAN 20: HR (192.168.20.0/24)
   - VLAN 30: IT (192.168.30.0/24)
   - VLAN 40: Admin (192.168.40.0/24)
   - VLAN 50: Finance (192.168.50.0/24)

2. Create Ansible playbook for VLAN configuration (`vlan_config.yml`):

```yaml
---
- name: Configure VLANs on switches
  hosts: gns3_switches
  gather_facts: no
  
  tasks:
    - name: Create VLANs
      ios_vlans:
        config:
          - name: Management
            vlan_id: 10
          - name: HR
            vlan_id: 20
          - name: IT
            vlan_id: 30
          - name: Admin
            vlan_id: 40
          - name: Finance
            vlan_id: 50
```

3. Run the playbook:

```bash
ansible-playbook -i inventory.ini vlan_config.yml
```

#### 3.2 Configure Inter-VLAN Routing

1. Create Ansible playbook for router configuration (`router_config.yml`):

```yaml
---
- name: Configure Inter-VLAN Routing
  hosts: gns3_routers
  gather_facts: no
  
  tasks:
    - name: Configure router interfaces for inter-VLAN routing
      ios_config:
        lines:
          - no shutdown
          - ip address 192.168.{{ item.vlan_id }}.1 255.255.255.0
        parents: interface GigabitEthernet0/{{ item.interface }}
      loop:
        - { vlan_id: 10, interface: 0 }
        - { vlan_id: 20, interface: 1 }
        - { vlan_id: 30, interface: 2 }
        - { vlan_id: 40, interface: 3 }
        - { vlan_id: 50, interface: 4 }
```

2. Run the playbook:

```bash
ansible-playbook -i inventory.ini router_config.yml
```

#### 3.3 Set Up Docker Containers as Hosts

1. Create Docker containers in GNS3:
   - Drag Docker containers (Alpine or Ubuntu) to your workspace
   - Configure one for each VLAN
   - Connect to appropriate access switches

2. Configure IP addresses on containers:
   - Access container console
   - Configure network settings:

```bash
# For Alpine containers
vi /etc/network/interfaces

# Add:
auto eth0
iface eth0 inet static
    address 192.168.10.10  # Change for each VLAN
    netmask 255.255.255.0
    gateway 192.168.10.1   # Change for each VLAN
```

### Week 4: AWS Configuration and VPN Setup

#### 4.1 Create AWS VPC and Subnet

1. Create Ansible playbook for VPC creation (`aws_vpc.yml`):

```yaml
---
- name: Create AWS VPC Infrastructure
  hosts: localhost
  gather_facts: no
  
  tasks:
    - name: Create VPC
      amazon.aws.ec2_vpc_net:
        name: "SecureNet-VPC"
        cidr_block: 10.0.0.0/16
        region: us-east-1
        tags:
          Project: SecureNet
      register: vpc

    - name: Create Subnet
      amazon.aws.ec2_vpc_subnet:
        vpc_id: "{{ vpc.vpc.id }}"
        cidr: 10.0.1.0/24
        region: us-east-1
        tags:
          Name: SecureNet-Subnet
      register: subnet
```

2. Run the playbook:

```bash
ansible-playbook aws_vpc.yml
```

#### 4.2 Launch EC2 Instance and Security Groups

1. Create Ansible playbook for EC2 and security groups (`aws_ec2.yml`):

```yaml
---
- name: Launch EC2 Instance
  hosts: localhost
  gather_facts: no
  
  tasks:
    - name: Create Security Group
      amazon.aws.ec2_security_group:
        name: SecureNet-SG
        description: Security group for SecureNet
        vpc_id: "{{ vpc_id }}"
        region: us-east-1
        rules:
          - proto: tcp
            ports: 22
            cidr_ip: your_ip/32
          - proto: tcp
            ports: 80
            cidr_ip: 0.0.0.0/0
          - proto: tcp
            ports: 443
            cidr_ip: 0.0.0.0/0
          - proto: udp
            ports: 1194
            cidr_ip: 0.0.0.0/0
      register: sg

    - name: Launch EC2 Instance
      amazon.aws.ec2_instance:
        name: SecureNet-Server
        key_name: your-key-pair
        instance_type: t2.micro
        image_id: ami-0c55b159cbfafe1f0  # Ubuntu 20.04 LTS, update as needed
        security_group: "{{ sg.group_id }}"
        subnet_id: "{{ subnet_id }}"
        network:
          assign_public_ip: yes
        tags:
          Project: SecureNet
      register: ec2
```

2. Run the playbook (replace variables with your values):

```bash
ansible-playbook aws_ec2.yml -e "vpc_id=vpc-xxx subnet_id=subnet-xxx"
```

#### 4.3 Install and Configure OpenVPN Server on EC2

1. Create Ansible playbook for OpenVPN installation (`openvpn_setup.yml`):

```yaml
---
- name: Install OpenVPN on EC2
  hosts: aws
  become: yes
  
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        
    - name: Install OpenVPN and Easy-RSA
      apt:
        name:
          - openvpn
          - easy-rsa
        state: present
        
    - name: Copy OpenVPN configuration template
      template:
        src: templates/server.conf.j2
        dest: /etc/openvpn/server.conf
```

2. Create OpenVPN server config template (`templates/server.conf.j2`):

```
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
server 10.8.0.0 255.255.255.0
push "route 10.0.0.0 255.255.0.0"
push "route 192.168.10.0 255.255.255.0"
push "route 192.168.20.0 255.255.255.0"
push "route 192.168.30.0 255.255.255.0"
push "route 192.168.40.0 255.255.255.0"
push "route 192.168.50.0 255.255.255.0"
keepalive 10 120
cipher AES-256-CBC
user nobody
group nogroup
persist-key
persist-tun
status openvpn-status.log
verb 3
```

3. Run the playbook:

```bash
ansible-playbook -i inventory.ini openvpn_setup.yml
```

4. Set up OpenVPN certificates (simplified steps):
   - Create certificate authority and server/client certificates
   - Configure OpenVPN server
   - Start OpenVPN service

#### 4.4 Configure GNS3 Router for VPN Connection

1. Create Ansible playbook for GNS3 router VPN config (`router_vpn.yml`):

```yaml
---
- name: Configure GNS3 Router for VPN
  hosts: gns3_routers
  gather_facts: no
  
  tasks:
    - name: Configure OpenVPN Client
      ios_config:
        lines:
          - crypto isakmp policy 10
          - encryption aes
          - hash sha
          - authentication pre-share
          - group 2
          - lifetime 3600
          # Add more configuration as needed
```

2. Run the playbook:

```bash
ansible-playbook -i inventory.ini router_vpn.yml
```

## Phase 3: Security Implementation (Weeks 5-6)

### Week 5: Network Security Controls

#### 5.1 Implement ACLs in GNS3

1. Create Ansible playbook for ACL configuration (`acl_config.yml`):

```yaml
---
- name: Configure ACLs on Routers
  hosts: gns3_routers
  gather_facts: no
  
  tasks:
    - name: Configure ACLs for VLAN isolation
      ios_config:
        lines:
          - access-list 101 permit ip 192.168.10.0 0.0.0.255 any
          - access-list 101 deny ip any any log
          # Add more ACL rules as needed
```

2. Run the playbook:

```bash
ansible-playbook -i inventory.ini acl_config.yml
```

#### 5.2 Configure AWS Security Groups

1. Update AWS security group with more granular rules:

```yaml
---
- name: Update Security Groups
  hosts: localhost
  gather_facts: no
  
  tasks:
    - name: Update Security Group Rules
      amazon.aws.ec2_security_group:
        name: SecureNet-SG
        description: Updated security group for SecureNet
        vpc_id: "{{ vpc_id }}"
        region: us-east-1
        rules:
          - proto: tcp
            ports: 22
            cidr_ip: your_ip/32
          - proto: tcp
            ports: 80
            cidr_ip: 10.0.0.0/16
          - proto: tcp
            ports: 443
            cidr_ip: 10.0.0.0/16
          - proto: udp
            ports: 1194
            cidr_ip: 0.0.0.0/0
          # Add more rules as needed
```

#### 5.3 Implement IAM Policies for AWS

1. Create IAM policies for least privilege access:

```yaml
---
- name: Configure IAM Policies
  hosts: localhost
  gather_facts: no
  
  tasks:
    - name: Create IAM Policy
      amazon.aws.iam_policy:
        policy_name: SecureNet-EC2-ReadOnly
        policy_document:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - ec2:Describe*
              Resource: "*"
```

### Week 6: Server Hardening and Security Testing

#### 6.1 Harden Linux Server on EC2

1. Create Ansible playbook for Linux hardening (`linux_hardening.yml`):

```yaml
---
- name: Harden Linux Server
  hosts: aws
  become: yes
  
  tasks:
    - name: Update all packages
      apt:
        upgrade: dist
        update_cache: yes
        
    - name: Install security packages
      apt:
        name:
          - fail2ban
          - ufw
        state: present
        
    - name: Configure UFW
      ufw:
        state: enabled
        policy: deny
        
    - name: Allow SSH
      ufw:
        rule: allow
        port: 22
        
    - name: Allow OpenVPN
      ufw:
        rule: allow
        port: 1194
        proto: udp
```

2. Run the playbook:

```bash
ansible-playbook -i inventory.ini linux_hardening.yml
```

#### 6.2 Set Up Security Testing with Nmap and Wireshark

1. Install Nmap on a GNS3 Docker container:

```bash
# Inside Docker container
apt-get update
apt-get install -y nmap
```

2. Configure Wireshark for packet capture in GNS3:
   - Right-click on a link in GNS3
   - Select "Start capture"
   - Wireshark will open automatically

3. Create a basic security scanning script:

```bash
#!/bin/bash
# Simple security scanning script

# Scan AWS instance
nmap -A -T4 $AWS_IP

# Scan internal VLANs
nmap -sV 192.168.10.0/24
nmap -sV 192.168.20.0/24
nmap -sV 192.168.30.0/24
nmap -sV 192.168.40.0/24
nmap -sV 192.168.50.0/24
```

## Phase 4: Monitoring and Documentation (Weeks 7-8)

### Week 7: Monitoring Infrastructure

#### 7.1 Set Up ELK Stack with Docker Compose

1. Create `docker-compose.yml` for ELK Stack:

```yaml
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - 9200:9200
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    ports:
      - 5044:5044
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    depends_on:
      - elasticsearch
      
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - 5601:5601
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

2. Create Logstash pipeline configuration:

```conf
input {
  beats {
    port => 5044
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][beat]}-%{[@metadata][version]}-%{+YYYY.MM.dd}"
  }
}
```

3. Deploy ELK Stack with Docker Compose:

```bash
docker-compose up -d
```

#### 7.2 Set Up Grafana and Prometheus

1. Create `docker-compose-monitoring.yml`:

```yaml
version: '3'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - 9090:9090
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      
  grafana:
    image: grafana/grafana
    ports:
      - 3000:3000
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:
```

2. Create Prometheus configuration:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
```

3. Deploy Grafana and Prometheus:

```bash
docker-compose -f docker-compose-monitoring.yml up -d
```

### Week 8: Testing and Documentation

#### 8.1 Perform Final Security Assessment

1. Run comprehensive Nmap scans:

```bash
# Vulnerability scanning
nmap -sV --script vuln $TARGET_IP
```

2. Capture and analyze traffic with Wireshark:
   - Focus on inter-VLAN traffic
   - Monitor VPN tunnel traffic
   - Check for unauthorized access attempts

#### 8.2 Create Comprehensive Documentation

1. Network diagram documentation
2. Configuration files documentation
3. Security assessment report
4. Monitoring dashboard screenshots
5. Troubleshooting guide

## Common Challenges and Solutions

### 1. GNS3 Performance Issues

**Challenge**: GNS3 uses significant system resources, especially with multiple devices.

**Solution**:
- Limit the number of devices in your topology
- Use lightweight Docker containers instead of full VMs where possible
- Close unnecessary applications when running GNS3
- Allocate more memory to GNS3 in preferences

### 2. VPN Connectivity Problems

**Challenge**: Establishing VPN connection between GNS3 and AWS can be tricky.

**Solution**:
- Check security groups to ensure VPN ports are open
- Verify routing tables in both GNS3 and AWS
- Use Wireshark to troubleshoot connection issues
- Consider using WireGuard instead of OpenVPN for simpler setup

### 3. AWS Free Tier Limitations

**Challenge**: Staying within Free Tier limits to avoid charges.

**Solution**:
- Use only t2.micro/t3.micro instances
- Set up CloudWatch alarms for billing
- Shut down instances when not in use
- Use spot instances for temporary testing

### 4. Docker Container Networking

**Challenge**: Networking between Docker containers and GNS3 devices.

**Solution**:
- Use GNS3's built-in Docker integration
- Ensure container network settings match your GNS3 topology
- Use bridge networking mode for containers

## Advanced Features

### 1. GitOps Workflow with GitHub Actions

Set up GitHub Actions workflow for network automation:

```yaml
name: Network Automation

on:
  push:
    branches: [ main ]
    paths:
      - 'network-configs/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
          
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install ansible
          
      - name: Run Ansible playbook
        run: |
          ansible-playbook -i inventory.ini network_config.yml
```

### 2. Custom Monitoring Dashboard

Create a custom Grafana dashboard for network monitoring:

1. Access Grafana at http://localhost:3000
2. Add Prometheus as a data source
3. Create a new dashboard with panels for:
   - Network traffic by VLAN
   - CPU/Memory usage
   - Security events
   - VPN connection status

### 3. Automated Backup System

Create an Ansible playbook for automated backups:

```yaml
---
- name: Backup Network Configurations
  hosts: all
  gather_facts: no
  
  tasks:
    - name: Backup running configurations
      ios_config:
        backup: yes
      register: backup_result
      
    - name: Save backup to Git repository
      local_action:
        module: copy
        src: "{{ backup_result.backup_path }}"
        dest: "./backups/{{ inventory_hostname }}-{{ ansible_date_time.date }}.cfg"
      when: backup_result.changed
```

## Resources and References

### AWS Documentation
- [AWS Free Tier](https://aws.amazon.com/free/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [VPC Documentation](https://docs.aws.amazon.com/vpc/)

### GNS3 Resources
- [GNS3 Documentation](https://docs.gns3.com/)
- [GNS3 Docker Integration](https://docs.gns3.com/docs/emulators/docker-support-in-gns3/)

### Ansible Resources
- [Ansible Documentation](https://docs.ansible.com/)
- [Network Automation Guide](https://www.ansible.com/use-cases/network-automation)

### Security Tools
- [Wireshark User Guide](https://www.wireshark.org/docs/)
- [Nmap Documentation](https://nmap.org/book/)

### Monitoring Resources
- [ELK Stack Documentation](https://www.elastic.co/guide/index.html)
- [Grafana Documentation](https://grafana.com/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)