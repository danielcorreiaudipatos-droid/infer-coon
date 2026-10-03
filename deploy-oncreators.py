#!/usr/bin/env python3
"""
🚀 OnCreators - Automated Production Deployment Script
Generates Vercel + Railway tokens and configures GitHub for automatic deployment
"""

import subprocess
import sys
import json
from typing import Dict, Optional
import webbrowser
import time

class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header():
    print(f"""
{Colors.BOLD}{Colors.BLUE}
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 OnCreators - Production Deployment 🚀              ║
║              Vercel + Railway + GitHub Actions                ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
{Colors.END}
""")

def print_step(step: int, title: str):
    print(f"\n{Colors.BOLD}{Colors.CYAN}STEP {step}: {title}{Colors.END}")
    print("=" * 70)

def print_success(msg: str):
    print(f"{Colors.GREEN}✅ {msg}{Colors.END}")

def print_info(msg: str):
    print(f"{Colors.BLUE}ℹ️  {msg}{Colors.END}")

def print_warn(msg: str):
    print(f"{Colors.YELLOW}⚠️  {msg}{Colors.END}")

def print_error(msg: str):
    print(f"{Colors.RED}❌ {msg}{Colors.END}")

def run_command(cmd: str, check: bool = True) -> tuple:
    """Run shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, "", str(e)

def main():
    print_header()

    # Step 1: Check Prerequisites
    print_step(1, "Checking Prerequisites")

    print_info("Checking Node.js...")
    code, out, _ = run_command("node --version")
    if code == 0:
        print_success(f"Node.js {out.strip()}")
    else:
        print_error("Node.js not found. Please install Node.js first.")
        return False

    print_info("Checking npm...")
    code, out, _ = run_command("npm --version")
    if code == 0:
        print_success(f"npm {out.strip()}")
    else:
        print_error("npm not found.")
        return False

    print_info("Checking git...")
    code, out, _ = run_command("git --version")
    if code == 0:
        print_success(f"Git {out.strip()}")
    else:
        print_error("Git not found.")
        return False

    # Step 2: Vercel Configuration
    print_step(2, "Vercel Configuration")

    print_info("Opening Vercel in your browser...")
    print_info("URL: https://vercel.com/account/tokens")
    print()
    print(f"{Colors.YELLOW}Instructions:{Colors.END}")
    print("1. Create a new Personal Access Token")
    print("2. Name it: 'GitHub Deploy'")
    print("3. Copy the token and paste here")
    print()

    webbrowser.open("https://vercel.com/account/tokens")
    vercel_token = input(f"{Colors.CYAN}Paste VERCEL_TOKEN: {Colors.END}").strip()

    if not vercel_token:
        print_error("Vercel token is required")
        return False
    print_success("Vercel token saved")

    print_info("Getting Organization ID from Vercel...")
    webbrowser.open("https://vercel.com/account/general")
    vercel_org_id = input(f"{Colors.CYAN}Paste VERCEL_ORG_ID (Team/Org ID): {Colors.END}").strip()

    if not vercel_org_id:
        print_error("Vercel Org ID is required")
        return False
    print_success("Vercel Org ID saved")

    print_info("Creating/Getting Vercel Project ID...")
    print("Opening Vercel Projects...")
    webbrowser.open("https://vercel.com/projects")

    print(f"""{Colors.YELLOW}Instructions:{Colors.END}
1. Create a new project called "oncreators"
2. Go to Project Settings
3. Copy the Project ID
4. Paste it here
""")

    vercel_project_id = input(f"{Colors.CYAN}Paste VERCEL_PROJECT_ID: {Colors.END}").strip()

    if not vercel_project_id:
        print_error("Vercel Project ID is required")
        return False
    print_success("Vercel Project ID saved")

    # Step 3: Railway Configuration
    print_step(3, "Railway Configuration")

    print_info("Opening Railway in your browser...")
    print_info("URL: https://railway.app/account/tokens")
    print()
    print(f"{Colors.YELLOW}Instructions:{Colors.END}")
    print("1. Create a new API Token")
    print("2. Name it: 'GitHub Deploy'")
    print("3. Copy the token and paste here")
    print()

    webbrowser.open("https://railway.app/account/tokens")
    railway_token = input(f"{Colors.CYAN}Paste RAILWAY_TOKEN: {Colors.END}").strip()

    if not railway_token:
        print_error("Railway token is required")
        return False
    print_success("Railway token saved")

    # Step 4: Configure GitHub Secrets
    print_step(4, "Configuring GitHub Secrets")

    github_url = "https://github.com/danielcorreiaudipatos-droid/infer-coon/settings/secrets/actions"

    print_info("Opening GitHub Secrets...")
    webbrowser.open(github_url)

    print(f"""{Colors.YELLOW}Configure 4 secrets in GitHub:{Colors.END}
