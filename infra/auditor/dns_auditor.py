#!/usr/bin/env python3
"""
DNS Auditor - DigitalOcean DNS Record Auditing

Audits and fixes DNS records on DigitalOcean to match desired target state.
"""

import json
import logging
import subprocess
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger('DNSAuditor')


class DNSAuditor:
    """Auditor for DigitalOcean DNS records."""

    def __init__(self, config: Dict):
        """Initialize DNS Auditor.

        Args:
            config: DNS configuration containing target state
        """
        self.config = config
        self.target_domains = config.get('domains', [])
        self.check_doctl_available()

    def check_doctl_available(self) -> bool:
        """Check if doctl CLI is available.

        Returns:
            True if doctl is available, False otherwise
        """
        try:
            result = subprocess.run(
                ['which', 'doctl'],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                logger.info("doctl CLI is available")
                return True
            else:
                logger.warning("doctl CLI is NOT installed. DNS operations will be simulated.")
                logger.warning("Install: https://docs.digitalocean.com/reference/doctl/how-to/install/")
                return False
        except Exception as e:
            logger.error(f"Error checking for doctl: {e}")
            return False

    def run_doctl_command(self, command: List[str], check: bool = False) -> Tuple[int, str, str]:
        """Run a doctl command.

        Args:
            command: Command arguments (without 'doctl' prefix)
            check: If True, raise exception on non-zero exit

        Returns:
            Tuple of (return_code, stdout, stderr)
        """
        full_command = ['doctl'] + command

        try:
            logger.debug(f"Running: {' '.join(full_command)}")
            result = subprocess.run(
                full_command,
                capture_output=True,
                text=True,
                check=check
            )
            return result.returncode, result.stdout, result.stderr
        except subprocess.CalledProcessError as e:
            logger.error(f"Command failed: {e}")
            return e.returncode, e.stdout, e.stderr
        except FileNotFoundError:
            logger.error("doctl command not found")
            return 127, "", "doctl not found"

    def get_account_info(self) -> Optional[Dict]:
        """Get DigitalOcean account information.

        Returns:
            Account info dict or None if failed
        """
        logger.info("Fetching DigitalOcean account info...")

        returncode, stdout, stderr = self.run_doctl_command(['account', 'get', '--output', 'json'])

        if returncode == 0:
            try:
                account = json.loads(stdout)
                logger.info(f"Account: {account.get('email', 'Unknown')}")
                return account
            except json.JSONDecodeError:
                logger.error("Failed to parse account info")
                return None
        else:
            logger.error(f"Failed to get account info: {stderr}")
            return None

    def list_domains(self) -> List[str]:
        """List all domains in DigitalOcean account.

        Returns:
            List of domain names
        """
        logger.info("Fetching domain list...")

        returncode, stdout, stderr = self.run_doctl_command(['compute', 'domain', 'list', '--output', 'json'])

        if returncode == 0:
            try:
                domains = json.loads(stdout)
                domain_names = [d['name'] for d in domains]
                logger.info(f"Found {len(domain_names)} domains: {domain_names}")
                return domain_names
            except (json.JSONDecodeError, KeyError) as e:
                logger.error(f"Failed to parse domains: {e}")
                return []
        else:
            logger.error(f"Failed to list domains: {stderr}")
            return []

    def list_domain_records(self, domain: str) -> List[Dict]:
        """List all DNS records for a domain.

        Args:
            domain: Domain name

        Returns:
            List of DNS record dicts
        """
        logger.info(f"Fetching DNS records for {domain}...")

        returncode, stdout, stderr = self.run_doctl_command([
            'compute', 'domain', 'records', 'list', domain,
            '--output', 'json'
        ])

        if returncode == 0:
            try:
                records = json.loads(stdout)
                logger.info(f"Found {len(records)} records for {domain}")
                return records
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse records: {e}")
                return []
        else:
            logger.error(f"Failed to list records for {domain}: {stderr}")
            return []

    def compare_records(self, current: List[Dict], desired: List[Dict]) -> Dict:
        """Compare current DNS records with desired state.

        Args:
            current: Current DNS records
            desired: Desired DNS records

        Returns:
            Dict containing differences (add, update, delete)
        """
        diff = {
            'add': [],
            'update': [],
            'delete': [],
            'unchanged': []
        }

        # Create lookup maps
        current_map = {}
        for record in current:
            key = (record['type'], record['name'])
            current_map[key] = record

        desired_map = {}
        for record in desired:
            key = (record['type'], record['name'])
            desired_map[key] = record

        # Find records to add or update
        for key, desired_record in desired_map.items():
            if key not in current_map:
                diff['add'].append(desired_record)
            else:
                current_record = current_map[key]
                # Check if data or TTL differs
                if (current_record.get('data') != desired_record.get('data') or
                    current_record.get('ttl') != desired_record.get('ttl')):
                    diff['update'].append({
                        'current': current_record,
                        'desired': desired_record
                    })
                else:
                    diff['unchanged'].append(current_record)

        # Find records to delete
        for key, current_record in current_map.items():
            if key not in desired_map:
                # Only mark for deletion if in config (controlled deletion)
                if self.config.get('delete_unmanaged', False):
                    diff['delete'].append(current_record)

        return diff

    def audit(self, dry_run: bool = True) -> Dict:
        """Run DNS audit across all configured domains.

        Args:
            dry_run: If True, only report without making changes

        Returns:
            Dict containing audit results
        """
        results = {
            'issues_count': 0,
            'fix_commands': [],
            'manual_steps': [],
            'risks': [],
            'domains': {}
        }

        # Check account access
        account = self.get_account_info()
        if not account:
            results['risks'].append("Cannot access DigitalOcean account - check doctl auth")
            return results

        # Get all domains
        existing_domains = self.list_domains()

        # Audit each target domain
        for domain_config in self.target_domains:
            domain_name = domain_config['name']
            desired_records = domain_config.get('records', [])

            logger.info(f"\n{'=' * 60}")
            logger.info(f"Auditing domain: {domain_name}")
            logger.info(f"{'=' * 60}")

            # Check if domain exists
            if domain_name not in existing_domains:
                results['risks'].append(f"Domain '{domain_name}' not found in DigitalOcean account")
                results['manual_steps'].append(f"Create domain '{domain_name}' in DigitalOcean")
                continue

            # Get current records
            current_records = self.list_domain_records(domain_name)

            # Compare with desired state
            diff = self.compare_records(current_records, desired_records)

            # Report differences
            domain_results = {
                'diff': diff,
                'issues': []
            }

            if diff['add']:
                logger.warning(f"Records to ADD: {len(diff['add'])}")
                for record in diff['add']:
                    logger.warning(f"  + {record['type']} {record['name']} -> {record.get('data', 'N/A')}")
                    domain_results['issues'].append(f"Missing record: {record['type']} {record['name']}")
                    results['issues_count'] += 1

            if diff['update']:
                logger.warning(f"Records to UPDATE: {len(diff['update'])}")
                for change in diff['update']:
                    current = change['current']
                    desired = change['desired']
                    logger.warning(f"  ~ {current['type']} {current['name']}")
                    logger.warning(f"    Current: {current.get('data')} (TTL: {current.get('ttl')})")
                    logger.warning(f"    Desired: {desired.get('data')} (TTL: {desired.get('ttl')})")
                    domain_results['issues'].append(f"Mismatched record: {current['type']} {current['name']}")
                    results['issues_count'] += 1

            if diff['delete']:
                logger.warning(f"Records to DELETE: {len(diff['delete'])}")
                for record in diff['delete']:
                    logger.warning(f"  - {record['type']} {record['name']} -> {record.get('data', 'N/A')}")
                    domain_results['issues'].append(f"Obsolete record: {record['type']} {record['name']}")
                    results['issues_count'] += 1
                    results['risks'].append(f"Deleting {record['type']} {record['name']} in {domain_name}")

            if diff['unchanged']:
                logger.info(f"Records unchanged: {len(diff['unchanged'])}")

            results['domains'][domain_name] = domain_results

        # Summary
        logger.info(f"\n{'=' * 60}")
        logger.info(f"DNS Audit Summary")
        logger.info(f"{'=' * 60}")
        logger.info(f"Total issues found: {results['issues_count']}")
        logger.info(f"Domains audited: {len(results['domains'])}")

        return results

    def generate_fix_plan(self, audit_results: Dict) -> List[str]:
        """Generate doctl commands to fix DNS issues.

        Args:
            audit_results: Results from audit()

        Returns:
            List of doctl commands
        """
        commands = {
            'safe': [],
            'risky': []
        }

        for domain_name, domain_data in audit_results.get('domains', {}).items():
            diff = domain_data.get('diff', {})

            # ADD commands (safe)
            for record in diff.get('add', []):
                cmd = (
                    f"doctl compute domain records create {domain_name} "
                    f"--record-type {record['type']} "
                    f"--record-name {record['name']} "
                    f"--record-data {record.get('data', '')} "
                    f"--record-ttl {record.get('ttl', 3600)}"
                )
                commands['safe'].append(cmd)

            # UPDATE commands (risky - overwrites existing)
            for change in diff.get('update', []):
                current = change['current']
                desired = change['desired']
                record_id = current.get('id')

                cmd = (
                    f"doctl compute domain records update {domain_name} {record_id} "
                    f"--record-data {desired.get('data', '')} "
                    f"--record-ttl {desired.get('ttl', 3600)}"
                )
                commands['risky'].append(cmd)

            # DELETE commands (risky - destructive)
            for record in diff.get('delete', []):
                record_id = record.get('id')
                cmd = f"doctl compute domain records delete {domain_name} {record_id} --force"
                commands['risky'].append(cmd)

        # Log the plan
        logger.info(f"\n{'=' * 60}")
        logger.info("DNS Fix Plan")
        logger.info(f"{'=' * 60}")

        logger.info(f"\nSAFE commands ({len(commands['safe'])}):")
        for cmd in commands['safe']:
            logger.info(f"  {cmd}")

        logger.info(f"\nRISKY commands ({len(commands['risky'])}):")
        logger.info("  (Requires CONFIRM_APPLY and may require CONFIRM_DESTRUCTIVE)")
        for cmd in commands['risky']:
            logger.info(f"  {cmd}")

        # Flatten to single list
        all_commands = commands['safe'] + commands['risky']

        audit_results['fix_commands'] = all_commands
        return all_commands

    def execute_fixes(self, commands: List[str], confirm_destructive: bool = False) -> Dict:
        """Execute DNS fix commands.

        Args:
            commands: List of doctl commands to execute
            confirm_destructive: If True, allow destructive operations

        Returns:
            Dict with execution results
        """
        results = {
            'executed_count': 0,
            'success_count': 0,
            'failed_count': 0,
            'skipped_count': 0,
            'details': []
        }

        for cmd in commands:
            # Check if command is destructive
            is_destructive = 'delete' in cmd.lower() or 'drop' in cmd.lower()

            if is_destructive and not confirm_destructive:
                logger.warning(f"SKIPPED (destructive): {cmd}")
                results['skipped_count'] += 1
                results['details'].append({
                    'command': cmd,
                    'status': 'skipped',
                    'reason': 'destructive operation requires CONFIRM_DESTRUCTIVE'
                })
                continue

            # Execute command
            logger.info(f"EXECUTING: {cmd}")
            cmd_parts = cmd.split()[1:]  # Remove 'doctl' prefix

            returncode, stdout, stderr = self.run_doctl_command(cmd_parts)

            results['executed_count'] += 1

            if returncode == 0:
                logger.info(f"  SUCCESS")
                results['success_count'] += 1
                results['details'].append({
                    'command': cmd,
                    'status': 'success',
                    'output': stdout
                })
            else:
                logger.error(f"  FAILED: {stderr}")
                results['failed_count'] += 1
                results['details'].append({
                    'command': cmd,
                    'status': 'failed',
                    'error': stderr
                })

        logger.info(f"\nExecution Summary:")
        logger.info(f"  Executed: {results['executed_count']}")
        logger.info(f"  Success: {results['success_count']}")
        logger.info(f"  Failed: {results['failed_count']}")
        logger.info(f"  Skipped: {results['skipped_count']}")

        return results
