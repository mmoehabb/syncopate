import re

with open('apps/web/src/lib/command-registry.ts', 'r') as f:
    content = f.read()

content = content.replace('"add-member"', '"invite-member"')
content = content.replace('name: "add-member",', 'name: "invite-member",')
content = content.replace('/add-member', '/invite-member')
content = content.replace('Add a member to a board', 'Invite a member to a board')

with open('apps/web/src/lib/command-registry.ts', 'w') as f:
    f.write(content)

with open('apps/web/src/hooks/use-command-bar.ts', 'r') as f:
    content = f.read()

content = content.replace('"add-member",', '"invite-member",\n      "leave-board",')

with open('apps/web/src/hooks/use-command-bar.ts', 'w') as f:
    f.write(content)
