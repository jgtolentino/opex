#!/usr/bin/env python3
"""
embedding_audit.py
CLI audit tool for Finance RAG embedding sources

Usage:
  python scripts/embedding_audit.py --status stale
  python scripts/embedding_audit.py --export report.json
  python scripts/embedding_audit.py --health
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from tabulate import tabulate


def get_db_connection():
    """Get PostgreSQL connection from environment"""
    postgres_url = os.environ.get("POSTGRES_URL")
    if not postgres_url:
        print("Error: POSTGRES_URL environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        conn = psycopg2.connect(postgres_url, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)


def get_sources_by_status(conn, status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get sources filtered by status"""
    cursor = conn.cursor()

    if status:
        cursor.execute(
            """
            SELECT id, source_url, doc_type, form, status, authority_rank,
                   last_crawled_at, last_embedded_at, failure_count,
                   last_error, created_at
            FROM embedding_sources
            WHERE status = %s
            ORDER BY authority_rank DESC, created_at ASC
            """,
            (status,),
        )
    else:
        cursor.execute(
            """
            SELECT id, source_url, doc_type, form, status, authority_rank,
                   last_crawled_at, last_embedded_at, failure_count,
                   last_error, created_at
            FROM embedding_sources
            ORDER BY status, authority_rank DESC, created_at ASC
            """
        )

    return cursor.fetchall()


def get_stale_sources(conn, staleness_days: int = 30) -> List[Dict[str, Any]]:
    """Get sources not crawled within staleness threshold"""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, source_url, doc_type, form, status, authority_rank,
               last_crawled_at, last_embedded_at,
               NOW() - last_crawled_at AS staleness
        FROM embedding_sources
        WHERE last_crawled_at < NOW() - INTERVAL '%s days'
        ORDER BY last_crawled_at ASC
        """,
        (staleness_days,),
    )

    return cursor.fetchall()


def get_failed_sources(conn) -> List[Dict[str, Any]]:
    """Get sources with failures"""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, source_url, doc_type, form, status, authority_rank,
               failure_count, last_error, last_crawled_at
        FROM embedding_sources
        WHERE failure_count > 0
        ORDER BY failure_count DESC, authority_rank DESC
        """
    )

    return cursor.fetchall()


def get_health_metrics(conn) -> Dict[str, Any]:
    """Get health metrics from database"""
    cursor = conn.cursor()
    cursor.execute("SELECT get_embedding_health() AS metrics")
    result = cursor.fetchone()
    return result["metrics"] if result else {}


def calculate_coverage(conn) -> Dict[str, Any]:
    """Calculate embedding coverage statistics"""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            COUNT(*) AS total_sources,
            COUNT(*) FILTER (WHERE status = 'embedded') AS embedded_count,
            COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
            COUNT(*) FILTER (WHERE status = 'stale') AS stale_count,
            ROUND(
                (COUNT(*) FILTER (WHERE status = 'embedded')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
                2
            ) AS coverage_percentage
        FROM embedding_sources
        """
    )

    return cursor.fetchone()


def estimate_next_crawls(conn, limit: int = 10) -> List[Dict[str, Any]]:
    """Estimate when next sources will be crawled"""
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT
            source_url,
            doc_type,
            form,
            authority_rank,
            last_crawled_at,
            CASE
                WHEN last_crawled_at IS NULL THEN 'Never crawled'
                ELSE (last_crawled_at + INTERVAL '30 days')::TEXT
            END AS next_crawl_estimate
        FROM embedding_sources
        WHERE status IN ('embedded', 'crawled')
        ORDER BY last_crawled_at ASC NULLS FIRST
        LIMIT %s
        """,
        (limit,),
    )

    return cursor.fetchall()


def print_sources_table(sources: List[Dict[str, Any]], title: str):
    """Print sources in tabular format"""
    if not sources:
        print(f"\n{title}: No sources found\n")
        return

    print(f"\n{title} ({len(sources)} sources)")
    print("=" * 100)

    # Prepare table data
    table_data = []
    for source in sources:
        url_short = source["source_url"][:60] + "..." if len(source["source_url"]) > 60 else source["source_url"]
        table_data.append(
            [
                source.get("doc_type", ""),
                source.get("form", "-"),
                source.get("status", ""),
                source.get("authority_rank", "-"),
                source.get("failure_count", 0),
                url_short,
            ]
        )

    headers = ["Type", "Form", "Status", "Authority", "Failures", "URL"]
    print(tabulate(table_data, headers=headers, tablefmt="grid"))
    print()


