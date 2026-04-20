#!/usr/bin/env python3

"""Count component usage across uploaded/generated form JSON files."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


def iter_components(node: Any):
    """Yield every string value found in `component` keys recursively."""
    if isinstance(node, dict):
        component = node.get("component")
        if isinstance(component, str) and component.strip():
            yield component.strip()

        for value in node.values():
            yield from iter_components(value)
    elif isinstance(node, list):
        for item in node:
            yield from iter_components(item)


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def find_target_form_files(forms_dir: Path) -> list[Path]:
    """
    Find generated form files.

    Priority:
    1) Entries referenced by generated-forms.json
    2) Fallback to generated-*.json (excluding generated-forms.json)
    """
    registry_path = forms_dir / "generated-forms.json"
    if registry_path.exists():
        try:
            registry = read_json(registry_path)
            if isinstance(registry, list):
                from_registry: list[Path] = []
                for entry in registry:
                    if not isinstance(entry, dict):
                        continue

                    slug = entry.get("slug")
                    if not isinstance(slug, str) or not slug.strip():
                        continue

                    candidate = forms_dir / f"{slug}.json"
                    if candidate.exists():
                        from_registry.append(candidate)

                if from_registry:
                    return sorted(set(from_registry), key=lambda p: p.name)
        except Exception:
            pass

    return sorted(
        [
            p
            for p in forms_dir.glob("generated-*.json")
            if p.name != "generated-forms.json"
        ],
        key=lambda p: p.name,
    )


def analyze_files(files: list[Path]):
    total_counts: Counter[str] = Counter()
    forms_with_component: Counter[str] = Counter()
    per_form: dict[str, Counter[str]] = {}
    failures: list[tuple[Path, str]] = []

    for path in files:
        try:
            data = read_json(path)
            form_counts = Counter(iter_components(data))
            per_form[path.name] = form_counts
            total_counts.update(form_counts)
            for component in form_counts:
                forms_with_component[component] += 1
        except Exception as exc:
            failures.append((path, str(exc)))

    return total_counts, forms_with_component, per_form, failures


def print_report(
    forms_dir: Path,
    scanned_files: list[Path],
    total_counts: Counter[str],
    forms_with_component: Counter[str],
    per_form: dict[str, Counter[str]],
    failures: list[tuple[Path, str]],
):
    total_components = sum(total_counts.values())

    print(f"Forms directory: {forms_dir}")
    print(f"Forms analyzed: {len(scanned_files) - len(failures)} / {len(scanned_files)}")
    print(f"Total component instances: {total_components}")
    print()

    if not total_counts:
        print("No components found. Make sure files contain `component` fields.")
        return

    print("Overall component usage:")
    for component, count in total_counts.most_common():
        percent = (count / total_components * 100) if total_components else 0
        in_forms = forms_with_component.get(component, 0)
        print(f"- {component}: {count} ({percent:.1f}%), appears in {in_forms} form(s)")

    print()
    print("Per-form component summary:")
    for form_name in sorted(per_form):
        form_counts = per_form[form_name]
        if not form_counts:
            print(f"- {form_name}: no component entries")
            continue

        joined = ", ".join(f"{comp}={cnt}" for comp, cnt in form_counts.most_common())
        print(f"- {form_name}: {joined}")

    if failures:
        print()
        print("Failed to parse:")
        for path, error in failures:
            print(f"- {path.name}: {error}")


def write_json_output(
    output_path: Path,
    forms_dir: Path,
    scanned_files: list[Path],
    total_counts: Counter[str],
    forms_with_component: Counter[str],
    per_form: dict[str, Counter[str]],
    failures: list[tuple[Path, str]],
):
    payload = {
        "formsDirectory": str(forms_dir),
        "scannedFiles": [p.name for p in scanned_files],
        "analyzedForms": len(scanned_files) - len(failures),
        "failedFiles": [{"file": p.name, "error": error} for p, error in failures],
        "totalComponentInstances": sum(total_counts.values()),
        "componentUsage": dict(total_counts.most_common()),
        "componentFormCoverage": dict(forms_with_component.most_common()),
        "perForm": {
            form_name: dict(counter.most_common())
            for form_name, counter in sorted(per_form.items())
        },
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Count component usage from uploaded/generated form JSON files"
    )
    parser.add_argument(
        "--forms-dir",
        default="saved_digitalized_form",
        help="Directory containing generated form JSON files (default: saved_digitalized_form)",
    )
    parser.add_argument(
        "--output-json",
        default="",
        help="Optional path to write report as JSON",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    forms_dir = Path(args.forms_dir).resolve()

    if not forms_dir.exists() or not forms_dir.is_dir():
        print(f"Forms directory not found: {forms_dir}")
        return 1

    files = find_target_form_files(forms_dir)
    if not files:
        print(f"No generated form JSON files found under: {forms_dir}")
        return 1

    total_counts, forms_with_component, per_form, failures = analyze_files(files)
    print_report(
        forms_dir,
        files,
        total_counts,
        forms_with_component,
        per_form,
        failures,
    )

    if args.output_json:
        output_path = Path(args.output_json).resolve()
        write_json_output(
            output_path,
            forms_dir,
            files,
            total_counts,
            forms_with_component,
            per_form,
            failures,
        )
        print()
        print(f"JSON report written to: {output_path}")

    return 0 if len(files) > len(failures) else 2


if __name__ == "__main__":
    raise SystemExit(main())
