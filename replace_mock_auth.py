import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    if "mock.module(\"@/lib/auth\", () => ({" not in content:
        return

    content = content.replace("auth: mockAuth,", "auth: mockAuth,\n  getSessionOrPat: mock().mockImplementation(async () => {\n    try {\n      const s = await mockAuth();\n      return s?.user?.id;\n    } catch {\n      return null;\n    }\n  }),")
    content = content.replace("auth: mock().mockImplementation(async () => {", "getSessionOrPat: mock().mockImplementation(async () => {\n      return \"test-user-id\";\n    }),\n  auth: mock().mockImplementation(async () => {")

    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('apps/web/__tests__'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            process_file(os.path.join(root, file))