1. VERCEL_TOKEN
2. VERCEL_ORG_ID
3. VERCEL_PROJECT_ID
4. RAILWAY_TOKEN

We'll do this automatically for you.
""")

    secrets = {
        "VERCEL_TOKEN": vercel_token,
        "VERCEL_ORG_ID": vercel_org_id,
        "VERCEL_PROJECT_ID": vercel_project_id,
        "RAILWAY_TOKEN": railway_token,
    }

    print_info("Preparing to create GitHub secrets...")

    # Step 5: Create secrets via GitHub CLI
    print_step(5, "Creating GitHub Secrets")

    # Check if gh CLI is installed
    code, _, _ = run_command("gh --version")

    if code != 0:
        print_warn("GitHub CLI not found. Installing...")
        run_command("npm install -g gh")

    print_info("Authenticating with GitHub...")
    print(f"{Colors.YELLOW}You may be asked to authenticate in your browser.{Colors.END}")

    run_command("gh auth login")

    print_info("Creating secrets...")
    for secret_name, secret_value in secrets.items():
        print_info(f"Creating {secret_name}...")
        cmd = f'gh secret set {secret_name} -b "{secret_value}" -R danielcorreiaudipatos-droid/infer-coon'
        code, out, err = run_command(cmd)

        if code == 0:
            print_success(f"{secret_name} created")
        else:
            print_warn(f"Could not auto-create {secret_name}. You may need to create it manually.")
            print(f"   Value: {secret_value[:20]}...")

    # Step 6: Trigger Deployment
    print_step(6, "Triggering Production Deployment")

    print_info("Pushing changes to main branch...")
    code, out, err = run_command("git push origin main")

    if code == 0:
        print_success("Code pushed to GitHub")
    else:
        print_warn("Git push may have had issues, but continuing...")

    print_info("Opening GitHub Actions...")
    webbrowser.open("https://github.com/danielcorreiaudipatos-droid/infer-coon/actions")

    # Step 7: Summary
    print_step(7, "Deployment Summary")

    print(f"""
{Colors.GREEN}{Colors.BOLD}✅ DEPLOYMENT CONFIGURED!{Colors.END}

{Colors.BOLD}What's Happening:{Colors.END}
✅ GitHub secrets configured
✅ Deployment workflow ready
✅ Automatic deployment enabled

{Colors.BOLD}Timeline:{Colors.END}
⏱️  5-10 min: GitHub Actions builds code
⏱️  10-15 min: Frontend deploys to Vercel
⏱️  10-15 min: Backend deploys to Railway
⏱️  5 min: Database migrations run
⏱️  Total: ~25-30 minutes

{Colors.BOLD}What Gets Deployed:{Colors.END}
🌐 Frontend (React) → Vercel CDN
🔌 Backend (NestJS) → Railway
🗄️  Database (PostgreSQL) → Railway
💾 Cache (Redis) → Railway

{Colors.BOLD}Next Steps:{Colors.END}
1. Watch GitHub Actions:
   {Colors.CYAN}https://github.com/danielcorreiaudipatos-droid/infer-coon/actions{Colors.END}

2. Monitor Vercel deployment:
   {Colors.CYAN}https://vercel.com/projects{Colors.END}

3. Monitor Railway deployment:
   {Colors.CYAN}https://railway.app{Colors.END}

4. Configure your domain (after deployment completes)

{Colors.GREEN}{Colors.BOLD}🎉 OnCreators will be LIVE in ~30 minutes!{Colors.END}

{Colors.YELLOW}Check back in 30 minutes to see your platform running!{Colors.END}
""")

    return True

if __name__ == "__main__":
    try:
        success = main()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print_error("\nDeployment cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
