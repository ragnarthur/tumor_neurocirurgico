#!/usr/bin/env python
import os
import sys


def main() -> None:
    # Warn if the local .venv exists but this process isn't using it.
    project_root = os.path.dirname(os.path.dirname(__file__))
    expected_venv = os.path.join(project_root, ".venv")
    expected_python = os.path.join(expected_venv, "bin", "python")
    using_expected = (
        os.environ.get("VIRTUAL_ENV") == expected_venv
        or os.path.realpath(sys.executable) == os.path.realpath(expected_python)
    )
    if os.path.isdir(expected_venv) and not using_expected:
        print(
            "WARNING: .venv detected, but current Python is not .venv. "
            "Activate it: `source .venv/bin/activate`",
            file=sys.stderr,
        )
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
