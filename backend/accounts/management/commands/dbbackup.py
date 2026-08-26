import os
import shutil
import subprocess
from datetime import datetime

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Back up the database to the backups/ directory.'

    def handle(self, *args, **options):
        backup_dir = settings.BASE_DIR / 'backups'
        backup_dir.mkdir(exist_ok=True)
        stamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        db = settings.DATABASES['default']

        if db['ENGINE'].endswith('sqlite3'):
            src = db['NAME']
            dst = backup_dir / f'db_{stamp}.sqlite3'
            shutil.copy2(src, dst)
            self.stdout.write(self.style.SUCCESS(f'Backup written to {dst}'))
            return

        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            self.stderr.write(self.style.ERROR(
                'DATABASE_URL is required to back up a non-SQLite database.'
            ))
            return

        dst = backup_dir / f'db_{stamp}.dump'
        command = ['pg_dump', database_url, '-Fc', '-f', str(dst)]
        try:
            subprocess.run(command, check=True, capture_output=True)
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(
                'pg_dump was not found. Install the PostgreSQL client tools.'
            ))
            return
        except subprocess.CalledProcessError as exc:
            self.stderr.write(self.style.ERROR(f'pg_dump failed: {exc.stderr.decode()[:400]}'))
            return
        self.stdout.write(self.style.SUCCESS(f'Backup written to {dst}'))
