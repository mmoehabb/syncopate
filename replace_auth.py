import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # If it doesn't use auth(), skip
    if "auth()" not in content:
        return

    # Skip the auth setup file and cli route which needs actual session
    if "src/lib/auth.ts" in filepath or "cli/route.ts" in filepath:
        return

    # Replace import
    if "import { auth } from" in content:
        content = content.replace("import { auth } from \"@/lib/auth\";", "import { getSessionOrPat } from \"@/lib/auth\";")

    # Replace usages
    content = re.sub(r'const session = await auth\(\);\s+if \(!session\?\.user\?\.id\) {', 'const userId = await getSessionOrPat();\n\n  if (!userId) {', content)

    # Replace session.user.id with userId
    content = content.replace("session.user.id", "userId")
    # Some files use session?.user?.id in the check but session.user.id later, both are caught.
    # Some might use session.user.id in the error message or other places.

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('apps/web/src/app/api'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