def export_report(conn, output_file: str, format: str = "json"):
    """Export comprehensive report"""
    report = {
        "generated_at": datetime.now().isoformat(),
        "health_metrics": get_health_metrics(conn),
        "coverage": dict(calculate_coverage(conn)),
        "sources": {
            "all": [dict(s) for s in get_sources_by_status(conn)],
            "stale": [dict(s) for s in get_stale_sources(conn)],
            "failed": [dict(s) for s in get_failed_sources(conn)],
        },
        "next_crawls": [dict(s) for s in estimate_next_crawls(conn)],
    }

    # Convert datetime objects to ISO format strings
    def serialize_datetime(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    if format == "json":
        with open(output_file, "w") as f:
            json.dump(report, f, indent=2, default=serialize_datetime)
        print(f"✅ Report exported to {output_file}")
    elif format == "csv":
        import csv

        with open(output_file, "w", newline="") as f:
            if report["sources"]["all"]:
                fieldnames = report["sources"]["all"][0].keys()
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for source in report["sources"]["all"]:
                    writer.writerow({k: str(v) for k, v in source.items()})
        print(f"✅ Report exported to {output_file}")
    else:
        print(f"❌ Unsupported format: {format}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Audit Finance RAG embedding sources")
    parser.add_argument("--status", type=str, help="Filter by status (pending, embedded, failed, stale)")
    parser.add_argument("--stale", action="store_true", help="Show stale sources (>30 days)")
    parser.add_argument("--failed", action="store_true", help="Show failed sources")
    parser.add_argument("--health", action="store_true", help="Show health metrics")
    parser.add_argument("--coverage", action="store_true", help="Show coverage statistics")
    parser.add_argument("--next-crawls", action="store_true", help="Estimate next crawl times")
    parser.add_argument("--export", type=str, help="Export report to file (JSON or CSV)")
    parser.add_argument("--format", type=str, default="json", help="Export format (json, csv)")

    args = parser.parse_args()

    conn = get_db_connection()

    try:
        if args.export:
            export_report(conn, args.export, args.format)
            return

        if args.health or not any([args.status, args.stale, args.failed, args.coverage, args.next_crawls]):
            print("\n🏥 Health Metrics")
            print("=" * 100)
            metrics = get_health_metrics(conn)
            print(json.dumps(metrics, indent=2))
            print()

        if args.coverage or not any([args.status, args.stale, args.failed, args.next_crawls]):
            print("\n📊 Coverage Statistics")
            print("=" * 100)
            coverage = calculate_coverage(conn)
            print(f"Total Sources: {coverage['total_sources']}")
            print(f"Embedded: {coverage['embedded_count']}")
            print(f"Pending: {coverage['pending_count']}")
            print(f"Failed: {coverage['failed_count']}")
            print(f"Stale: {coverage['stale_count']}")
            print(f"Coverage: {coverage['coverage_percentage']}%")
            print()

        if args.status:
            sources = get_sources_by_status(conn, args.status)
            print_sources_table(sources, f"Sources with status: {args.status}")

        if args.stale:
            sources = get_stale_sources(conn)
            print_sources_table(sources, "Stale Sources (>30 days since last crawl)")

        if args.failed:
            sources = get_failed_sources(conn)
            print_sources_table(sources, "Failed Sources")

        if args.next_crawls:
            print("\n🔮 Next Crawl Estimates (Top 10)")
            print("=" * 100)
            estimates = estimate_next_crawls(conn)
            table_data = []
            for est in estimates:
                url_short = est["source_url"][:50] + "..." if len(est["source_url"]) > 50 else est["source_url"]
                table_data.append(
                    [
                        est["doc_type"],
                        est["form"] or "-",
                        est["authority_rank"],
                        url_short,
                        est["next_crawl_estimate"],
                    ]
                )
            headers = ["Type", "Form", "Authority", "URL", "Next Crawl"]
            print(tabulate(table_data, headers=headers, tablefmt="grid"))
            print()

    finally:
        conn.close()


if __name__ == "__main__":
    main()
