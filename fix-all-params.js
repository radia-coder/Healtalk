const fs = require('fs');
const path = require('path');

// Files that need fixing
const files = [
  'src/app/api/messages/[appointmentId]/route.ts',
  'src/app/api/appointments/[id]/route.ts',
  'src/app/api/admin/psychologists/[id]/route.ts',
  'src/app/api/admin/users/[id]/route.ts',
  'src/app/api/admin/reviews/[id]/route.ts',
  'src/app/api/psychologists/[id]/route.ts',
  'src/app/api/blog/[id]/route.ts',
  'src/app/api/sessions/[sessionId]/join/route.ts',
  'src/app/api/sessions/[sessionId]/route.ts',
  'src/app/api/screening/[assessmentId]/route.ts',
];

console.log('🔧 Fixing Next.js 15 params issues...\n');

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipping ${filePath} (not found)`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Pattern 1: { params }: { params: { id: string } }
  if (content.match(/\{ params \}: \{ params: \{ (\w+): string \} \}/)) {
    const paramName = content.match(/\{ params \}: \{ params: \{ (\w+): string \} \}/)?.[1];

    // Replace function signature
    content = content.replace(
      /\{ params \}: \{ params: \{ (\w+): string \} \}/g,
      '{ params }: { params: Promise<{ $1: string }> }'
    );

    // Add await params at the start of the function
    content = content.replace(
      /(export async function \w+\([^)]+\) \{[\s\S]*?)(const session|const rateLimit|const csrfError|const \{ data|try \{)/,
      `$1const { ${paramName} } = await params;\n\n  $2`
    );

    // Replace params.id with just id
    content = content.replace(
      new RegExp(`params\\.${paramName}`, 'g'),
      paramName
    );

    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
  }
});

console.log('\n🎉 All files processed!');
