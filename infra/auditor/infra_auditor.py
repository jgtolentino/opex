#!/usr/bin/env python3
"""
InfraAuditor - DNS (DigitalOcean) + Supabase Audit & Fix Tool

A cautious but highly capable DevOps assistant for auditing and correcting:
- DNS records (DigitalOcean DNS)
- Supabase project configuration (database, API, and security)

SAFETY FEATURES:
- READ/DRY-RUN first, then propose changes
- Requires explicit confirmation before applying changes
- Destructive actions require CONFIRM_DESTRUCTIVE
- All commands and modifications are logged
"""

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Dict, List, Optional

import yaml

from dns_auditor import DNSAuditor
from supabase_auditor import SupabaseAuditor


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('infra_auditor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('InfraAuditor')


class InfraAuditor:
    """Main orchestrator for infrastructure auditing and fixes."""

    def __init__(self, config_path: Optional[str] = None):
        """Initialize the InfraAuditor.

        Args:
            config_path: Path to the configuration file
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.dns_auditor = DNSAuditor(self.config.get('dns', {}))
        self.supabase_auditor = SupabaseAuditor(self.config.get('supabase', {}))

    def _load_config(self) -> Dict:
        """Load configuration from file or discover from repo."""
        if self.config_path and Path(self.config_path).exists():
            logger.info(f"Loading configuration from {self.config_path}")
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)

        # Try to discover config from common locations
        config_paths = [
            'infra/auditor/config/infra_spec.yaml',
            'infra/config/infra_spec.yaml',
            '.infra_spec.yaml'
        ]

        for path in config_paths:
            if Path(path).exists():
                logger.info(f"Discovered configuration at {path}")
                with open(path, 'r') as f:
                    return yaml.safe_load(f)

        logger.warning("No configuration file found, using empty config")
        return {}

    def discover_context(self):
        """Discover repository structure and infrastructure context."""
        logger.info("=" * 80)
        logger.info("STEP 1: DISCOVERING CONTEXT")
        logger.info("=" * 80)

        context = {
            'repo_root': Path.cwd(),
            'infra_dirs': [],
            'supabase_dirs': [],
            'dns_files': []
        }

        # Detect infrastructure directories
        for pattern in ['infra/', 'infrastructure/', 'terraform/', 'pulumi/']:
            infra_dirs = list(Path.cwd().glob(f'**/{pattern}'))
            context['infra_dirs'].extend([str(d) for d in infra_dirs])

        # Detect Supabase directories
        supabase_paths = list(Path.cwd().glob('**/supabase/'))
        context['supabase_dirs'] = [str(d) for d in supabase_paths]

        # Detect DNS configuration files
        for pattern in ['**/dns/*.yaml', '**/dns/*.yml', '**/infra/do/*.yaml']:
            dns_files = list(Path.cwd().glob(pattern))
            context['dns_files'].extend([str(f) for f in dns_files])

        logger.info("Repository Context:")
        logger.info(f"  Root: {context['repo_root']}")
        logger.info(f"  Infrastructure dirs: {context['infra_dirs']}")
        logger.info(f"  Supabase dirs: {context['supabase_dirs']}")
        logger.info(f"  DNS files: {context['dns_files']}")

        return context

    def audit_dns(self, dry_run: bool = True) -> Dict:
        """Run DNS audit.

        Args:
            dry_run: If True, only report without making changes

        Returns:
            Dict containing audit results
        """
        logger.info("=" * 80)
        logger.info("STEP 2: DNS AUDIT (DIGITALOCEAN)")
        logger.info("=" * 80)

        return self.dns_auditor.audit(dry_run=dry_run)

    def audit_supabase(self, dry_run: bool = True) -> Dict:
        """Run Supabase audit.

        Args:
            dry_run: If True, only report without making changes

        Returns:
            Dict containing audit results
        """
        logger.info("=" * 80)
        logger.info("STEP 4: SUPABASE AUDIT")
        logger.info("=" * 80)

        return self.supabase_auditor.audit(dry_run=dry_run)

    def generate_dns_fix_plan(self, audit_results: Dict) -> List[str]:
        """Generate DNS fix plan from audit results.

        Args:
            audit_results: Results from DNS audit

        Returns:
            List of commands to execute
        """
        logger.info("=" * 80)
        logger.info("STEP 3: DNS FIX PLAN")
        logger.info("=" * 80)

        return self.dns_auditor.generate_fix_plan(audit_results)

    def generate_supabase_fix_plan(self, audit_results: Dict) -> Dict:
        """Generate Supabase fix plan from audit results.

        Args:
            audit_results: Results from Supabase audit

        Returns:
            Dict containing migrations and commands
        """
        logger.info("=" * 80)
        logger.info("STEP 5: SUPABASE FIX PLAN")
        logger.info("=" * 80)

        return self.supabase_auditor.generate_fix_plan(audit_results)

    def execute_fixes(
        self,
        dns_commands: List[str],
        supabase_plan: Dict,
        confirm_apply: bool = False,
        confirm_destructive: bool = False
    ):
        """Execute the fix plans.

        Args:
            dns_commands: List of DNS commands to execute
            supabase_plan: Supabase fix plan
            confirm_apply: If True, apply changes
            confirm_destructive: If True, allow destructive operations
        """
        logger.info("=" * 80)
        logger.info("STEP 6: EXECUTION")
        logger.info("=" * 80)

        if not confirm_apply:
            logger.warning("Execution skipped. Provide CONFIRM_APPLY to execute changes.")
            return

        # Execute DNS fixes
        dns_results = self.dns_auditor.execute_fixes(
            dns_commands,
            confirm_destructive=confirm_destructive
        )

        # Execute Supabase fixes
        supabase_results = self.supabase_auditor.execute_fixes(
            supabase_plan,
            confirm_destructive=confirm_destructive
        )

        return {
            'dns': dns_results,
            'supabase': supabase_results
        }

    def verify_changes(self):
        """Re-run audits to verify changes were applied correctly."""
        logger.info("=" * 80)
        logger.info("POST-EXECUTION VERIFICATION")
        logger.info("=" * 80)

        dns_verification = self.audit_dns(dry_run=True)
        supabase_verification = self.audit_supabase(dry_run=True)

        return {
            'dns': dns_verification,
            'supabase': supabase_verification
        }

    def generate_report(
        self,
        dns_audit: Dict,
        supabase_audit: Dict,
        execution_results: Optional[Dict] = None
    ) -> str:
        """Generate final structured report.

        Args:
            dns_audit: DNS audit results
            supabase_audit: Supabase audit results
            execution_results: Optional execution results

        Returns:
            Formatted report string
        """
        logger.info("=" * 80)
        logger.info("STEP 7: FINAL REPORT")
        logger.info("=" * 80)

        report = []
        report.append("# InfraAuditor - Final Report")
        report.append("")
        report.append("## DNS (DigitalOcean)")
        report.append(f"- Issues Found: {dns_audit.get('issues_count', 0)}")
        report.append(f"- Commands Generated: {len(dns_audit.get('fix_commands', []))}")

        if execution_results:
            dns_exec = execution_results.get('dns', {})
            report.append(f"- Commands Executed: {dns_exec.get('executed_count', 0)}")
            report.append(f"- Success: {dns_exec.get('success_count', 0)}")
            report.append(f"- Failed: {dns_exec.get('failed_count', 0)}")

        report.append("")
        report.append("## Supabase")
        report.append(f"- Schema Issues: {supabase_audit.get('schema_issues', 0)}")
        report.append(f"- RLS Policy Issues: {supabase_audit.get('rls_issues', 0)}")
        report.append(f"- Function Issues: {supabase_audit.get('function_issues', 0)}")

        if execution_results:
            sb_exec = execution_results.get('supabase', {})
            report.append(f"- Migrations Applied: {sb_exec.get('migrations_applied', 0)}")
            report.append(f"- Edge Functions Deployed: {sb_exec.get('functions_deployed', 0)}")

        report.append("")
        report.append("## Pending Manual Steps")

        manual_steps = []
        manual_steps.extend(dns_audit.get('manual_steps', []))
        manual_steps.extend(supabase_audit.get('manual_steps', []))

        if manual_steps:
            for step in manual_steps:
                report.append(f"- {step}")
        else:
            report.append("- None")

        report.append("")
        report.append("## Unresolved Risks")

        risks = []
        risks.extend(dns_audit.get('risks', []))
        risks.extend(supabase_audit.get('risks', []))

        if risks:
            for risk in risks:
                report.append(f"- {risk}")
        else:
            report.append("- None")

        report_text = "\n".join(report)
        logger.info("\n" + report_text)

        return report_text

    def run(
        self,
        audit_only: bool = True,
        confirm_apply: bool = False,
        confirm_destructive: bool = False
    ):
        """Run the complete audit and fix workflow.

        Args:
            audit_only: If True, only run audit without generating fix plans
            confirm_apply: If True, apply fixes
            confirm_destructive: If True, allow destructive operations
        """
        try:
            # Step 1: Discover context
            context = self.discover_context()

            # Step 2: DNS Audit
            dns_audit = self.audit_dns(dry_run=True)

            # Step 3: DNS Fix Plan
            dns_commands = []
            if not audit_only:
                dns_commands = self.generate_dns_fix_plan(dns_audit)

            # Step 4: Supabase Audit
            supabase_audit = self.audit_supabase(dry_run=True)

            # Step 5: Supabase Fix Plan
            supabase_plan = {}
            if not audit_only:
                supabase_plan = self.generate_supabase_fix_plan(supabase_audit)

            # Step 6: Execute (if confirmed)
            execution_results = None
            if confirm_apply and not audit_only:
                execution_results = self.execute_fixes(
                    dns_commands,
                    supabase_plan,
                    confirm_apply=confirm_apply,
                    confirm_destructive=confirm_destructive
                )

                # Verify changes
                verification = self.verify_changes()
                logger.info("Post-execution verification complete")

            # Step 7: Generate Report
            report = self.generate_report(
                dns_audit,
                supabase_audit,
                execution_results
            )

            # Save report
            report_path = Path('infra_auditor_report.md')
            report_path.write_text(report)
            logger.info(f"Report saved to {report_path}")

        except Exception as e:
            logger.error(f"Error during audit: {e}", exc_info=True)
            raise


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description='InfraAuditor - DNS + Supabase Infrastructure Auditor',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run audit only (safe, read-only)
  python infra_auditor.py --audit-only

  # Run audit and generate fix plans
  python infra_auditor.py

  # Apply fixes (requires CONFIRM_APPLY)
  python infra_auditor.py --confirm-apply

  # Apply destructive fixes (requires CONFIRM_DESTRUCTIVE)
  python infra_auditor.py --confirm-apply --confirm-destructive

  # Use custom config file
  python infra_auditor.py --config my_infra_spec.yaml
        """
    )

    parser.add_argument(
        '--config',
        type=str,
        help='Path to infrastructure specification file'
    )

    parser.add_argument(
        '--audit-only',
        action='store_true',
        help='Run audit only, do not generate fix plans'
    )

    parser.add_argument(
        '--confirm-apply',
        action='store_true',
        help='Execute fixes (default: dry-run only)'
    )

    parser.add_argument(
        '--confirm-destructive',
        action='store_true',
        help='Allow destructive operations (deletes, drops, etc.)'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Safety check
    if args.confirm_apply:
        logger.warning("=" * 80)
        logger.warning("APPLYING CHANGES - This will modify your infrastructure!")
        logger.warning("=" * 80)

        if args.confirm_destructive:
            logger.warning("DESTRUCTIVE MODE ENABLED - Deletes and drops are allowed!")

    # Run the auditor
    auditor = InfraAuditor(config_path=args.config)
    auditor.run(
        audit_only=args.audit_only,
        confirm_apply=args.confirm_apply,
        confirm_destructive=args.confirm_destructive
    )


if __name__ == '__main__':
    main()
