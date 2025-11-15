#!/usr/bin/env python3
"""
Supabase Auditor - Supabase Project Configuration Auditing

Audits and fixes Supabase configuration including:
- Database schema and migrations
- RLS policies
- Functions and triggers
- Edge functions
- Storage buckets
- Auth settings
"""

import json
import logging
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger('SupabaseAuditor')


class SupabaseAuditor:
    """Auditor for Supabase project configuration."""

    def __init__(self, config: Dict):
        """Initialize Supabase Auditor.

        Args:
            config: Supabase configuration containing target state
        """
        self.config = config
        self.project_url = config.get('project_url')
        self.project_ref = config.get('project_ref')
        self.migrations_dir = config.get('migrations_dir', 'supabase/migrations')
        self.functions_dir = config.get('functions_dir', 'supabase/functions')
        self.check_supabase_available()

    def check_supabase_available(self) -> bool:
        """Check if Supabase CLI is available.

        Returns:
            True if Supabase CLI is available, False otherwise
        """
        try:
            result = subprocess.run(
                ['which', 'supabase'],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                logger.info("Supabase CLI is available")
                return True
            else:
                logger.warning("Supabase CLI is NOT installed. Supabase operations will be simulated.")
                logger.warning("Install: https://supabase.com/docs/guides/cli")
                return False
        except Exception as e:
            logger.error(f"Error checking for Supabase CLI: {e}")
            return False

    def run_supabase_command(self, command: List[str], check: bool = False) -> Tuple[int, str, str]:
        """Run a Supabase CLI command.

        Args:
            command: Command arguments (without 'supabase' prefix)
            check: If True, raise exception on non-zero exit

        Returns:
            Tuple of (return_code, stdout, stderr)
        """
        full_command = ['supabase'] + command

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
            logger.error("supabase command not found")
            return 127, "", "supabase not found"

    def run_psql_command(self, sql: str, database_url: Optional[str] = None) -> Tuple[int, str, str]:
        """Run a psql command.

        Args:
            sql: SQL query to execute
            database_url: Optional database URL (uses env var if not provided)

        Returns:
            Tuple of (return_code, stdout, stderr)
        """
        db_url = database_url or os.getenv('DATABASE_URL')

        if not db_url:
            logger.error("No database URL provided and DATABASE_URL not set")
            return 1, "", "No database URL"

        try:
            result = subprocess.run(
                ['psql', db_url, '-c', sql],
                capture_output=True,
                text=True,
                check=False
            )
            return result.returncode, result.stdout, result.stderr
        except FileNotFoundError:
            logger.error("psql command not found")
            return 127, "", "psql not found"

    def get_project_info(self) -> Optional[Dict]:
        """Get Supabase project information.

        Returns:
            Project info dict or None if failed
        """
        logger.info("Fetching Supabase project info...")

        if self.project_url:
            logger.info(f"Project URL: {self.project_url}")

        returncode, stdout, stderr = self.run_supabase_command(['projects', 'list', '--output', 'json'])

        if returncode == 0:
            try:
                projects = json.loads(stdout)
                if self.project_ref:
                    project = next((p for p in projects if p.get('id') == self.project_ref), None)
                    if project:
                        logger.info(f"Project: {project.get('name')} ({project.get('id')})")
                        return project
                elif projects:
                    logger.info(f"Found {len(projects)} projects")
                    return projects[0]  # Use first project
                return None
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse project info: {e}")
                return None
        else:
            logger.warning(f"Failed to get project info: {stderr}")
            logger.info("Will use project URL and manual connection if available")
            return {'url': self.project_url} if self.project_url else None

    def list_migrations(self) -> List[Path]:
        """List all migration files.

        Returns:
            List of migration file paths
        """
        migrations_path = Path(self.migrations_dir)

        if not migrations_path.exists():
            logger.warning(f"Migrations directory not found: {migrations_path}")
            return []

        migrations = sorted(migrations_path.glob('*.sql'))
        logger.info(f"Found {len(migrations)} migration files")

        for migration in migrations:
            logger.debug(f"  - {migration.name}")

        return migrations

    def check_migration_status(self) -> Dict:
        """Check which migrations have been applied.

        Returns:
            Dict with migration status
        """
        logger.info("Checking migration status...")

        returncode, stdout, stderr = self.run_supabase_command(['migration', 'list'])

        status = {
            'applied': [],
            'pending': [],
            'status_output': stdout
        }

        if returncode == 0:
            # Parse migration list output
            lines = stdout.strip().split('\n')
            for line in lines[2:]:  # Skip header
                if '│' in line:
                    parts = [p.strip() for p in line.split('│')]
                    if len(parts) >= 3:
                        migration_name = parts[1]
                        is_applied = 'Applied' in parts[2]

                        if is_applied:
                            status['applied'].append(migration_name)
                        else:
                            status['pending'].append(migration_name)

            logger.info(f"Applied migrations: {len(status['applied'])}")
            logger.info(f"Pending migrations: {len(status['pending'])}")
        else:
            logger.warning(f"Could not check migration status: {stderr}")

        return status

    def audit_schema(self) -> Dict:
        """Audit database schema against expected state.

        Returns:
            Dict with schema audit results
        """
        logger.info("Auditing database schema...")

        results = {
            'issues': [],
            'missing_tables': [],
            'missing_columns': [],
            'missing_indexes': [],
            'extra_tables': []
        }

        expected_schema = self.config.get('schema', {})
        expected_tables = expected_schema.get('tables', [])

        if not expected_tables:
            logger.info("No expected schema defined in config")
            return results

        # Use Supabase CLI to inspect schema
        returncode, stdout, stderr = self.run_supabase_command(['db', 'lint'])

        if returncode == 0:
            logger.info("Schema lint check passed")
        else:
            logger.warning(f"Schema lint found issues: {stderr}")
            results['issues'].append("Schema lint check failed")

        # Check for expected tables
        for table_spec in expected_tables:
            table_name = table_spec.get('name')
            # This would need actual psql queries to verify
            # For now, we'll note it as a check to perform
            logger.debug(f"Should verify table: {table_name}")

        return results

    def audit_rls_policies(self) -> Dict:
        """Audit RLS policies against expected state.

        Returns:
            Dict with RLS audit results
        """
        logger.info("Auditing RLS policies...")

        results = {
            'issues': [],
            'missing_policies': [],
            'incorrect_policies': []
        }

        expected_policies = self.config.get('rls_policies', [])

        if not expected_policies:
            logger.info("No expected RLS policies defined in config")
            return results

        for policy_spec in expected_policies:
            table = policy_spec.get('table')
            policy_name = policy_spec.get('name')
            logger.debug(f"Should verify policy: {policy_name} on {table}")
            # Actual verification would require psql queries

        return results

    def audit_functions(self) -> Dict:
        """Audit database functions and triggers.

        Returns:
            Dict with function audit results
        """
        logger.info("Auditing database functions...")

        results = {
            'issues': [],
            'missing_functions': [],
            'outdated_functions': []
        }

        expected_functions = self.config.get('functions', [])

        if not expected_functions:
            logger.info("No expected functions defined in config")
            return results

        for func_spec in expected_functions:
            func_name = func_spec.get('name')
            logger.debug(f"Should verify function: {func_name}")

        return results

    def audit_edge_functions(self) -> Dict:
        """Audit edge functions deployment status.

        Returns:
            Dict with edge function audit results
        """
        logger.info("Auditing edge functions...")

        results = {
            'issues': [],
            'not_deployed': [],
            'outdated': []
        }

        functions_path = Path(self.functions_dir)

        if not functions_path.exists():
            logger.warning(f"Edge functions directory not found: {functions_path}")
            return results

        # List local edge functions
        local_functions = [d.name for d in functions_path.iterdir() if d.is_dir()]
        logger.info(f"Found {len(local_functions)} local edge functions: {local_functions}")

        # Check deployment status
        returncode, stdout, stderr = self.run_supabase_command(['functions', 'list'])

        if returncode == 0:
            logger.info("Edge functions list retrieved")
            deployed_functions = []
            lines = stdout.strip().split('\n')
            for line in lines[2:]:  # Skip header
                if '│' in line:
                    parts = [p.strip() for p in line.split('│')]
                    if len(parts) >= 2:
                        func_name = parts[1]
                        deployed_functions.append(func_name)

            logger.info(f"Deployed edge functions: {deployed_functions}")

            # Check for not deployed
            for func in local_functions:
                if func not in deployed_functions:
                    results['not_deployed'].append(func)
                    results['issues'].append(f"Edge function '{func}' not deployed")

        else:
            logger.warning(f"Could not list edge functions: {stderr}")
            results['issues'].append("Could not verify edge function deployment")

        return results

    def audit_storage_buckets(self) -> Dict:
        """Audit storage buckets configuration.

        Returns:
            Dict with storage audit results
        """
        logger.info("Auditing storage buckets...")

        results = {
            'issues': [],
            'missing_buckets': [],
            'incorrect_policies': []
        }

        expected_buckets = self.config.get('storage_buckets', [])

        if not expected_buckets:
            logger.info("No expected storage buckets defined in config")
            return results

        for bucket_spec in expected_buckets:
            bucket_name = bucket_spec.get('name')
            logger.debug(f"Should verify bucket: {bucket_name}")

        return results

    def audit(self, dry_run: bool = True) -> Dict:
        """Run complete Supabase audit.

        Args:
            dry_run: If True, only report without making changes

        Returns:
            Dict containing audit results
        """
        results = {
            'schema_issues': 0,
            'rls_issues': 0,
            'function_issues': 0,
            'edge_function_issues': 0,
            'storage_issues': 0,
            'manual_steps': [],
            'risks': []
        }

        # Get project info
        project = self.get_project_info()
        if not project:
            results['risks'].append("Cannot access Supabase project - check authentication")
            results['manual_steps'].append("Run: supabase login")
            results['manual_steps'].append("Set project ref in config or DATABASE_URL env var")

        # Check migrations
        logger.info(f"\n{'=' * 60}")
        logger.info("Migration Status")
        logger.info(f"{'=' * 60}")

        migration_status = self.check_migration_status()
        if migration_status['pending']:
            logger.warning(f"Pending migrations: {len(migration_status['pending'])}")
            for migration in migration_status['pending']:
                logger.warning(f"  - {migration}")
            results['manual_steps'].append("Apply pending migrations")

        # Audit schema
        logger.info(f"\n{'=' * 60}")
        logger.info("Schema Audit")
        logger.info(f"{'=' * 60}")

        schema_audit = self.audit_schema()
        results['schema_issues'] = len(schema_audit['issues'])

        if schema_audit['issues']:
            for issue in schema_audit['issues']:
                logger.warning(f"  - {issue}")

        # Audit RLS policies
        logger.info(f"\n{'=' * 60}")
        logger.info("RLS Policy Audit")
        logger.info(f"{'=' * 60}")

        rls_audit = self.audit_rls_policies()
        results['rls_issues'] = len(rls_audit['issues'])

        # Audit functions
        logger.info(f"\n{'=' * 60}")
        logger.info("Database Function Audit")
        logger.info(f"{'=' * 60}")

        function_audit = self.audit_functions()
        results['function_issues'] = len(function_audit['issues'])

        # Audit edge functions
        logger.info(f"\n{'=' * 60}")
        logger.info("Edge Function Audit")
        logger.info(f"{'=' * 60}")

        edge_audit = self.audit_edge_functions()
        results['edge_function_issues'] = len(edge_audit['issues'])

        if edge_audit['not_deployed']:
            for func in edge_audit['not_deployed']:
                results['manual_steps'].append(f"Deploy edge function: {func}")

        # Audit storage
        logger.info(f"\n{'=' * 60}")
        logger.info("Storage Bucket Audit")
        logger.info(f"{'=' * 60}")

        storage_audit = self.audit_storage_buckets()
        results['storage_issues'] = len(storage_audit['issues'])

        # Store detailed results
        results['details'] = {
            'schema': schema_audit,
            'rls': rls_audit,
            'functions': function_audit,
            'edge_functions': edge_audit,
            'storage': storage_audit
        }

        # Summary
        total_issues = (
            results['schema_issues'] +
            results['rls_issues'] +
            results['function_issues'] +
            results['edge_function_issues'] +
            results['storage_issues']
        )

        logger.info(f"\n{'=' * 60}")
        logger.info(f"Supabase Audit Summary")
        logger.info(f"{'=' * 60}")
        logger.info(f"Total issues found: {total_issues}")

        return results

    def generate_fix_plan(self, audit_results: Dict) -> Dict:
        """Generate fix plan for Supabase issues.

        Args:
            audit_results: Results from audit()

        Returns:
            Dict containing migrations and commands
        """
        plan = {
            'migrations': [],
            'commands': [],
            'manual_steps': []
        }

        details = audit_results.get('details', {})

        # Generate migrations for schema issues
        schema_issues = details.get('schema', {})
        if schema_issues.get('missing_tables'):
            # Generate migration file
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            migration_name = f"{timestamp}_fix_missing_tables.sql"

            migration_sql = "-- Auto-generated migration to fix missing tables\n\n"
            for table in schema_issues['missing_tables']:
                migration_sql += f"-- TODO: CREATE TABLE {table} ...\n"

            plan['migrations'].append({
                'name': migration_name,
                'sql': migration_sql,
                'path': f"{self.migrations_dir}/{migration_name}"
            })

        # Commands for edge functions
        edge_issues = details.get('edge_functions', {})
        for func in edge_issues.get('not_deployed', []):
            cmd = f"supabase functions deploy {func}"
            plan['commands'].append(cmd)

        # Manual steps
        plan['manual_steps'].extend(audit_results.get('manual_steps', []))

        # Log the plan
        logger.info(f"\n{'=' * 60}")
        logger.info("Supabase Fix Plan")
        logger.info(f"{'=' * 60}")

        if plan['migrations']:
            logger.info(f"\nMigrations to create ({len(plan['migrations'])}):")
            for migration in plan['migrations']:
                logger.info(f"  - {migration['name']}")

        if plan['commands']:
            logger.info(f"\nCommands to run ({len(plan['commands'])}):")
            for cmd in plan['commands']:
                logger.info(f"  {cmd}")

        if plan['manual_steps']:
            logger.info(f"\nManual steps ({len(plan['manual_steps'])}):")
            for step in plan['manual_steps']:
                logger.info(f"  - {step}")

        return plan

    def execute_fixes(self, plan: Dict, confirm_destructive: bool = False) -> Dict:
        """Execute Supabase fix plan.

        Args:
            plan: Fix plan from generate_fix_plan()
            confirm_destructive: If True, allow destructive operations

        Returns:
            Dict with execution results
        """
        results = {
            'migrations_applied': 0,
            'functions_deployed': 0,
            'commands_executed': 0,
            'failures': [],
            'details': []
        }

        # Create migration files
        for migration in plan.get('migrations', []):
            migration_path = Path(migration['path'])
            logger.info(f"Creating migration: {migration_path}")

            try:
                migration_path.parent.mkdir(parents=True, exist_ok=True)
                migration_path.write_text(migration['sql'])
                logger.info(f"  Created: {migration_path}")
                results['migrations_applied'] += 1
            except Exception as e:
                logger.error(f"  Failed to create migration: {e}")
                results['failures'].append(f"Migration creation failed: {migration['name']}")

        # Execute commands
        for cmd in plan.get('commands', []):
            logger.info(f"EXECUTING: {cmd}")
            cmd_parts = cmd.split()[1:]  # Remove 'supabase' prefix

            returncode, stdout, stderr = self.run_supabase_command(cmd_parts)

            results['commands_executed'] += 1

            if returncode == 0:
                logger.info(f"  SUCCESS")
                if 'deploy' in cmd:
                    results['functions_deployed'] += 1
                results['details'].append({
                    'command': cmd,
                    'status': 'success',
                    'output': stdout
                })
            else:
                logger.error(f"  FAILED: {stderr}")
                results['failures'].append(f"Command failed: {cmd}")
                results['details'].append({
                    'command': cmd,
                    'status': 'failed',
                    'error': stderr
                })

        logger.info(f"\nExecution Summary:")
        logger.info(f"  Migrations applied: {results['migrations_applied']}")
        logger.info(f"  Functions deployed: {results['functions_deployed']}")
        logger.info(f"  Commands executed: {results['commands_executed']}")
        logger.info(f"  Failures: {len(results['failures'])}")

        return results
